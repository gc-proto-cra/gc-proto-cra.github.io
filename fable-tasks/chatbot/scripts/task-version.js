let targetUrl, linkElement, nameElm;
const currentQueryString = globalThis.location.search, 
    urlParams = new URLSearchParams(currentQueryString), 
    taskVersion = urlParams.get("ver"), 
    taskNum = urlParams.get("tasknum");

if (taskVersion !== null) {
    linkElement = document.getElementById("task-page");
    if (linkElement !== null) {
        targetUrl = new URL(linkElement.href);
        targetUrl.searchParams.set("ver", taskVersion);
        linkElement.href = targetUrl.toString();
    }
}

if (taskNum !== null) {
    nameElm = document.getElementById("tasknum");
    if (nameElm !== null) {
        nameElm.innerHTML = taskNum;
        document.title = document.getElementById("wb-cont").innerText;
    }
}