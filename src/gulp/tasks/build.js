const { watch, series, parallel } = require("gulp");
const clearBuildDir = require("./clean");
const compilePugFast = require("./html");
const compileSass = require("./style");
const buildScript = require("./script");
const buildLibrary = require("./library");
const { minifyImage, copyMinifyImage } = require("./image");

module.exports = series(
    clearBuildDir,
    parallel(compilePugFast, compileSass, buildScript, buildLibrary, series(minifyImage, copyMinifyImage)),
);
