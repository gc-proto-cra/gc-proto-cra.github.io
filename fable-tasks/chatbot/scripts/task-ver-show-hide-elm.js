// 1. Get the 'ver' parameter from the URL query string
const showHideURLParams = new URLSearchParams(window.location.search), 
    currentVer = parseInt(showHideURLParams.get("ver"), 10), 

    // 2. Select all elements with the 'data-ver' attribute
    verElements = document.querySelectorAll("[data-ver]");

if (!isNaN(currentVer)) {
    verElements.forEach(element => {
        const allowedVersions = JSON.parse(element.getAttribute("data-ver"));

        if (allowedVersions.includes(currentVer) === true) {
            // Show this element by removing the hide class
            element.classList.remove("wb-inv");
        } else {
            // Hide the other elements by adding the hide class
            element.classList.add("wb-inv");
        }
    });
}