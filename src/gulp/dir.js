module.exports = {
    build: {
        html: "build",
        js: "build/js",
        css: "build/css",
        img: "build/img",
        fonts: "build/fonts",
    },
    src: {
        //Пути откуда брать исходники
        pages: "src/pages", //Папка страниц с разметкой стилями скриптами 
        components: "src/components", //Папки с компонентами с разметкой стилями скриптами 
        img: "src/image", //Папка с картинками
        img_min: "src/__image-min",
        fonts: "src/fonts",
        library: "src/library", //Папка с фалами общими для всех сраниц
        styles: "src/styles" //Папка с фалами общими для всех сраниц
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

}
