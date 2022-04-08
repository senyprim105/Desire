require("../../components/layout/layout");
$(function() {
    $('.post__slider-inner').slick({
        autoplay:true,
        autoplaySpeed: 3000,
        arrows: true,
        prevArrow: `<button type="button" class="post__slider-arrow post__slider-arrow--prev"><img src="/img/icon-arow-left.svg"></button>`,
        nextArrow: `<button type="button" class="post__slider-arrow post__slider-arrow--next"><img src="/img/icon-arow-right.svg"></button>`,
        fade: true,
    });
});
