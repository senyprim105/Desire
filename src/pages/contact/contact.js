require("../../components/layout/layout");
$(function () {
    $(".contact__slider-inner").slick({
        arrows: false,
        dots: false,
        slidesToShow: 10,
        slidesToScroll: 10,
        dotsClass: "contact__slider-dots",
        centerPadding: "20px",
        centerMode:true,
        responsive: [
            {
                breakpoint: 1700,
                settings: {
                    slidesToShow: 9,
                    slidesToScroll: 9,
                },
            },
            {
                breakpoint: 1650,
                settings: {
                    slidesToShow: 8,
                    slidesToScroll: 8,
                },
            },
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 7,
                    slidesToScroll: 7,
                },
            },
            {
                breakpoint: 1350,
                settings: {
                    slidesToShow: 6,
                    slidesToScroll: 6,
                },
            },
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 5,
                },
            },
            {
                breakpoint: 1000,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
        ],
    });
});
