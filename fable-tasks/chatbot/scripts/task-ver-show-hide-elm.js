// 1. Get the 'ver' parameter from the URL query string
const choiceMin = 1, 
    choiceMax = 4,
    showHideURLParams = new URLSearchParams(globalThis.location.search), 
    currentVer = parseInt(showHideURLParams.get("ver"), 10), 

    // 2. Select all elements with the 'data-ver' attribute
    verElements = document.querySelectorAll("li[data-ver], p[data-ver]");

if (!isNaN(currentVer)) {
    verElements.forEach(element => {
        const allowedVersions = JSON.parse(element.getAttribute("data-ver"));

        if (allowedVersions.includes(currentVer) === true || currentVer < choiceMin || currentVer > choiceMax) {
            // Show this element by removing the hide class
            element.classList.remove("hidden");
            element.setAttribute("aria-hidden", "false")
        } else {
            // Hide the other elements by adding the hide class
            element.classList.add("hidden");
            element.setAttribute("aria-hidden", "true")
        }
    });
}