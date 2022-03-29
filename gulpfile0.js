"use strict";

const { src } = require("gulp");
const watch = require("gulp-watch");

const
    gulp = require("gulp"),

    concat = require("gulp-concat"),
    prefixer = require("gulp-autoprefixer"),
    uglify = require("gulp-uglify"),
    sass = require("gulp-sass"),
    sourcemaps = require("gulp-sourcemaps"),
    rigger = require("gulp-rigger"),
    cssmin = require("gulp-clean-css"),
    imagemin = require("gulp-imagemin"),
    pngquant = require("imagemin-pngquant"),
    rimraf = require("rimraf"),
    browserSync = require("browser-sync"),
    babel = require("gulp-babel"),
    imgCompress = require("imagemin-jpeg-recompress"),
    googleWebFonts = require("gulp-google-webfonts"),
    changed = require("gulp-changed"),
    pug = require("gulp-pug"),
    fileinclude = require('gulp-file-include'),
    reload = browserSync.reload;
//Скрипты библиотек для включения в проект
const scripts = [
    "./node_modules/slick-slider/slick/slick.min.js",
    "./node_modules/swiper/swiper-bundle.min.js",
    "./node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js"
];
//Стили библиотек для включения в проект
var styles = [
    "./node_modules/normalize.css/normalize.css",
    "./node_modules/slick-slider/slick/slick.css", //Слайдер
    //"./node_modules/swiper/swiper-bundle.min.css",//Еще один слайдер
    "./node_modules/animate.css/animate.min.css", //Аниматор
    //"./node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css"//Галерей и тд
];
//Объект с конфигурацией путей в проекте
var path = {

    build: {
        //Тут мы укажем куда складывать готовые после сборки файлы
        html: "build/",
        js: "build/js/",
        css: "build/css/",
        img: "build/img/",
        fonts: "build/fonts/",
    },
    src: {
        //Пути откуда брать исходники
        html: "src/sass/*.pug", //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: "src/js/main.js", //В стилях и скриптах нам понадобятся только main файлы
        style: "src/sass/style.scss",
        img: "src/img/**/*.*", //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        img_min: "src/img-min/", //Каталог минифицированных изображений - чтобы не надобыло минифицировать постоянно
        fonts: "src/fonts/",
    },
    watch: {
        //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        src: "src/",
        build: "build/",
        html: ["src/sass/*.pug", "src/sass/blocks/**/*.pug"],
        js: "src/js/**/*.js",
        style: "src/sass/**/*.scss",
        img: "src/img/**/*.*",
        img_min: "src/img-min/**/*.*",
        fonts: "src/fonts/**/*.*",
    },
    clean: "./build",
};

var config = {
    server: {
        baseDir: "./build",
    },
    //tunnel: true,
    //host: "localhost",
    //port: 9000,
    //logPrefix: "Frontend_Devil",
};

gulp.task("webserver", function() {
    return browserSync(config);
});

gulp.task("clean", function(cb) {
    return rimraf(path.clean, cb);
});

// gulp.task("html:build", function () {
//     return gulp
//         .src( path.src.html, { allowEmpty: true }) //Выберем файлы по нужному пути
//         .pipe(fileinclude({
//             prefix: '@@',//Заменяет в шаблоне строки начинающиеся с таких символов на переданные в опциях замены
//             basepath: '@file'
//           }))

//         //.pipe(rigger()) //Прогоним через rigger
//         .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
//         .pipe(reload({ stream: true })); //И перезагрузим наш сервер для обновлений
// });

//PUG прогоняет все файлы и выгружает в место где должен лежать html
gulp.task("html:build", function() {
        return gulp
            .src(path.src.html, { allowEmpty: true })
            .pipe(pug({ pretty: true }))
            .pipe(gulp.dest(path.build.html))
            .pipe(reload({ stream: true })); //И перезагрузим наш сервер для обновлений
    })
    //Загружаем фонты с гугла в папку fonts , формируем стиль их подключения и выгружаем в sass
    //Задача не для отслеживания изменений
gulp.task("fonts:build", function() {
    return gulp
        .src(path.src.fonts + "fonts.list")
        .pipe(
            googleWebFonts({
                fontsDir: "fonts",
                cssDir: "sass",
                cssFilename: "fonts.scss",
                fontDisplayType: "swap",
            })
        )
        .pipe(gulp.dest(path.watch.src));
});
//Задача для копирования папки fonts  в build
//Включается  в задачу build
gulp.task("fonts:copy", function() {
    return gulp.src(path.watch.fonts).pipe(gulp.dest(path.build.fonts));
});

gulp.task("js:build", function() {
    return (
        gulp
        .src(path.src.js, {
            allowEmpty: true,
        }) //Найдем наш main файл
        //.pipe(rigger()) //Прогоним через rigger
        .pipe(concat("main.js"))
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(babel({ presets: ["@babel/env"] }))
        .pipe(uglify()) //Сожмем наш js
        //.pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({ stream: true }))
    ); //И перезагрузим сервер
});

gulp.task("js:build-lib", function() {
    return gulp
        .src(scripts, {
            allowEmpty: true,
        }) //Найдем наш main файл
        .pipe(concat("lib.js"))
        .pipe(uglify()) //Сожмем наш js
        .pipe(gulp.dest(path.build.js)); //Выплюнем готовый файл в build //И перезагрузим сервер
});

gulp.task("style:build-lib", function() {
    return gulp
        .src(styles, { allowEmpty: true })
        .pipe(concat("lib.css"))
        .pipe(cssmin()) //Сожмем
        .pipe(gulp.dest(path.build.css)); //И в build
});

gulp.task("style:build", function() {
    return (
        gulp
        .src(path.src.style, { allowEmpty: true }) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({ stream: true }))
    );
});

//Минификация изображения
gulp.task("image:build", function() {
    return gulp
        .src(path.src.img, { allowEmpty: true }) //Выберем каталог изображений
        .pipe(changed(path.src.img)) //Берем только измененные
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imgCompress({
                    min: 40,
                    max: 70,
                }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
                }),
            ])
        )
        .pipe(gulp.dest(path.src.img_min)); //И бросим в минифицированные
});
//Копирование минифицированных изображений в build
gulp.task("image:copy", function() {
    return gulp
        .src(path.watch.img_min, { allowEmpty: true })
        .pipe(changed(path.build.img))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({ stream: true }));
});

gulp.task(
    "build",
    gulp.parallel(
        "html:build",
        "js:build",
        "js:build-lib",
        "style:build-lib",
        "style:build",
        "fonts:copy",
        gulp.series("image:build", "image:copy")
    )
);

gulp.task("watch", async function() {
    gulp.watch(path.watch.html, gulp.parallel("html:build"));
    gulp.watch(path.watch.style, gulp.parallel("style:build"));
    gulp.watch(path.watch.js, gulp.parallel("js:build"));
    gulp.watch(path.watch.img, gulp.parallel("image:build"));
    gulp.watch(path.watch.img_min, gulp.parallel("image:copy"));
});

gulp.task("default", gulp.series("build", gulp.parallel("webserver", "watch")));
