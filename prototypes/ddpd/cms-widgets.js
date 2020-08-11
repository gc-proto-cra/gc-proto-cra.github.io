/*global $ */
function comments(commentDiv) {
    "use strict";
    commentDiv.each(function (ignore, element) {
        var cid = $(element).attr("data-cid");
        var replies = $(element).attr("data-replies");
        var commentAdd = $($($($(element).children("div[class=\"well mrgn-tp-lg\"]")[0])[0]).children("h2[data-commentadd=\"true\"]")[0]);
        var commentDisplay = $($(element).children("h2[data-commentdisplay=\"true\"]")[0]);

        $($(element).children("div[data-response=\"true\"]")[0]).ice_dialogueresponse(cid);
        $($($($(element).children("div[class=\"well mrgn-tp-lg\"]")[0])[0]).children("div[data-commentform=\"true\"]")[0]).ice_dialogueform(cid);
        $($(element).children("div[data-comments=\"true\"]")[0]).ice_dialoguecomments(cid, "true" === replies);
        if (document.documentElement.lang === "en") {
            commentAdd.html("Add a comment");
            commentDisplay.html("Comments <small><strong>French and English comments are displayed together</strong></small>");
        } else {
            commentAdd.html("Ajouter un commentaire");
            commentDisplay.html("Commentaires <small><strong>Les commentaires en fran&ccedil;ais et en anglais sont affich&eacute;s ensemble.</strong></small>");
        }
    });
}

function callcomments(commentDiv) {
    "use strict";
    var response = $($(commentDiv).children("div[data-response=\"true\"]")[0]);
    var commentForm = $($($($(commentDiv).children("div[class=\"well mrgn-tp-lg\"]")[0])[0]).children("div[data-commentform=\"true\"]")[0]);
    var comment = $($(commentDiv).children("div[data-comments=\"true\"]")[0]);

    if (response.ice_dialogueresponse === undefined &&
            commentForm.ice_dialogueform === undefined &&
            comment.ice_dialoguecomments === undefined) {
        setTimeout(function () {
            callcomments(commentDiv);
        }, 100);
    } else {
        comments(commentDiv);
    }
}

function parseIceListEditElements() {
    "use strict";
    $('.ice-listedit').each(function(){
        var data = JSON.parse($(this).attr('data-listedit'));       
        loadInstance($(this), data.id, data.lang, (data.wet4!=null)?data.wet4:false);
    });
}

// fix for scrolling bug
$(document).ajaxComplete(function () {
    var hashtag = location.hash.substr(1);
    var elmnt = document.getElementById(hashtag);

    if (elmnt) {
        elmnt.scrollIntoView();
    }
    // fix for empty hash
});

$(function () {
    "use strict";
    var commentDiv = $("section[class=\"commentDiv\"]");    
    var wbTable = $("table[class~=\"wb-tables\"]");
    var iceListEdit = $("div[class=\"ice-listedit\"]");
    var iceListEditData = null;

    //Load ICE commenting widget Javascript
    if (commentDiv.length !== 0) {
        $.getScript("//lse-esl.ec.rc.gc.ca/pab-dgap/dialogue/static/dialogue.js")
        .done(function() {
            callcomments(commentDiv);
        })
        .fail(function( jqxhr, settings, exception ) {
            console.log("ICE list editor Javascript not loaded.");
        });
        $("body").append("<script type=\"text/javascript\" src=\"http://lse-esl.ec.rc.gc.ca/pab-dgap/dialogue/static/dialogue.js\"></script>\n");
    }

    //Load WB data tables Javascript
    if (wbTable.length !== 0) {
        $.getScript("/wet40/intranet/js/table.search.js")
        .fail(function() {
            console.log("WB Tables Javascript not loaded.");
        });
    }
    
    //Load ICE list editor Javascript
    if (iceListEdit.length > 0) {
        iceListEditData = JSON.parse(iceListEdit.attr("data-listedit"));
        
        if ("true" === iceListEditData.wet4) {
            $.getScript("//lse-esl.ec.rc.gc.ca/static/pab-dgap/listedit/js/wet4.instance.loader.js")
                .done(function() {
                    parseIceListEditElements();
                })
                .fail(function( jqxhr, settings, exception ) {
                    console.log("ICE list editor Javascript not loaded.");
                });
        } else {
            $.getScript("//lse-esl.ec.rc.gc.ca/static/pab-dgap/listedit/js/wet2.instance.loader.js")
                .done(function() {
                    parseIceListEditElements();
                })
                .fail(function() {
                    console.log("ICE list editor Javascript not loaded.");
                });
        }
    }
});
