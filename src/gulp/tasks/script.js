const dir = require("../dir");
const { src, dest } = require("gulp");
const plumber = require("gulp-plumber");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const log = require("fancy-log");
const webpackStream = require("webpack-stream");
const fs = require("fs");
const path = require("path");
var root = require("../../../root");


//Компилирует библиотеку
// function scriptLibrary() {
//     const scripts = [
//         "./node_modules/slick-slider/slick/slick.min.js",
//     ];
//     return src(scripts, {
//             allowEmpty: true,
//         }) //Найдем наш main файл
//         .pipe(concat("library.js"))
//         .pipe(uglify()) //Сожмем наш js
//         .pipe(dest(dir.build.js)); //Выплюнем готовый файл в build //И перезагрузим сервер
// }
//Компилируем скрипт страниц
module.exports = function scriptPage() {
    const entryList = {
        //'library': `./${dir.src.library}/library.js`,
        ...getScriptPageFile(dir.src.pages)
    }
    return src(`${dir.src.library}/*.js`, { allowEmpty: true })
        .pipe(plumber())
        .pipe(webpackStream({
            mode: root.mode,
            entry: entryList,
            devtool: 'inline-source-map',
            output: {
                filename: '[name].js',
            },
            //   resolve: {
            //     alias: {
            //       Utils: path.resolve(__dirname, 'src/js/utils/'),
            //     },
            //   },
            module: {
                rules: [{
                    test: /\.(js)$/,
                    exclude: /(node_modules)/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['@babel/preset-env']
                    }
                }]
            },
            externals: {
                jquery: 'jQuery'
            }
        }))
        .pipe(dest(`${dir.build.js}`));
};

function getScriptPageFile(directory) {

    let result = {};
    fs.readdirSync(root.root + '/' + directory)
        .forEach(file => {
            const subDir = path.basename(file);
            const scriptFile = `./${directory}/${subDir}/${subDir}.js`;
            if (fs.existsSync(scriptFile)) {
                log(subDir, scriptFile);
                result[subDir] = scriptFile;
            }
        });
    return result;
}
