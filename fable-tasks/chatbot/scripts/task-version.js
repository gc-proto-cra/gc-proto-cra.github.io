let targetUrl, linkElement;
const currentQueryString = window.location.search, 
    urlParams = new URLSearchParams(currentQueryString), 
    taskVersion = urlParams.get("ver");

if (taskVersion !== null) {
    linkElement = document.getElementById("task-page");
    if (linkElement !== null) {
        targetUrl = new URL(linkElement.href);
        targetUrl.searchParams.set("ver", taskVersion);
        linkElement.href = targetUrl.toString();
    }
}