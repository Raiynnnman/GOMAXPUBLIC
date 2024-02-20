import React, { useEffect } from "react";

import language from "../../translations/translations.json";

function translate(msg) { 
    var c = 0;
    var lang = localStorage.getItem("locale");
    var isset = localStorage.getItem("set_locale");
    if (isset) { lang=isset; }
    if (navigator.languages && isset === null) { 
        for (c; c < navigator.languages.length; c++) { 
            var t = navigator.languages[c]
            if (language[t]) { 
                lang = t
                break;
            } 
        } 
    } 
    if (!lang) { lang = "en"; }
    if (!lang[lang]) { lang = "en"; }
    if (!language[lang][msg]) { return msg; }
    return language[lang][msg]
}


export default translate;
