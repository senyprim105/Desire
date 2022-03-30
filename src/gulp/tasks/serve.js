const dir = require("../dir");
const { watch, series, parallel } = require("gulp");
const browserSync = require("browser-sync").create();
const compilePugFast = require("./html");
const compileSass = require("./style");
const buildJs = require("./script");
const buildLibrary = require("./library");
const { minifyImage, copyMinifyImage } = require("./image");

function reload(done) {
    browserSync.reload();
    done();
}


module.exports = function serve() {
    browserSync.init({
        server: dir.build.html,
        port: 8080,
        startPath: 'index.html',
        open: false,
        notify: false,
    });

    // Страницы
    watch([`${dir.src.pages}/**/*.pug`, `${dir.src.components}/**/*.pug`],
        series(
            compilePugFast,
            reload
        ));

    // Стили 
    watch([`${dir.src.pages}/**/*.scss`, `${dir.src.components}/**/*.scss`, `${dir.src.library}/**/*.scss`, `${dir.src.styles}/**/*.scss`], series(
        compileSass,buildLibrary,
        reload
    ));

    // Скрипты
    watch([`${dir.src.pages}/**/*.js`, `${dir.src.components}/**/*.js`], {
        events: ['all'],
        delay: 100
    }, series(
        buildJs,
        reload
    ));

    // Библиотека
    watch([`${dir.src.library}/**/*.js`], {
        events: ['all'],
        delay: 100
    }, series(
        buildLibrary,
        reload
    ));

    // Картинки
    watch([`${dir.src.img}/*.{jpg,jpeg,png,gif,svg,webp}`],
        series(minifyImage, copyMinifyImage, reload)
    );
}
