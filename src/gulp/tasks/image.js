const dir = require("../dir");
const { src, dest, lastRun } = require("gulp");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");

// module.exports.minifyImage = function minifyImage() {
//     return src(dir.src.img + "/**/*.{png,jpg,jpeg,svg}", { allowEmpty: true, since: lastRun(minifyImage) }) //Выберем каталог изображений
//         .pipe(
//             imagemin([
//                 imagemin.gifsicle({ interlaced: true }),
//                 imagemin.mozjpeg({
//                     quality: 75,
//                     progressive: true
//                 }),
//                 // imgCompress({
//                 //     min: 40,
//                 //     max: 70,
//                 // }),
//                 imagemin.optipng({ optimizationLevel: 5 }),
//                 imagemin.svgo({
//                     plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
//                 }),
//             ])
//         )
//         .pipe(dest(dir.src.img_min)); //И бросим в минифицированные
// }
module.exports.minifySvg = function minifySvg() {
    return src(dir.src.img + "/**/*.{svg}", { allowEmpty: true, since: lastRun(minifyImage) }) //Выберем каталог изображений
        .pipe(
            imagemin([
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
                }),
            ])
        )
        .pipe(dest(dir.build.img)); //И бросим в минифицированные
}

module.exports.createWebp =function createWebp () {
    return gulp
      .src(dir.src.img +  + "/**/*.{png,jpg,jpeg,tiff,gif}", { since: gulp.lastRun(createWebp) })
      .pipe(webp({ quality: 60 }))
      .pipe(gulp.dest(dest.build.img));
  };

// module.exports.copyMinifyImage = function copyMinifyImage() {
//     return src(dir.src.img_min + "/**/*.{png,jpg,jpeg,svg}", { allowEmpty: true, since: lastRun(copyMinifyImage) })
//         .pipe(dest(dir.build.img))
// }
