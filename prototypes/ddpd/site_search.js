/*global window,$
*/
/*jslint browser: true
 */
function findSearch(searchFilename) {
    "use strict";
    var url = window.location.href;
	if (url.substr(-1) === "/") {
        url = url.substring(0, url.length-1);
    }
    if (url.toLowerCase().indexOf("/english/") > -1 || url.toLowerCase().indexOf("/francais/") > -1) {
        work (url, searchFilename)
    } else {
        // get replacement
        checkForFriendly(url, searchFilename);
    }
}

function checkForFriendly (url, searchFilename) {
    "use strict";
  	var requestUrl;
    var dbServer;
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

    requestUrl = "http://" + dbServer + "/iw-cc/rest/ts/getFriendlyEquivalent?callback=friendlyCallback&url=" + encodeURIComponent(url) + "&" + "searchFilename=" + searchFilename;

    $.ajax({
        type: "GET",
        url: requestUrl,
        dataType: "jsonp"
    });
}

function friendlyCallback(data) {
	"use strict";
    work (data.url, data.searchFilename);
}

function work(url, searchFilename) {
    "use strict";
    var pattern = new RegExp("(^http://.*?)(/.*)/.*");
    var search = "";
    var contents = null;
    var found = false;
    var resultUrl = pattern.exec(url);

    while (resultUrl !== null) {
        url = resultUrl[1] + resultUrl[2];
        search = resultUrl[2] + "/" + searchFilename;

        $.ajax({
            url: search,
            async: false
        }).done(function (result) {
            contents = result;
            found = true;
        });

        if (found) {
            break;
        }

        resultUrl = pattern.exec(url);
    }

    $("#icms_search").replaceWith(contents);
}



