module.exports = {
    root: true,
    modules: {
        "bem-tools": {
            plugins: {
                create: {
                    techs: ["pug", "scss", "js"],
                    levels: {
                        "src/components": {
                            default: true
                        }
                    }
                }
            }
        }
    }
};
