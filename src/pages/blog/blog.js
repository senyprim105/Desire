require("../../components/layout/layout");
$(function() {
    $('.blog__slider-inner').slick({
        autoplaySpeed: 3000,
        arrows: true,
        prevArrow: `<button type="button" class="blog__slider-arrow blog__slider-arrow--prev"><img src="/img/icon-arow-left.svg"></button>`,
        nextArrow: `<button type="button" class="blog__slider-arrow blog__slider-arrow--next"><img src="/img/icon-arow-right.svg"></button>`,
        fade: true,
    });
});
