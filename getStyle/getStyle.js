function getStyle(element, name) {
    var computedStyle;
    try {
        computedStyle = document.defaultView.getComputedStyle(element, null);
    } catch (e) {
        computedStyle = element.currentStyle;
    }
    if (name != "float") {
        return computedStyle[name];
    } else {
        return computedStyle["cssFloat"] || computedStyle["styleFloat"];
    }
}