const dir = require("../dir");
const { src, dest, parallel } = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const gulpPlumber = require("gulp-plumber");
const csso = require("gulp-csso");



//Компилирует библиотеку
function scriptLibrary() {
    const scripts = [
        "./node_modules/slick-slider/slick/slick.min.js",
        "./node_modules/mixitup/dist/mixitup.min.js",
        // "./node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js",
    ];
    return src(scripts, {
            allowEmpty: true,
        }) //Найдем наш main файл
        .pipe(concat("library.js"))
        .pipe(uglify()) //Сожмем наш js
        .pipe(dest(dir.build.js)); //Выплюнем готовый файл в build //И перезагрузим сервер
}

function styleLibrary() {
    const styles = [
        "./node_modules/normalize.css/normalize.css",
        "./node_modules/slick-carousel/slick/slick.css",
        // "./node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css",
    ];
    return src(styles, {
            allowEmpty: true,
        }) //Найдем наш main файл
        .pipe(concat("library.css"))
        .pipe(csso({ restructure: false })) //Сожмем 
        .pipe(dest(dir.build.css)); //Выплюнем готовый файл в build //И перезагрузим сервер
}
module.exports = parallel(styleLibrary, scriptLibrary);
