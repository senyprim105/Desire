const dir = require("../dir");
const {src,dest,lastRun} = require("gulp");
const plumber = require("gulp-plumber");
const debug = require("gulp-debug");
const pug = require("gulp-pug");
const prettyHtml = require("gulp-pretty-html");
const replace = require("gulp-replace");
const htmlmin= require("gulp-htmlmin");
const rename = require("gulp-rename");


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
  
 //Компилтрует только изменнные с последней компиляции файлы
module.exports = function compilePugFast() {
  const fileList = [
    `${dir.src.pages}/**/*.pug`
  ];
  return src(fileList)//Выбирает файлы только измененные с последнего раза удачного выполнения  переданной задачи
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
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(rename({dirname:""}))
    .pipe(dest(dir.build.html+"/"));
}
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
