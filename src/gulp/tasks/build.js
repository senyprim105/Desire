const { watch, series, parallel } = require("gulp");
const clearBuildDir = require("./clean");
const compilePugFast = require("./html");
const compileSass = require("./style");
const buildScript = require("./script");
const buildLibrary = require("./library");
const { minifySvg, createWebp } = require("./image");

module.exports = series(
    clearBuildDir,
    parallel(compilePugFast, compileSass, buildScript, buildLibrary, parallel(minifySvg, createWebp)),
);
