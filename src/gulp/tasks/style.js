const dir = require("../dir");
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const debug = require("gulp-debug");
// const sass = require("gulp-sass")(require('sass'));
const gulpSass = require("gulp-sass");
const dartSass = require("sass");
const nodeSass = require("node-sass");
const sass = gulpSass(dartSass);

const postcss = require("gulp-postcss");
//const prefixer = require("gulp-prefixer");
const csso = require("gulp-csso");
const autoprefixer = require("autoprefixer");
const mqpacker = require("css-mqpacker");
const atImport = require("postcss-import");
const inlineSVG = require('postcss-inline-svg');
const fs = require("fs");
const path = require("path");
var root = require("../../../root");

let postCssPlugins = [
    autoprefixer({ grid: true }),
    mqpacker({
        sort: true
    }),
    atImport(),
    inlineSVG(),
];

//Компилируем список стилей
module.exports = function compileSass() {
    const scssFileList = [
        `${dir.src.library}/*.scss`, //Добавляем общие стили 
        ...getStylePageFile(dir.src.pages), //Выбираем список стилей страниц
    ];
    return gulp.src(scssFileList, { sourcemaps: true, allowEmpty: true })
        // .pipe(plumber({
        //     errorHandler: function(err) {
        //         this.emit('end');
        //     }
        // }))
        .pipe(debug({ title: 'Compiles:' }))
        .pipe(sass({ includePaths: [__dirname + '/', 'node_modules'] })) //Говорит что нужно просматривать node_modules для разрешения непонятных импортов
        // .pipe(postcss(postCssPlugins))
        //  .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(csso({
            restructure: false,
        }))
        .pipe(gulp.dest(`${dir.build.css}`, { sourcemaps: true /*mode === 'development' ? '.' : false*/ }))
}

function getStylePageFile(directory) {
    let result = [];
    fs.readdirSync(root.root + '/' + directory)
        .forEach(file => {
            const subDir = path.basename(file);
            const scssFile = `${directory}/${subDir}/${subDir}.scss`
            result.push(scssFile);
        });
    return result;
}
