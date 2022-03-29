/* global exports process console __dirname Buffer */
/* eslint-disable no-console */
'use strict';

// Пакеты, использующиеся при обработке
const {series, parallel, src, dest, watch, lastRun} = require('gulp');
const fs = require('fs');
const plumber = require('gulp-plumber');
const del = require('del');
const pug = require('gulp-pug');
const through2 = require('through2');
const rename = require('gulp-rename');
const getClassesFromHtml = require('get-classes-from-html');
const browserSync = require('browser-sync').create();
const debug = require('gulp-debug');
const sass = require('gulp-sass');
const webpackStream = require('webpack-stream');
const buffer = require('vinyl-buffer');
const postcss = require('gulp-postcss');
const autoprefixer = require("autoprefixer");
const mqpacker = require("css-mqpacker");
const atImport = require("postcss-import");
const csso = require('gulp-csso');
const inlineSVG = require('postcss-inline-svg');
const cpy = require('cpy');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');
const imagemin = require('gulp-imagemin');
const prettyHtml = require('gulp-pretty-html');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');
const ghpages = require('gh-pages');
const path = require('path');

// Глобальные настройки этого запуска
const buildLibrary = process.env.BUILD_LIBRARY || false;
const mode = process.env.MODE || 'development';
const nth = {};
nth.config = require('./config.js');
nth.blocksFromHtml = Object.create(nth.config.alwaysAddBlocks); // блоки из конфига сразу добавим в список блоков
nth.scssImportsList = []; // список импортов стилей
const dir = nth.config.dir;

// Сообщение для компилируемых файлов
let doNotEditMsg = '\n ВНИМАНИЕ! Этот файл генерируется автоматически.\n Любые изменения этого файла будут потеряны при следующей компиляции.\n Любое изменение проекта без возможности компиляции ДОЛЬШЕ И ДОРОЖЕ в 2-5 раз.\n\n';

// Настройки pug-компилятора
let pugOption = {
  //data: {repoUrl: 'https://github.com/nicothin/NTH-start-project',},
  filters: {'show-code': filterShowCode,},
};

// Настройки бьютификатора
let prettyOption = {
  indent_size: 2,
  indent_char: ' ',
  unformatted: ['code', 'em', 'strong', 'span', 'i', 'b', 'br', 'script'],
  content_unformatted: [],
};

// Список и настройки плагинов postCSS
let postCssPlugins = [
  autoprefixer({grid: true}),
  mqpacker({
    sort: true
  }),
  atImport(),
  inlineSVG(),
];

//Формируем импорт миксинов блоков(блоков в которых есть файлы pug)
function writePugMixinsFile(cb) {
  let allBlocksWithPugFiles = getDirectories('pug');//Получаем имена папок блоков в которых есть фалы pug
  let pugMixins = '//-' + doNotEditMsg.replace(/\n /gm, '\n  ');
  allBlocksWithPugFiles.forEach(function (blockName) {
    pugMixins += `include ${dir.blocks.replace(dir.src, '../')}${blockName}/${blockName}.pug\n`;//Формируем сроки includ с файлами pug
  });
  fs.writeFileSync(`${dir.src}pug/mixins.pug`, pugMixins);//Сохраняем строки с инклудами в каталов
  cb();
}

exports.writePugMixinsFile = writePugMixinsFile;

