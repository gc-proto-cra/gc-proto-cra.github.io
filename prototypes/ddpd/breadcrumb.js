//The global comment below is used in jslint.com to tell the linter what global variables are used.
/*global $
*/
/*jslint browser: true
 */
function createBreadcrumb() {
    "use strict";
	if (document.location.href.indexOf("frames/main/menu")!=-1){return};
    var requestUrl;
    var dbServer;
    var parentUrlString = "";
    var parentUrl = $("meta[name=parentUrl]");
    var serverMap = {
        "sh0lqitvap239": "sh0lqitvap239",
        "sh0lqitvap240": "sh0lqitvap240",
        "sh0lqitvap241": "7.28.108.148",
        "sh0lqitvap242": "icms-scgi-si.isvcs.net",
        "sh0lqitvap243": "sh0lqitvap243",
        "sh0lqitvap244": "sh0lqitvap244",
        "icms-scgi-ut.isvcs.net": "icms-scgi-ut.isvcs.net",
        "icms-scgi-ot.isvcs.net": "icms-scgi-ot.isvcs.net",
        "workzone": "icms-scgi.isvcs.net",
        "staging": "icms-scgi.isvcs.net",
        "infozone": "icms-scgi.isvcs.net"
    };

    var hostname = document.location.hostname;
    var port = document.location.port;
    if (hostname === "sh0lqitvap242" && (port === "82" || port === "83" || port === "84")) {
        dbServer = hostname;
    } else {
        dbServer = serverMap[hostname];
    }
    if (dbServer === null || dbServer === undefined || dbServer.trim() === "") {
        dbServer = "icms-scgi-si.isvcs.net";
    }
    if (parentUrl.length > 0) {
        parentUrlString = "&parentUrl=" + $(parentUrl[0]).attr("content");
    }
    requestUrl = "http://" + dbServer + ":8080/iw-cc/rest/ck/getBreadcrumbsForUrl?callback=breadcrumbCallback&url=" + encodeURIComponent(document.location.href) + parentUrlString;

    $.ajax({
        type: "GET",
        url: requestUrl,
        dataType: "jsonp"
    });
}

function endsWith(str, suffix) {
    "use strict";
    return str.substring(str.length - suffix.length).toLowerCase() === suffix.toLowerCase();
}

function breadcrumbCallback(data) {
    "use strict";
    var list;
    var breadcrumbSeparator = "";
    var breadcrumbs = "";
    var version = $("meta[name=wxtversion]");
    var currentUrl = document.location.href.toLowerCase().replace(/(\?|\#).*/i, "");

    if (endsWith(currentUrl, "/")) {
        currentUrl = currentUrl.substring(0, currentUrl.length - 1);
    }
    if (version.length > 0 && $(version[0]).attr("content").indexOf("20") > -1) {
        breadcrumbSeparator = " > ";
        list = $("#cn-bcrumb ol");
    } else {
        list = $("#wb-bc div div ol");
    }
    list.empty();
    if (data.length > 1) {
        data.forEach(function (item) {
            breadcrumbs += "<li>";
            if (endsWith(currentUrl, item.url)) {
                if (item.name === "new") {
                    breadcrumbs += $("h1").html();
                } else {
                    breadcrumbs += item.name;
                }
            } else {
                breadcrumbs += ("<a href=\"" + item.url + "\">" + item.name + "</a>" + breadcrumbSeparator);
            }
            breadcrumbs += "</li>\n";
        });

        list.html(breadcrumbs);
    }
}
