$(function() {
    const element = document.querySelector(".gallery__content-list");
    let mixer;
    if (element) {
        mixer = mixitup(element, {
            load: {
                filter: '.bedroom',

            },
            classNames: {
                block: "gallery",
                delineatorElement: '__',
                elementFilter: "filter-item",
                delineatorModifier: "--",
                elementContainer: ""

            }
        });
    }
});