//Компилирует pug попутно улучшая html и выбирая классы и записывая их в blocksFromHtml
function compilePug() {
  const fileList = [
    `${dir.src}pages/**/*.pug`
  ];
  if (!buildLibrary) fileList.push(`!${dir.src}pages/blocks-demo.pug`);
  return src(fileList)
    .pipe(plumber({//Игнорируем ошибки
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(debug({title: 'Compiles '}))//Дебажим gulp(в консоле появляется title и данные )
    .pipe(pug(pugOption))//Компилируем pug
    .pipe(prettyHtml(prettyOption))//Украшаем html
    .pipe(replace(/^(\s*)(<button.+?>)(.*)(<\/button>)/gm, '$1$2\n$1  $3\n$1$4'))//Украшаем вывод для buton
    .pipe(replace(/^( *)(<.+?>)(<script>)([\s\S]*)(<\/script>)/gm, '$1$2\n$1$3\n$4\n$1$5\n'))//script без аргументов
    .pipe(replace(/^( *)(<.+?>)(<script\s+src.+>)(?:[\s\S]*)(<\/script>)/gm, '$1$2\n$1$3$4'))//script с аргументами
    .pipe(through2.obj(getClassesToBlocksList))//пересылаем html без изменений попутно записав классы в nth.blocksFromHtml
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(dest(dir.build));
}

exports.compilePug = compilePug;

//Компилтрует только изменнные с последней компиляции файлы
function compilePugFast() {
  const fileList = [
    `${dir.src}pages/**/*.pug`
  ];
  if (!buildLibrary) fileList.push(`!${dir.src}pages/blocks-demo.pug`);
  return src(fileList, {since: lastRun(compilePugFast)})//Выбирает файлы только измененные с последнего раза удачного выполнения  переданной задачи
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(debug({title: 'Compiles '}))
    .pipe(pug(pugOption))
    .pipe(prettyHtml(prettyOption))
    .pipe(replace(/^(\s*)(<button.+?>)(.*)(<\/button>)/gm, '$1$2\n$1  $3\n$1$4'))
    .pipe(replace(/^( *)(<.+?>)(<script>)([\s\S]*)(<\/script>)/gm, '$1$2\n$1$3\n$4\n$1$5\n'))
    .pipe(replace(/^( *)(<.+?>)(<script\s+src.+>)(?:[\s\S]*)(<\/script>)/gm, '$1$2\n$1$3$4'))
    .pipe(through2.obj(getClassesToBlocksList))
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(dest(dir.build));
}

exports.compilePugFast = compilePugFast;

//Копирует файлы по шаблону из конфигурации в каталог из конфигурации
function copyAssets(cb) {
  for (let item in nth.config.addAssets) {
    let dest = `${dir.build}${nth.config.addAssets[item]}`;
    cpy(item, dest);
  }
  cb();
}

exports.copyAssets = copyAssets;

//Выбирает картинки из включенных блоков и копирует их в build
function copyImg(cb) {
  let copiedImages = [];
  nth.blocksFromHtml.forEach(function (block) {
    let src = `${dir.blocks}${block}/img`;
    if (fileExist(src)) copiedImages.push(`${src}/*.{png,jpg,jpeg,svg}`);
  });
  nth.config.alwaysAddBlocks.forEach(function (block) {
    let src = `${dir.blocks}${block}/img`;
    if (fileExist(src)) copiedImages.push(`${src}/*.{png,jpg,jpeg,svg}`);
  });
  if (copiedImages.length) {
    (async () => {
      await cpy(copiedImages, `${dir.build}img`);
      cb();
    })();
  } else {
    cb();
  }
}

exports.copyImg = copyImg;


function generateSvgSprite(cb) {
  let spriteSvgPath = `${dir.blocks}sprite-svg/svg/`;
  if (nth.config.alwaysAddBlocks.indexOf('sprite-svg') > -1 && fileExist(spriteSvgPath)) {
    return src(spriteSvgPath + '*.svg')
      .pipe(svgmin(function () {
        return {plugins: [{cleanupIDs: {minify: true}}]}
      }))
      .pipe(svgstore({inlineSvg: true}))
      .pipe(rename('sprite.svg'))
      .pipe(dest(`${dir.blocks}sprite-svg/img/`));
  } else {
    cb();
  }
}

exports.generateSvgSprite = generateSvgSprite;


function generatePngSprite(cb) {
  let spritePngPath = `${dir.blocks}sprite-png/png/`;
  if (nth.config.alwaysAddBlocks.indexOf('sprite-png') > -1 && fileExist(spritePngPath)) {
    del(`${dir.blocks}sprite-png/img/*.png`);
    let fileName = 'sprite-' + Math.random().toString().replace(/[^0-9]/g, '') + '.png';
    let spriteData = src(spritePngPath + '*.png')
      .pipe(spritesmith({
        imgName: fileName,
        cssName: 'sprite-png.scss',
        padding: 4,
        imgPath: '../img/' + fileName
      }));
    let imgStream = spriteData.img
      .pipe(buffer())
      .pipe(imagemin([imagemin.optipng({optimizationLevel: 5})]))
      .pipe(dest(`${dir.blocks}sprite-png/img/`));
    let cssStream = spriteData.css
      .pipe(dest(`${dir.blocks}sprite-png/`));
    return merge(imgStream, cssStream);
  } else {
    cb();
  }
}

exports.generatePngSprite = generatePngSprite;

//Создает файл иморта стилей
function writeSassImportsFile(cb) {
  const newScssImportsList = [];
  nth.config.addStyleBefore.forEach(function (src) {//Сначала из секци addStyleBefore
    newScssImportsList.push(src);
  });
  nth.config.alwaysAddBlocks.forEach(function (blockName) {//Потом из секции alwaysAddBlocks
    if (fileExist(`${dir.blocks}${blockName}/${blockName}.scss`)) newScssImportsList.push(`${dir.blocks}${blockName}/${blockName}.scss`);
  });
  let allBlocksWithScssFiles = getDirectories('scss');//Выбираем все блоки  с scss файлами
  allBlocksWithScssFiles.forEach(function (blockWithScssFile) {//Выбираем из всех блоков только те которые импортировались с pug и которые еще не добавлены
    let url = `${dir.blocks}${blockWithScssFile}/${blockWithScssFile}.scss`;
    if (nth.blocksFromHtml.indexOf(blockWithScssFile) == -1) return;
    if (newScssImportsList.indexOf(url) > -1) return;
    newScssImportsList.push(url);
  });
  nth.config.addStyleAfter.forEach(function (src) {//Добавляем стили addStyleAfter
    newScssImportsList.push(src);
  });
  let diff = getArraysDiff(newScssImportsList, nth.scssImportsList);//Выбираем отличия между только что добавленными стилями и стилями добавленными в прошлый раз
  if (diff.length) {//Если отличаются формируем заново список импортов стилей
    let msg = `\n/*!*${doNotEditMsg.replace(/\n /gm, '\n * ').replace(/\n\n$/, '\n */\n\n')}`;
    let styleImports = msg;
    newScssImportsList.forEach(function (src) {
      styleImports += `@import "${src}";\n`;
    });
    styleImports += msg;
    fs.writeFileSync(`${dir.src}scss/style.scss`, styleImports);//Записываем его
    console.log('---------- Write new style.scss');
    nth.scssImportsList = newScssImportsList;// и присваеваем  предыдущему списку
  }
  cb();
}

exports.writeSassImportsFile = writeSassImportsFile;

//Компилируем список стилей
function compileSass() {
  const fileList = [
    `${dir.src}scss/style.scss`,//Выбираем список стилей созданных динамически
  ];//Если нужно билдить библиотеки - добавить в список импорта внешнии библиотеки
  if (buildLibrary) fileList.push(`${dir.blocks}blocks-library/blocks-library.scss`);
  return src(fileList, {sourcemaps: true})
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(debug({title: 'Compiles:'}))
    .pipe(sass({includePaths: [__dirname + '/', 'node_modules']}))//Говорит что нужно просматривать node_modules для разрешения непонятных импортов
    .pipe(postcss(postCssPlugins))
    .pipe(csso({
      restructure: false,
    }))
    .pipe(dest(`${dir.build}/css`, {sourcemaps: mode === 'development' ? '.' : false}))
    .pipe(browserSync.stream());
}

exports.compileSass = compileSass;

//Создается entry.js (точка входа) в которую пишем required из блоков настройки
function writeJsRequiresFile(cb) {
  const jsRequiresList = [];
  nth.config.addJsBefore.forEach(function (src) {//addJsBefore
    jsRequiresList.push(src);
  });
  const allBlocksWithJsFiles = getDirectories('js');//Выбираем все компоненты (блоки с файлами js)
  allBlocksWithJsFiles.forEach(function (blockName) {//Если блок с списке alwaysAddBlocks
    if (nth.config.alwaysAddBlocks.indexOf(blockName) == -1) return;//Если блок из секции alwaysAddBlocks не существует - ничего не делать
    jsRequiresList.push(`../blocks/${blockName}/${blockName}.js`)//иначе добавить
  });
  allBlocksWithJsFiles.forEach(function (blockName) {//Если блок среди добавленных blocksFromHtml
    let src = `../blocks/${blockName}/${blockName}.js`
    if (nth.blocksFromHtml.indexOf(blockName) == -1) return;
    if (jsRequiresList.indexOf(src) > -1) return;
    jsRequiresList.push(src);
  });
  nth.config.addJsAfter.forEach(function (src) {//Добавить из секции addJsAfter
    jsRequiresList.push(src);
  });//Формируем импорты
  let msg = `\n/*!*${doNotEditMsg.replace(/\n /gm, '\n * ').replace(/\n\n$/, '\n */\n\n')}`;
  let jsRequires = msg + '/* global require */\n\n';
  jsRequiresList.forEach(function (src) {
    jsRequires += `require('${src}');\n`;
  });
  jsRequires += msg;
  fs.writeFileSync(`${dir.src}js/entry.js`, jsRequires);//Сохраняем их
  console.log('---------- Write new entry.js');
  cb();
}

exports.writeJsRequiresFile = writeJsRequiresFile;

//Билдим js
function buildJs() {
  const entryList = {
    'bundle': `./${dir.src}js/entry.js`,
  };
  //Если стоит настройка формировать библиотеку то добавляем импорты из блока библиотеки
  if (buildLibrary) entryList['blocks-library'] = `./${dir.blocks}blocks-library/blocks-library.js`;
  return src(`${dir.src}js/entry.js`)
    .pipe(plumber())
    .pipe(webpackStream({
      mode: mode,
      entry: entryList,
      devtool: 'inline-source-map',
      output: {
        filename: '[name].js',
      },
      resolve: {
        alias: {
          Utils: path.resolve(__dirname, 'src/js/utils/'),
        },
      },
      module: {
        rules: [
          {
            test: /\.(js)$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
            query: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      // externals: {
      //   jquery: 'jQuery'
      // }
    }))
    .pipe(dest(`${dir.build}js`));
}

exports.buildJs = buildJs;

//Удаляет все содержимое в build кроме readmi.md
function clearBuildDir() {
  return del([
    `${dir.build}**/*`,
    `!${dir.build}readme.md`,
  ]);
}

exports.clearBuildDir = clearBuildDir;

//Перезагрузить браузер
function reload(done) {
  browserSync.reload();
  done();
}

function deploy(cb) {
  ghpages.publish(path.join(process.cwd(), dir.build), cb);
}

exports.deploy = deploy;


function serve() {

  browserSync.init({
    server: dir.build,
    port: 8080,
    startPath: 'index.html',
    open: false,
    notify: false,
  });

  // Страницы: изменение, добавление
  watch([`${dir.src}pages/**/*.pug`], {events: ['change', 'add'], delay: 100}, series(
    compilePugFast,
    parallel(writeSassImportsFile, writeJsRequiresFile),
    parallel(compileSass, buildJs),
    reload
  ));

  // Страницы: удаление
  watch([`${dir.src}pages/**/*.pug`], {delay: 100})
    // TODO попробовать с events: ['unlink']
    .on('unlink', function (path) {
      let filePathInBuildDir = path.replace(`${dir.src}pages/`, dir.build).replace('.pug', '.html');
      fs.unlink(filePathInBuildDir, (err) => {
        if (err) throw err;
        console.log(`---------- Delete:  ${filePathInBuildDir}`);
      });
    });

  // Разметка Блоков: изменение
  watch([`${dir.blocks}**/*.pug`], {events: ['change'], delay: 100}, series(
    compilePug,
    reload
  ));

  // Разметка Блоков: добавление
  watch([`${dir.blocks}**/*.pug`], {events: ['add'], delay: 100}, series(
    writePugMixinsFile,
    compilePug,
    reload
  ));

  // Разметка Блоков: удаление
  watch([`${dir.blocks}**/*.pug`], {events: ['unlink'], delay: 100}, writePugMixinsFile);

  // Шаблоны pug: все события
  watch([`${dir.src}pug/**/*.pug`, `!${dir.src}pug/mixins.pug`], {delay: 100}, series(
    compilePug,
    parallel(writeSassImportsFile, writeJsRequiresFile),
    parallel(compileSass, buildJs),
    reload,
  ));

  // Стили Блоков: изменение
  watch([`${dir.blocks}**/*.scss`], {events: ['change'], delay: 100}, series(
    compileSass,
  ));

  // Стили Блоков: добавление
  watch([`${dir.blocks}**/*.scss`], {events: ['add'], delay: 100}, series(
    writeSassImportsFile,
    compileSass,
  ));

  // Стилевые глобальные файлы: все события
  watch([`${dir.src}scss/**/*.scss`, `!${dir.src}scss/style.scss`], {events: ['all'], delay: 100}, series(
    compileSass,
  ));

  // Скриптовые глобальные файлы: все события
  watch([`${dir.src}js/**/*.js`, `!${dir.src}js/entry.js`, `${dir.blocks}**/*.js`], {
    events: ['all'],
    delay: 100
  }, series(
    writeJsRequiresFile,
    buildJs,
    reload
  ));

  // Картинки: все события
  watch([`${dir.blocks}**/img/*.{jpg,jpeg,png,gif,svg,webp}`], {events: ['all'], delay: 100}, series(copyImg, reload));

  // Спрайт SVG
  watch([`${dir.blocks}sprite-svg/svg/*.svg`], {events: ['all'], delay: 100}, series(
    generateSvgSprite,
    copyImg,
    reload,
  ));

  // Спрайт PNG
  watch([`${dir.blocks}sprite-png/png/*.png`], {events: ['all'], delay: 100}, series(
    generatePngSprite,
    copyImg,
    compileSass,
    reload,
  ));
}


exports.build = series(
  parallel(clearBuildDir, writePugMixinsFile),
  parallel(compilePugFast, copyAssets, generateSvgSprite, generatePngSprite),
  parallel(copyImg, writeSassImportsFile, writeJsRequiresFile),
  parallel(compileSass, buildJs),
);


exports.default = series(
  parallel(clearBuildDir, writePugMixinsFile),//Очищаем build и формируем import mixins
  parallel(compilePugFast, copyAssets, generateSvgSprite, generatePngSprite),//Компилируем pug ,копируем  assets, конвертируем картинки
  parallel(copyImg, writeSassImportsFile, writeJsRequiresFile),//Копируем картинки включенных блоков и создаем файлы импортов стилей и скриптов
  parallel(compileSass, buildJs),//Компилируем файлы стилей и шртфтов
  serve,
);


// Функции, не являющиеся задачами Gulp ----------------------------------------

/**
 * Получение списка классов из HTML и запись его в глоб. переменную nth.blocksFromHtml.
 * @param  {object}   file Обрабатываемый файл
 * @param  {string}   enc  Кодировка
 * @param  {Function} cb   Коллбэк
 */
function getClassesToBlocksList(file, enc, cb) {
  // Передана херь — выходим
  if (file.isNull()) {
    cb(null, file);
    return;
  }
  // Проверяем, не является ли обрабатываемый файл исключением
  let processThisFile = true;
  nth.config.notGetBlocks.forEach(function (item) {
    if (file.relative.trim() == item.trim()) processThisFile = false;
  });
  // Файл не исключён из обработки, погнали
  if (processThisFile) {
    const fileContent = file.contents.toString();
    let classesInFile = getClassesFromHtml(fileContent);
    // nth.blocksFromHtml = [];
    // Обойдём найденные классы
    for (let item of classesInFile) {
      // Не Блок или этот Блок уже присутствует?
      if ((item.indexOf('__') > -1) || (item.indexOf('--') > -1) || (nth.blocksFromHtml.indexOf(item) + 1)) continue;
      // Класс совпадает с классом-исключением из настроек?
      if (nth.config.ignoredBlocks.indexOf(item) + 1) continue;
      // У этого блока отсутствует папка?
      // if (!fileExist(dir.blocks + item)) continue;
      // Добавляем класс в список
      nth.blocksFromHtml.push(item);
    }
    console.log('---------- Used HTML blocks: ' + nth.blocksFromHtml.join(', '));
    file.contents = new Buffer.from(fileContent);
  }
  this.push(file);
  cb();
}

//
/**
 * Pug-фильтр, выводящий содержимое pug-файла в виде форматированного текста
 */
function filterShowCode(text, options) {
  var lines = text.split('\n');
  var result = '<pre class="code">\n';
  if (typeof (options['first-line']) !== 'undefined') result = result + '<code>' + options['first-line'] + '</code>\n';
  for (var i = 0; i < (lines.length - 1); i++) { // (lines.length - 1) для срезания последней строки (пустая)
    result = result + '<code>' + lines[i].replace(/</gm, '&lt;') + '</code>\n';
  }
  result = result + '</pre>\n';
  result = result.replace(/<code><\/code>/g, '<code>&nbsp;</code>');//Заменяем пустые теги на теги с пробелом
  return result;
}

/**
 * Проверка существования файла или папки
 * @param  {string} path      Путь до файла или папки
 * @return {boolean}
 */
function fileExist(filepath) {
  let flag = true;
  try {
    fs.accessSync(filepath, fs.F_OK);
  } catch (e) {
    flag = false;
  }
  return flag;
}

/**
 * Получение всех названий поддиректорий, содержащих файл указанного расширения, совпадающий по имени с поддиректорией
 * @param  {string} ext    Расширение файлов, которое проверяется
 * @return {array}         Массив из имён блоков
 */
function getDirectories(ext) {
  let source = dir.blocks;
  let res = fs.readdirSync(source)
    .filter(item => fs.lstatSync(source + item).isDirectory())
    .filter(item => fileExist(source + item + '/' + item + '.' + ext));
  return res;
}

/**
 * Получение разницы между двумя массивами.
 * @param  {array} a1 Первый массив
 * @param  {array} a2 Второй массив
 * @return {array}    Элементы, которые отличаются
 */
function getArraysDiff(a1, a2) {
  return a1.filter(i => !a2.includes(i)).concat(a2.filter(i => !a1.includes(i)))
}
