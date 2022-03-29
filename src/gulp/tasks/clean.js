const dir = require("../dir");
const del = require('del');

module.exports = function clearBuildDir() {
    return del([
        `${dir.build.html}/**/*`,
        `!${dir.build.html}/readme.md`,
    ]);
}
