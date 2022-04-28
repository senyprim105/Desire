require("../../components/layout/layout");
$(function() {
    console.log("slider on");
    const slick = $('.post-list__inner').slick({
        slidesToShow: 2,
        arrows: true,
        prevArrow: `<button type="button" class="post-list__arrow post-list__arrow--prev"><img src="/img/icon-arow-left.svg"></button>`,
        nextArrow: `<button type="button" class="post-list__arrow post-list__arrow--next"><img src="/img/icon-arow-right.svg"></button>`,
        responsive:[
            {
                breakpoint:575,
                settings:{
                    slidesToShow:1,
                }

            }
        ]
    });
    //Проставляем доп классы при инициализации
    console.log(slick[0]);
    initSlider(slick[0],getSlide(slick[0],0));
    
    
    $(".post-list__inner").on("afterChange", function(event, slick, current_slide, next_slide) {
        console.log(slick.$slider[0]);
        changeCurrentSlide(slick.$slider[0],current_slide,next_slide);
    })
    //Обработчик смены текущего слайда:
    function changeCurrentSlide(slick, current_slide, next_slide) {

        console.log(slick,current_slide,next_slide);
        current_slide = getSlide(slick,current_slide);
        next_slide = getSlide(slick,next_slide);
        $(current_slide).removeClass('post-list__slide-container--current');
        $(next_slide).addClass("post-list__slide-container--current");
    }
    //Инициация слайдера
    function initSlider(slick, current_slide, next_slide){
        $(slick).find('.slick-slide').addClass('post-list__slide-container');
        $(current_slide).addClass("post-list__slide-container--current");
    }
    function getSlide(slick, slide_index){
        return $(slick).find(`[data-slick-index="${slide_index}"]`);
    }
});
