$(function() {
    // Обработчик на нажатие на бургер
    const sideBarHideClass = "menu__right-side--hide";
    const buttonShowSideBar = $(".menu__item--burger");
    const sideBar = $(".menu__right-side");
    const buttonCloseSideBar = $(".menu__right-side-close");
    const menu = $(".menu__list");

    buttonShowSideBar.on('click', function() {
        menu.toggleClass('menu__list--open')
        sideBar.removeClass(sideBarHideClass);
        buttonCloseSideBar.on('click', function() {
            sideBar.addClass(sideBarHideClass);
        })
    })
})