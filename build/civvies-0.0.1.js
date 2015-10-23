/*
-----------------------------------------------------------------------------------
-- civvies.js - v0.0.1 - Built on 2015-10-22 by Jay Crossler using Grunt.js
-----------------------------------------------------------------------------------
-- Inspired by civclicker.js - Copyright (C) 2014 David Stark 
-----------------------------------------------------------------------------------
*/
//Jay's math helpers
_.mixin({ deepClone: function (p_object) {
    return JSON.parse(JSON.stringify(p_object));
} });

var maths = {};
maths.clamp = function (number, min, max) {
    return Math.min(Math.max(number, min), max);
};
maths.heightOnSin = function (theta_min, theta_max, step, steps, amplitude, func) {
    func = func || Math.sin; //Find the Sin value by default, you can also pass in Math.cos

    var percent = step / steps;
    var theta = theta_min + ((theta_max - theta_min) * percent);
    return Math.sin(theta * Math.PI) * amplitude;
};
maths.sizeFromAmountRange = function (size_min, size_max, amount, amount_min, amount_max) {
    var percent = (amount - amount_min) / (amount_max - amount_min);
    return size_min + (percent * (size_max - size_min));
};
maths.colorBlendFromAmountRange = function (color_start, color_end, amount, amount_min, amount_max) {
    var percent = (amount - amount_min) / (amount_max - amount_min);

    if (color_start.substring(0, 1) == "#") color_start = color_start.substring(1, 7);
    if (color_end.substring(0, 1) == "#") color_end = color_end.substring(1, 7);

    var s_r = color_start.substring(0, 2);
    var s_g = color_start.substring(2, 4);
    var s_b = color_start.substring(4, 6);
    var e_r = color_end.substring(0, 2);
    var e_g = color_end.substring(2, 4);
    var e_b = color_end.substring(4, 6);

    var n_r = Math.abs(parseInt((parseInt(s_r, 16) * percent) + (parseInt(e_r, 16) * (1 - percent))));
    var n_g = Math.abs(parseInt((parseInt(s_g, 16) * percent) + (parseInt(e_g, 16) * (1 - percent))));
    var n_b = Math.abs(parseInt((parseInt(s_b, 16) * percent) + (parseInt(e_b, 16) * (1 - percent))));
    var rgb = maths.decimalToHex(n_r) + maths.decimalToHex(n_g) + maths.decimalToHex(n_b);

    return "#" + rgb;
};
maths.decimalToHex = function (d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
};
maths.idealTextColor = function (bgColor) {

    var nThreshold = 150;
    var components = maths.getRGBComponents(bgColor);
    var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

    return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
};
maths.getRGBComponents = function (color) {

    var r = color.substring(1, 3);
    var g = color.substring(3, 5);
    var b = color.substring(5, 7);

    return {
        R: parseInt(r, 16),
        G: parseInt(g, 16),
        B: parseInt(b, 16)
    };
};
maths.hexColorToRGBA = function (color, transparency) {
    var rgb;
    if (!color) return "rgba(0,0,0,1)";
    var newColor, rgbArr;
    if (color.indexOf("rgb(") == 0 && color.indexOf(",") > 5) {
        //Is in format of rgb(215,159,102)
        newColor = color.substr(0, color.length - 1);
        newColor = newColor.substr(4);
        rgbArr = newColor.split(",");
        rgb = {R: rgbArr[0], G: rgbArr[1], B: rgbArr[2]}
    } else if (color.indexOf("rgba(") == 0 && color.indexOf(",") > 5) {
        //Is in format of rgba(215,159,102,.6)
        newColor = color.substr(0, color.length - 1);
        newColor = newColor.substr(5);
        rgbArr = newColor.split(",");
        rgb = {R: rgbArr[0], G: rgbArr[1], B: rgbArr[2]}
    } else if (color.indexOf("#") == 0) {
        rgb = maths.getRGBComponents(color);
    } else {
        //is likely a color name
        newColor = net.brehaut.Color(color).toString();
        rgb = maths.getRGBComponents(newColor);
    }
    transparency = transparency || 1;
    return "rgba(" + rgb.R + "," + rgb.G + "," + rgb.B + "," + transparency + ")";
};
maths.buildTransformFromTriangleToTriangle = function (sourceTriangle, destTriangle) {
    //Evolved from http://stackoverflow.com/questions/1114257/transform-a-triangle-to-another-triangle
    var x11 = sourceTriangle[0].x;
    var x12 = sourceTriangle[0].y;
    var x21 = sourceTriangle[1].x;
    var x22 = sourceTriangle[1].y;
    var x31 = sourceTriangle[2].x;
    var x32 = sourceTriangle[2].y;
    var y11 = destTriangle[0].x;
    var y12 = destTriangle[0].y;
    var y21 = destTriangle[1].x;
    var y22 = destTriangle[1].y;
    var y31 = destTriangle[2].x;
    var y32 = destTriangle[2].y;

    var a1 = ((y11 - y21) * (x12 - x32) - (y11 - y31) * (x12 - x22)) /
        ((x11 - x21) * (x12 - x32) - (x11 - x31) * (x12 - x22));
    var a2 = ((y11 - y21) * (x11 - x31) - (y11 - y31) * (x11 - x21)) /
        ((x12 - x22) * (x11 - x31) - (x12 - x32) * (x11 - x21));
    var a3 = y11 - a1 * x11 - a2 * x12;
    var a4 = ((y12 - y22) * (x12 - x32) - (y12 - y32) * (x12 - x22)) /
        ((x11 - x21) * (x12 - x32) - (x11 - x31) * (x12 - x22));
    var a5 = ((y12 - y22) * (x11 - x31) - (y12 - y32) * (x11 - x21)) /
        ((x12 - x22) * (x11 - x31) - (x12 - x32) * (x11 - x21));
    var a6 = y12 - a4 * x11 - a5 * x12;

    //Return a matrix in a format that can be used by canvas.context.transform(m[0],m[1],m[2],m[3],m[4],m[5])
    return [a1, a4, a2, a5, a3, a6];
};
//--------------------------------------------
// Library of commonly used generic functions.
//--------------------------------------------

var Helpers = Helpers || {};
Helpers.between = function (s, prefix, suffix, suffixAtEnd, prefixAtEnd) {
    if (!s.lastIndexOf || !s.indexOf) {
        return s;
    }
    var i = prefixAtEnd ? s.lastIndexOf(prefix) : s.indexOf(prefix);
    if (i >= 0) {
        s = s.substring(i + prefix.length);
    }
    else {
        return '';
    }
    if (suffix) {
        i = suffixAtEnd ? s.lastIndexOf(suffix) : s.indexOf(suffix);
        if (i >= 0) {
            s = s.substring(0, i);
        }
        else {
            return '';
        }
    }
    return s;
};
Helpers.sortWithConditions = function (input, val_name) {
	//Sorts in order, and if any item has a before/behind or after/above condition, reorders those
    val_name = val_name || "name";

	var out = [];
    var remaining = [];
    var i, c, t, item, after, highest, condition, to;

    for (i=0; i<input.length; i++) {
        item = input[i];
        if (item.after || item.above) { //TODO: Also implement item.before || item.behind
            remaining.push(item);
        } else {
            out.push(item);
        }
    }

    //Look through each item, order them by their conditions
    var unmatched = 0;
    for (i=0; i<remaining.length; i++) {
        item = remaining[i];
        after = item.after || item.above;
        if (!_.isArray(after)) after = [after];
        highest = 0;
        var conditions_met = 0;
        for (c=0; c<after.length; c++) {
            condition = after[c];
            for (t=0; t<out.length; t++) {
                to = out[t];
                if (condition == to[val_name]) {
                    if ((t+1) > highest) highest = t+1;
                    conditions_met++;
                    break;
                }
            }
        }
        if (conditions_met == after.length) {
            out.splice(highest, 0, item);
        } else {
            out.push(item);
            unmatched++;
        }
    }
    //Re-sort the last few items
    for (i=(out.length-unmatched); i<out.length; i++) {
        item = out[i];
        after = item.after || item.above;
        if (!_.isArray(after)) after = [after];
        highest = 0;
        for (c=0; c<after.length; c++) {
            condition = after[c];
            for (t=0; t<out.length; t++) {
                to = out[t];
                if (condition == to[val_name]) {
                    if (t > highest) highest = t+1;
                    break;
                }
            }
        }
        out.splice(i, 1);
        out.splice(highest, 0, item);
    }


	return out;
};

Helpers.randomSetSeed = function (seed) {
    Helpers._randseed = seed || 42;
};
Helpers.random = function () {
    Helpers._randseed = Helpers._randseed || 42;
    var x = Math.sin(Helpers._randseed++) * 10000;
    return x - Math.floor(x);
};
Helpers.randInt = function (max) {
    max = max || 100;
    return parseInt(Helpers.random() * max + 1);
};
Helpers.randOption = function (options) {
    var len = options.length;
    return options[Helpers.randInt(len) - 1];
};

Helpers.dateFromPythonDate = function (date, defaultVal) {
    //Requires moment.js

    if (date == 'None') date = undefined;
    if (date == null) date = undefined;
    if (date == '') date = undefined;

    var output = defaultVal;
    if (date) {
        date = date.replace(/p.m./, 'pm');
        date = date.replace(/a.m./, 'am');
        date = date.replace(/\. /, " ");
        //TODO: Get to work with Zulu times
        output = moment(date);
    }
    if (output && output.isValid && !output.isValid()) output = defaultVal || moment();
    return output;
};

Helpers.knownFileExt = function (ext) {
    var exts = ",3gp,7z,ace,ai,aif,aiff,amr,asf,aspx,asx,bat,bin,bmp,bup,cab,cbr,cda,cdl,cdr,chm,dat,divx,dll,dmg,doc,docx,dss,dvf,dwg,eml,eps,exe,fla,flv,gif,gz,hqx,htm,html,ifo,indd,iso,jar,jp2,jpeg,jpg,kml,kmz,lnk,log,m4a,m4b,m4p,m4v,mcd,mdb,mid,mov,mp2,mp4,mpeg,mpg,msi,mswmm,ogg,pdf,png,pps,ppt,pptx,ps,psd,pst,ptb,pub,qbb,qbw,qxd,ram,rar,rm,rmvb,rtf,sea,ses,sit,sitx,ss,swf,tgz,thm,tif,tmp,torrent,ttf,txt,vcd,vob,wav,wma,wmv,wps,xls,xpi,zip,";
    return (exts.indexOf("," + ext + ",") > -1);
};

Helpers.thousandsFormatter = function (num) {
    return num > 999 ? (num / 1000).toFixed(1) + 'k' : num;
};
Helpers.expandExponential = function(value){
    //Modified from: http://stackoverflow.com/questions/16066793/javascript-display-really-big-numbers-rather-than-displaying-xen
    if (value < 100000000000000000000) {
        return value;
    } else {
        var value = value + "";
        value = value.replace(/^([+-])?(\d+).?(\d*)[eE]([-+]?\d+)$/, function(x, s, n, f, c){
            var l = +c < 0, i = n.length + +c, x = (l ? n : f).length,
            c = ((c = Math.abs(c)) >= x ? c - x + l : 0),
            z = (new Array(c + 1)).join("0"), r = n + f;
            return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
        });
        return value;
    }
};
Helpers.abbreviateNumber = function(value, useLongSuffixes) {
    //Modified From: http://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn
    var newValue = value;
    if (value >= 10000) {
        value = Helpers.expandExponential(value);
        var suffixes = useLongSuffixes ? ["", " thousand", " million", " billion", " trillion", " quadrillion", " pentillion", " sextillion", " septillion"] : ["", "k", "m", "b", "t", "q", "p", "s", "ss"];
        var suffixNum = Math.floor( (""+value).length/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        newValue = shortValue+suffixes[suffixNum];
    } else {
        newValue = newValue.toLocaleString();
    }
    return newValue;
};
Helpers.invertColor = function (hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
};
Helpers.rgb2hex = function (rgb) {
    if (typeof rgb != "string") return rgb;
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }

    if (rgb && rgb.search("rgb") == -1) {
        rgb = rgb.split(',');
        if (rgb.length >= 3) {
            return "#" + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
        }
        return rgb;
    } else if (rgb) {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    } else {
        return rgb;
    }
};
Helpers.getRGBComponents = function (color) {
    var r = color.substring(1, 3),
        g = color.substring(3, 5),
        b = color.substring(5, 7);
    return {
        R: parseInt(r, 16),
        G: parseInt(g, 16),
        B: parseInt(b, 16)
    };
};
Helpers.idealTextColor = function (bgColor) {
    if (bgColor.length === 4) {
        bgColor = '#' + bgColor[1] + bgColor[1] + bgColor[2] + bgColor[2] + bgColor[3] + bgColor;
    }
    var nThreshold = 105,
        components = Helpers.getRGBComponents(bgColor),
        bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
    return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
};
Helpers.getColorWithBackground = function (bg_color, useInvertedInsteadOfBlackWhite) {
    var color = Helpers.rgb2hex(bg_color);
    var overColor = useInvertedInsteadOfBlackWhite ? Helpers.invertColor(color) : Helpers.idealTextColor('#' + color);
    return overColor;
};

Helpers.getQueryString = function () {
    var result = {}, queryString = location.search.substring(1),
        re = /([^&=]+)=([^&]*)/g, m;
    while (m = re.exec(queryString)) {
        result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
};
Helpers.exists = function () {
    //Check if variables exist
    var allExist = true;
    for (var i = 0; i < arguments.length; i++) {
        //TODO: Should it check for null as well?
        if (typeof arguments[i] == "undefined") {
            allExist = false;
            break;
        }
    }
    return allExist;
};
Helpers.upperCase = function (input, eachword) {
    if (typeof input == "undefined") return;

    if (eachword) {
        return input.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    } else {
        return input.charAt(0).toUpperCase() + input.slice(1);
    }
};
Helpers.MakeSureClassExists = function (pointer) {
    //usage: HelperFunctions.MakeSureClassExists('Settings.data');

    var classArr = pointer.split(".");

    var newClass = {};

    if (classArr.length && classArr.length > 0) {
        //It's a multiple-level class

        var rootClass = classArr[0];
        if (window[rootClass]) {
            newClass = window[rootClass];
        } else {
            eval(rootClass + ' = {}');
        }

        var classEval = rootClass;
        for (var i = 1; i < classArr.length; i++) {
            //Loop through everything beyond the first level and make sub objects
            classEval += "['" + classArr[i] + "']";
            if (eval("typeof " + classEval) == 'undefined') {
                eval(classEval + " = {}")
            }
        }
    }
};
Helpers.dateCameBefore = function (dateToCheck) {
    var isADate = false;
    var result = false;
    if (dateToCheck && dateToCheck.isValid) {
        isADate = true;
    } else {
        dateToCheck = moment(dateToCheck);
    }
    if (dateToCheck && dateToCheck.isValid && dateToCheck.isValid()) {
        var now = moment();
        var timeDiff = now.diff(dateToCheck);
        if (timeDiff > 0) result = true;
    } else {
        result = "Invalid Date";
    }
    return result;
};
Helpers.buildBootstrapDropdown = function (title, items) {
    var $group = $("<span class='btn-group'>");
    $("<a class='btn dropdown-toggle btn-mini' data-toggle='dropdown' href='#'>" + title + "<span class='caret'></span></a>")
        .appendTo($group);
    var $ul = $("<ul class='dropdown-menu'>")
        .appendTo($group);
    _.each(items, function (dd) {
        var $li = $("<li>").appendTo($ul);
        var $a = $("<a>")
            .attr({target: '_blank', alt: (dd.alt || dd.name || "")})
            .text(dd.title || "Item")
            .appendTo($li);
        if (dd.url) {
            $a.attr({href: dd.href});
        }
        if (dd.onclick) {
            $a.on('click', dd.onclick);
        }
    });
    return $group;
};
Helpers.buildBootstrapInputDropdown = function (title, items, $input) {
    var $group = $("<span class='input-append btn-group'>");
    var $group_holder = $("<a class='btn dropdown-toggle btn-mini' data-toggle='dropdown' href='#'>")
        .css({float: "none"})
        .appendTo($group);
    var $group_title = $("<span>")
        .text(title)
        .appendTo($group_holder);
    $("<span>")
        .addClass('caret')
        .appendTo($group_holder);

    var $ul = $("<ul class='dropdown-menu'>")
        .appendTo($group);
    _.each(items, function (dd) {
        var $li = $("<li>").appendTo($ul);
        var $a = $("<a>")
            .attr({alt: (dd.alt || dd.name || "")})
            .attr({href: "#"})
            .on('click', function () {
                var value = $(this).text();
                $input.val(value);
                $group_title.text(value);
            })
            .appendTo($li);
        if (dd.imgSrc) {
            $("<img>")
                .attr({src: dd.imgSrc})
                .appendTo($a);
        }
        $('<span>')
            .text(dd.title || "Item")
            .appendTo($a);
    });
    return $group;
};
Helpers.tryToMakeDate = function (val, fieldName) {
    var returnVal;
    var name = (fieldName && fieldName.toLowerCase) ? fieldName.toLowerCase() : "";

    if (name && (name == "date" || name == "created" || name == "updated" || name == "datetime")) {
        var testDate = moment(val);
        if (testDate.isValid()) {
            returnVal = val + " <b>(" + testDate.calendar() + ")</b>";
        }
    }
    return (returnVal || val);
};
Helpers.randomLetters = function (n) {
    var out = "";
    n = n || 1;
    for (var i = 0; i < n; i++) {
        out += String.fromCharCode("a".charCodeAt(0) + (Math.random() * 26) - 1)
    }
    return out;
};
Helpers.pluralize = function (str) {
    var uncountable_words = [
        'equipment', 'information', 'rice', 'money', 'species', 'series',
        'fish', 'sheep', 'moose', 'deer', 'news', 'food', 'wood'
    ];
    var plural_rules = [
        [new RegExp('(m)an$', 'gi'), '$1en'],
        [new RegExp('(pe)rson$', 'gi'), '$1ople'],
        [new RegExp('(child)$', 'gi'), '$1ren'],
        [new RegExp('^(ox)$', 'gi'), '$1en'],
        [new RegExp('(ax|test)is$', 'gi'), '$1es'],
        [new RegExp('(octop|vir)us$', 'gi'), '$1i'],
        [new RegExp('(alias|status)$', 'gi'), '$1es'],
        [new RegExp('(bu)s$', 'gi'), '$1ses'],
        [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
        [new RegExp('([ti])um$', 'gi'), '$1a'],
        [new RegExp('sis$', 'gi'), 'ses'],
        [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'), '$1$2ves'],
        [new RegExp('(hive)$', 'gi'), '$1s'],
        [new RegExp('([^aeiouy]|qu)y$', 'gi'), '$1ies'],
        [new RegExp('(x|ch|ss|sh)$', 'gi'), '$1es'],
        [new RegExp('(matr|vert|ind)ix|ex$', 'gi'), '$1ices'],
        [new RegExp('([m|l])ouse$', 'gi'), '$1ice'],
        [new RegExp('(quiz)$', 'gi'), '$1zes'],
        [new RegExp('s$', 'gi'), 's'],
        [new RegExp('$', 'gi'), 's']
    ];
    var ignore = _.indexOf(uncountable_words, str.toLowerCase()) > -1;
    if (!ignore) {
        for (var x = 0; x < plural_rules.length; x++) {
            if (str.match(plural_rules[x][0])) {
                str = str.replace(plural_rules[x][0], plural_rules[x][1]);
                break;
            }
        }
    }
    return str;
};
Helpers.stringAfterString = function (string, after, valIfNotFound) {
    var inLoc = string.indexOf(after);
    if (Helpers.exists(inLoc) && inLoc > -1) {
        return string.substr(inLoc + after.length);
    } else {
        return valIfNotFound || string;
    }
};
Helpers.isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};
Helpers.nameOfUSState = function (code, withComma) {
    var lookup = {AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'};
    var state = lookup[code.toUpperCase()];
    var output = "";
    if (state) output = withComma ? ", " + state : state;
    return output;
};
Helpers.getQueryVariable = function (variable) {
    var query = window.location.search.substring(1);
    var output = false;
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            output = pair[1];
            break;
        }
    }
    return output;
};
Helpers.createCSSClass = function (selector, style) {
//FROM: http://stackoverflow.com/questions/1720320/how-to-dynamically-create-css-class-in-javascript-and-apply
    if (!document.styleSheets) {
        return;
    }

    if (document.getElementsByTagName("head").length == 0) {
        return;
    }

    var styleSheet;
    var mediaType;
    var media;
    if (document.styleSheets.length > 0) {
        for (i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) {
                continue;
            }
            media = document.styleSheets[i].media;
            mediaType = typeof media;

            if (mediaType == "string") {
                if (media == "" || (media.indexOf("screen") != -1)) {
                    styleSheet = document.styleSheets[i];
                }
            } else if (mediaType == "object" && media.mediaText) {
                if (media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
                    styleSheet = document.styleSheets[i];
                }
            }

            if (Helpers.exists(styleSheet)) {
                break;
            }
        }
    }

    if (Helpers.exists(styleSheet)) {
        var styleSheetElement = document.createElement("style");
        styleSheetElement.type = "text/css";

        document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

        for (i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) {
                continue;
            }
            styleSheet = document.styleSheets[i];
        }

        media = styleSheet.media;
        mediaType = typeof media;
    }

    var i;
    if (mediaType == "string") {
        for (i = 0; i < styleSheet.rules.length; i++) {
            if (styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                styleSheet.rules[i].style.cssText = style;
                return;
            }
        }
        styleSheet.addRule(selector, style);
    } else if (mediaType == "object") {
        for (i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                styleSheet.cssRules[i].style.cssText = style;
                return;
            }
        }
        styleSheet.insertRule(selector + "{" + style + "}", 0);
    }
};
Helpers.loadCSSFiles = function (cssArray) {
    if (typeof(cssArray) == 'string') cssArray = [cssArray];
    if (!_.isArray(cssArray)) cssArray = [];

    for (var c = 0; c < cssArray.length; c++) {
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", cssArray[c]);
        document.getElementsByTagName("head")[0].appendChild(link);
    }
};
Helpers.directoryOfPage = function (url) {
    url = url || document.location.href;
    var lio = url.lastIndexOf("/");
    return url.substr(0, lio + 1);
};
Helpers.randomcolor = function (brightness) {
    if (!Helpers.exists(brightness)) return '#' + Math.floor(Math.random() * 16777215).toString(16);

    //6 levels of brightness from 0 to 5, 0 being the darkest
    var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
    var mix = [brightness * 51, brightness * 51, brightness * 51]; //51 => 255/5
    var mixed_rgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(function (x) {
        return Math.round(x / 2.0)
    });
    return "rgb(" + mixed_rgb.join(",") + ")";
};
Helpers.randRange = function (minVal, maxVal, floatVal) {
    //From: JSEDI
    //optional Floatval specifies number of decimal points
    var randVal = minVal + (Math.random() * (maxVal - minVal + 1));
    return (Helpers.exists(floatVal)) ? Math.round(randVal - .5) : randVal.toFixed(floatVal);
};
Helpers.round = function (num, dec) {
    return (Math.round(num * (Math.pow(10, dec))) / Math.pow(10, dec));
};
Helpers.hexFromDec = function (decimal) {
    var code = Math.round(decimal).toString(16);
    (code.length > 1) || (code = '0' + code);
    return code;
};
Helpers.randomcolor_basedon = function (colorrgb) {
    colorrgb = colorrgb || "#505050";
    if (colorrgb.indexOf("#") == 0) colorrgb = colorrgb.substr(1);
    if (colorrgb.length && colorrgb.length == 3)
        colorrgb = colorrgb.substr(0, 1) + "0" + colorrgb.substr(1, 1) + "0" + colorrgb.substr(2, 1) + "0";
    var r = parseInt(colorrgb.substr(0, 2), 16);
    var g = parseInt(colorrgb.substr(2, 2), 16);
    var b = parseInt(colorrgb.substr(4, 2), 16);
    var range = 16;
    r = Helpers.hexFromDec(r + Helpers.randRange(0, range) - (range / 2));
    g = Helpers.hexFromDec(g + Helpers.math.randRange(0, range) - (range / 2));
    b = Helpers.hexFromDec(b + Helpers.math.randRange(0, range) - (range / 2));
    return "#" + r + g + b;
};
Helpers.color_transparency = function (colorrgb, trans) {
    colorrgb = colorrgb || "#505050";
    if (colorrgb.indexOf("#") == 0) colorrgb = colorrgb.substr(1);
    if (colorrgb.length && colorrgb.length == 3)
        colorrgb = colorrgb.substr(0, 1) + "0" + colorrgb.substr(1, 1) + "0" + colorrgb.substr(2, 1) + "0";
    var r = parseInt(colorrgb.substr(0, 2), 16);
    var g = parseInt(colorrgb.substr(2, 2), 16);
    var b = parseInt(colorrgb.substr(4, 2), 16);
    return "rgba(" + r + "," + g + "," + b + "," + trans + ")";
};

Helpers.steppedGYR = function (percentage) {
    percentage = percentage || 0;
    var ret;
    if (percentage <= .5) {
        ret = Helpers.blendColors("#00ff00", '#ffff00', percentage * 2);
    } else {
        ret = Helpers.blendColors('#ffff00', "#ff0000", (percentage - .5) * 2);
    }
    return ret;
};
Helpers.blendColors = function (c1, c2, percentage) {
    if (typeof Colors == 'undefined') {
        throw "Requires colors.min.js library";
    }
    if (!c1 || !c2) return c1;

    c1 = (c1.indexOf('#') == 0) ? c1 = Colors.hex2rgb(c1) : Colors.name2rgb(c1);
    c2 = (c2.indexOf('#') == 0) ? c2 = Colors.hex2rgb(c2) : Colors.name2rgb(c2);

    var rDiff = (c2.R - c1.R) * percentage;
    var gDiff = (c2.G - c1.G) * percentage;
    var bDiff = (c2.B - c1.B) * percentage;


    var result = Colors.rgb2hex(parseInt(c1.R + rDiff), parseInt(c1.G + gDiff), parseInt(c1.B + bDiff));
    if (result.indexOf('#') != 0) {
        result = c1;
    }
    return result;
};
Helpers.bw = function (color) {
//r must be an rgb color array of 3 integers between 0 and 255.
    if (typeof Colors == 'undefined') {
        throw "Requires colors.min.js library";
    }

    var r = Colors.hex2rgb(color).a;

    var contrast = function (B, F) {
        var abs = Math.abs,
            BG = (B[0] * 299 + B[1] * 587 + B[2] * 114) / 1000,
            FG = (F[0] * 299 + F[1] * 587 + F[2] * 114) / 1000,
            bright = Math.round(Math.abs(BG - FG)),
            diff = abs(B[0] - F[0]) + abs(B[1] - F[1]) + abs(B[2] - F[2]);
        return [bright, diff];
    };
    var c, w = [255, 255, 255], b = [0, 0, 0];
    if (r[1] > 200 && (r[0] + r[2]) < 50) c = b;
    else {
        var bc = contrast(b, r);
        var wc = contrast(w, r);
        if ((bc[0] * 4 + bc[1]) > (wc[0] * 4 + wc[1])) c = b;
        else if ((wc[0] * 4 + wc[1]) > (bc[0] * 4 + bc[1])) c = w;
        else c = (bc[0] < wc[0]) ? w : b;
    }
    return 'rgb(' + c.join(',') + ')';
};
Helpers.removeMobileAddressBar = function (doItNow) {
    function fixSize() {
        // Get rid of address bar on iphone/ipod
        window.scrollTo(0, 0);
        document.body.style.height = '100%';
        if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
            if (document.body.parentNode) {
                document.body.parentNode.style.height = '100%';
            }
        }
    }

    if (doItNow) {
        fixSize();
    } else {
        setTimeout(fixSize, 700);
        setTimeout(fixSize, 1500);
    }
};

Helpers.orientationInfo = function (x, y) {
    x = x || $(window).width();
    y = y || $(window).height();
    var layout = (x > y) ? 'horizontal' : 'vertical';

    return {layout: layout, ratio: x / y};
};
Helpers.dots = function (num) {
    var output = "";
    for (var i = 0; i < num; i++) {
        if (i % 5 == 0) output += " ";
        output += "&#149;";
    }
    if (num == 0) {
        output = "0";
    }
    return output;
};
Helpers.isIOS = function () {
    navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/);
};
Helpers.exists = function () {
    //Check if variables exist
    var allExist = true;
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] == "undefined") {
            allExist = false;
            break;
        }
    }
    return allExist;
};
Helpers.distanceXY = function (p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
};
Helpers.isInArray = function (searchFor, searchIn, ignoreCase) {
    if (!Helpers.exists(searchFor) || !Helpers.exists(searchIn)) return false;
    if (!Helpers.isArray(searchFor)) searchFor = [searchFor];
    if (!Helpers.isArray(searchIn)) searchIn = [searchIn];
    var found = false;
    for (var i = 0; i < searchFor.length; i++) {
        for (var j = 0; j < searchIn.length; j++) {
            var s_f = searchFor[i];
            var s_i = searchIn[j];
            if (ignoreCase && typeof s_f == 'string' && typeof s_i == 'string') {
                if (s_f.toLowerCase() == s_i.toLowerCase()) {
                    found = true;
                    break;
                }
            } else {
                if (s_f == s_i) {
                    found = true;
                    break;
                }
            }
        }
    }
    return found;
};


(function ($) {
    // eventType - "click", "mouseover" etc.
    // destination - either jQuery object, dom element or selector
    // clearCurrent - if true it will clear current handlers at destination - default false
    $.fn.copyEventTo = function (eventType, destination, clearCurrent) {
        var events = [];
        this.each(function () {
            var allEvents = jQuery._data(this, "events");
            if (typeof allEvents === "object") {
                var thoseEvents = allEvents[eventType];
                if (typeof thoseEvents === "object") {
                    for (var i = 0; i < thoseEvents.length; i++) {
                        events.push(allEvents[eventType][i].handler);
                    }
                }
            }
        });
        if (typeof destination === "string") {
            destination = $(destination);
        } else if (typeof destination === "object") {
            if (typeof destination.tagName === "string") {
                destination = $(destination);
            }
        }
        if (clearCurrent === true) destination.off(eventType);
        destination.each(function () {
            for (var i = 0; i < events.length; i++) {
                destination.bind(eventType, events[i]);
            }
        });
        return this;
    }

})(jQuery);

(function(){

  if ("performance" in window == false) {
      window.performance = {};
  }

  Date.now = (Date.now || function () {  // thanks IE8
	  return new Date().getTime();
  });

  if ("now" in window.performance == false){

    var nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }

    window.performance.now = function now(){
      return Date.now() - nowOffset;
    }
  }

})();
var Civvies = (function ($, _, Helpers, maths) {
    //Uses jquery and Underscore

    //-----------------------------
    //Private Global variables
    var version = '0.0.1',
        summary = 'HTML game engine to simulate civilization or city building.',
        author = 'Jay Crossler - http://github.com/jaycrossler',
        file_name = 'civvies.js';

    var _data = {};
    var _game_options = {};

    //-----------------------------
    //Initialization
    function CivviesClass(option1, option2, option3) {
        this.version = file_name + ' (version ' + version + ') - ' + summary + ' by ' + author;
        this.timing_log = [];
        this.game_options = null;
        this.times_game_drawn = 0;
        this.initialization_seed = null;

        return this.initialize(option1, option2, option3);
    }

    CivviesClass.prototype.initialize = function (option1, option2, option3) {
        if (option1 == 'get_private_functions') {
            return this._private_functions;
        } else if (option1 == '') {
                //Class initialized
        } else {
            this.drawOrRedraw(option1, option2, option3);
        }
    };

    CivviesClass.prototype.data = _data;

    CivviesClass.prototype.initializeOptions = function (option_type, options) {
        if (option_type == 'game_options') {
            _game_options = options;
        }
    };

    CivviesClass.prototype.drawOrRedraw = function (game_options) {
        //Begin timing loop
        var timing_start = window.performance.now();
        var game = this;

        //Set up initialization data if not previously set
        if (game.game_options === null) {
            game.initialization_seed = null;
        }
        game.initialization_options = game_options || game.initialization_options || {};
        game.game_options = $.extend({}, game.game_options || _game_options, game_options || {});

        //Determine the random seed to use.  Either use the one passed in, the existing one, or a random one.
        game_options = game_options || {};
        var rand_seed = game_options.rand_seed || game.initialization_seed || Math.floor(Math.random() * 100000);
        game.initialization_seed = rand_seed;
        game.initialization_options.rand_seed = rand_seed;
        game.randomSetSeed(rand_seed);

        if (!game.data.gui_drawn && game._private_functions.buildInitialDisplay) {
            game.data.gui_drawn = true;
            game._private_functions.buildInitialData(game);
            game._private_functions.buildInitialDisplay(game);
        }

        //Begin Game Simulation
        game.start(game_options);

        //Log timing information
        var timing_end = window.performance.now();
        var time_elapsed = (timing_end - timing_start);
        game.timing_log.push({name: "build-elapsed", elapsed: time_elapsed, times_redrawn: game.times_game_drawn});
    };

    //-----------------------------
    //Supporting functions
    CivviesClass.prototype.log = function (showToConsole, showHTML) {
        var log = "Civvies: [seed:" + this.game_options.rand_seed + " #" + this.times_game_drawn + "]";
        _.each(this.timing_log, function (log_item) {
            if (log_item.name == 'exception') {
                if (log_item.ex && log_item.ex.name) {
                    log += "\n -- EXCEPTION: " + log_item.ex.name + ", " + log_item.ex.message;
                } else if (log_item.msg) {
                    log += "\n -- EXCEPTION: " + log_item.msg;
                } else {
                    log += "\n -- EXCEPTION";
                }
            } else if (log_item.elapsed) {
                log += "\n - " + log_item.name + ": " + Helpers.round(log_item.elapsed, 4) + "ms";
            } else {
                log += "\n - " + log_item.name;
            }
        });

        if (showToConsole) console.log(log);
        if (showHTML) log = log.replace(/\n/g, '<br/>');
        return log;
    };
    CivviesClass.prototype.logMessage = function (msg, showToConsole) {
        if (_.isString(msg)) msg = {name: msg};

        this.timing_log.push(msg);
        if (showToConsole) {
            console.log(msg);
        }
        if (this._private_functions.log_display) {
            this._private_functions.log_display(this);
        }
    };
    CivviesClass.prototype.lastTimeDrawn = function () {
        var time_drawn = 0;
        var last = _.last(this.timing_log);
        if (last) time_drawn = last.elapsed;

        return time_drawn;
    };

    CivviesClass.prototype.getSeed = function (showAsString) {
        var result = this.initialization_options || {};
        return showAsString ? JSON.stringify(result) : result;
    };

    CivviesClass.prototype.start = function (game_options) {
        if (this._private_functions.start_game_loop) {
            this._private_functions.start_game_loop(this, game_options);
        } else {
            throw "Game loop not found";
        }
    };
    CivviesClass.prototype.stop = function () {
        if (this._private_functions.stop_game_loop) {
            this._private_functions.stop_game_loop(this);
        }
    };

    //----------------------
    //Random numbers
    CivviesClass.prototype.randomSetSeed = function (seed) {
        this.game_options = this.game_options || {};
        this.game_options.rand_seed = seed || Math.random();
    };

    function random(game_options) {
        game_options = game_options || {};
        game_options.rand_seed = game_options.rand_seed || Math.random();
        var x = Math.sin(game_options.rand_seed++) * 300000;
        return x - Math.floor(x);
    }

    function randInt(max, game_options) {
        max = max || 100;
        return parseInt(random(game_options) * max + 1);
    }

    function randOption(options, game_options, dontUseVal) {
        var len = options.length;
        var numChosen = randInt(len, game_options) - 1;
        var result = options[numChosen];
        if (dontUseVal) {
            if (result == dontUseVal) {
                numChosen = (numChosen + 1) % len;
                result = options[numChosen];
            }
        }
        return result;
    }

    CivviesClass.prototype._private_functions = {
        random: random,
        randInt: randInt,
        randOption: randOption
    };

    return CivviesClass;
})($, _, Helpers, maths);

Civvies.initializeOptions = function (option_type, options) {
    var civ_pointer = new Civvies('');
    civ_pointer.initializeOptions(option_type, options);
};
(function (Civvies) {

    var $pointers = {};

    var purchase_multiples = [1, 10, 100, 1000];
    var assign_multiples = ['-all', -100, -10, -1, 'info', 1, 10, 100, '+max'];

    //------------------------------------------
    function show_basic_resources(game) {
        $('<h3>')
            .text('Resources')
            .appendTo($pointers.basic_resources);
        var $table = $('<table>')
            .appendTo($pointers.basic_resources);

        _.each(game.game_options.resources, function (resource) {
            if (resource.grouping == 1) {
                var name = _.str.titleize(resource.title || resource.name);
                var $tr = $('<tr>')
                    .appendTo($table);
                var $td1 = $('<td>')
                    .appendTo($tr);
                var times = resource.amount_from_click || 1;
                var title = (times == 1) ? name : times + " " + Helpers.pluralize(name);
                var description = _c.cost_benefits_text(game, resource, true, times);

                $('<button>')
                    .text('Gather ' + name)
                    .popover({title: "Manually Gather " + title, content: description, trigger: 'hover', placement: 'bottom', html: true})
                    .on('click', function () {
                        _c.increment_from_click(game, resource);
                    })
                    .appendTo($td1);
                $('<td>')
                    .text(name + ":")
                    .appendTo($tr);
                resource.$holder = $('<td>')
                    .addClass('number')
                    .attr('id', 'resource-' + resource.name)
                    .text(0)
                    .appendTo($tr);
                var $td4 = $('<td>')
                    .addClass('icon')
                    .appendTo($tr);
                $('<img>')
                    .attr('src', resource.image)
                    .addClass('icon icon-lg')
                    .appendTo($td4);
                resource.$max = $('<td>')
                    .addClass('number')
                    .attr('id', 'resource-max-' + resource.name)
                    .text("(Max: " + game.game_options.storage_initial + ")")
                    .appendTo($tr);
                resource.$rate = $('<td>')
                    .addClass('number net')
                    .attr('id', 'resource-rate-' + resource.name)
                    .text("0/s")
                    .appendTo($tr);
            }
        });
    }

    function show_secondary_resources(game) {
        //TODO: Add some info on popover
        $('<h3>')
            .text('Special Resources')
            .appendTo($pointers.secondary_resources);

        _.each(game.game_options.resources, function (resource) {
            if (resource.grouping == 2) {
                var name = _.str.titleize(resource.title || resource.name);

                var $div = $('<div>')
                    .addClass('icon resource-holder')
                    .appendTo($pointers.secondary_resources);
                $('<span>')
                    .text(name + ":")
                    .appendTo($div);
                resource.$holder = $('<span>')
                    .attr('id', 'resource-' + resource.name)
                    .text(0)
                    .appendTo($div);
                $('<img>')
                    .attr('src', resource.image)
                    .addClass('icon icon-lg')
                    .appendTo($div);
            }
        });
    }

    function update_resources(game) {
        _.each(game.game_options.resources, function (resource) {
            if (resource.$holder) {
                var res_data = game.data.resources[resource.name];
                res_data = Helpers.abbreviateNumber(res_data);
                resource.$holder.text(res_data)
            }

            if (resource.$max) {
                var res_max = _c.getResourceMax(game, resource);
                res_max = Helpers.abbreviateNumber(res_max);
                resource.$max.text("(Max: " + res_max + ")")
            }

            if (resource.$rate) {
                var res_rate = _c.getResourceRate(game, resource);
                resource.$rate.text(res_rate)
            }
        });

        _.each(game.game_options.buildings, function (building) {
            if (building.$holder) {
                var building_data = game.data.buildings[building.name];
                building_data = Helpers.abbreviateNumber(building_data);
                building.$holder.text(building_data)
            }
        });
    }

    //------------------------------------------
    function show_building_buttons(game) {
        $('<h3>')
            .text('Buildings')
            .hide()
            .appendTo($pointers.building_list);
        var $table = $('<table>')
            .appendTo($pointers.building_list);

        var lastStyle = game.game_options.buildings[0].type;

        _.each(game.game_options.buildings, function (building) {
            var name = _.str.titleize(building.title || building.name);
            var amount = game.data.buildings[building.name];

            if (building.type != lastStyle) {
                $('<tr>')
                    .css({height: '6px'})
                    .appendTo($table);
            }
            lastStyle = building.type;

            var $tr = $('<tr>')
                .appendTo($table);
            if (!amount) $tr.hide();

            var $td1 = $('<td>')
                .appendTo($tr);
            _.each(purchase_multiples, function (times) {
                var text = (times > 1) ? "x" + times : 'Build ' + name;
                var btn_class = (times > 1) ? "x" + times : '';

                var title = (times == 1) ? name : times + " " + Helpers.pluralize(name);
                var description = _c.cost_benefits_text(game, building, true, times);

                building["$btn_x" + times] = $('<button>')
                    .text(text)
                    .popover({title: "Build " + title, content: description, trigger: 'hover', placement: 'bottom', html: true})
                    .prop({disabled: true})
                    .addClass(btn_class)
                    .on('click', function () {
                        _c.create_building(game, building, times);
                    })
                    .appendTo($td1);
            });
            $('<td>')//TODO: These aren't aligning properly
                .text(Helpers.pluralize(name) + ": ")
                .appendTo($tr);
            building.$holder = $('<td>')
                .addClass('number')
                .attr('id', 'building-' + building.name)
                .text(amount)
                .appendTo($tr);

            building.$display = $tr;
        });

    }

    function update_building_buttons(game) {
        var buildings_shown = false;
        _.each(game.game_options.buildings, function (building) {

            var purchasable = _c.building_is_purchasable(game, building, 1);
            var enabled;

            if (!building.shown_before && purchasable) {
                building.shown_before = true;
                building.$display.css({display: "block"});
            }
            if (building.shown_before) {
                buildings_shown = true;

                enabled = purchasable;
                _.each(purchase_multiples, function (times) {
                    enabled = _c.building_is_purchasable(game, building, times);
                    var $btn = building["$btn_x" + times];
                    var currently_disabled = $btn.prop('disabled');
                    if (!currently_disabled && !enabled) {
                        //Changing to disabled, so turn off any popovers
                        $btn.popover('hide');
                    }
                    $btn.prop({disabled: !enabled});

                });
            }
        });
        if (buildings_shown) {
            $pointers.building_list.find('h3').show();
        }
    }

    //------------------------------------------
    function show_population_data(game) {
        $('<h3>')
            .text('Population')
            .appendTo($pointers.population_info);

        var population = _c.population(game);
        var population_current = population.current;
        var population_max = population.max;

        var $d1 = $('<div>')
            .appendTo($pointers.population_info);
        $("<span>")
            .text("Current Population: ")
            .appendTo($d1);
        $pointers.population_current = $("<span>")
            .text(population_current)
            .appendTo($d1);

        var $d2 = $('<div>')
            .appendTo($pointers.population_info);
        $("<span>")
            .text("Maximum Population: ")
            .appendTo($d2);
        $pointers.population_max = $("<span>")
            .text(population_max)
            .appendTo($d2);


        var $d3 = $("<div>")
            .appendTo($pointers.population_info);
        _.each(purchase_multiples, function (times) {
            var $inner = $('<div>')
                .appendTo($d3);

            var text = (times > 1) ? "Create " + times + " workers" : "Create worker";

            var food_cost = _c.worker_food_cost(game, times);
            var description = "Consume " + food_cost + " food";

            $pointers["create_workers_x" + times] = $('<button>')
                .text(text)
                .prop({disabled: true})
                .on('click', function () {
                    _c.create_workers(game, times);
                    _c.redraw_data(game);
                })
                .appendTo($inner);
            $pointers["create_workers_x" + times + "_cost"] = $("<span>")
                .text(description)
                .appendTo($inner);
        });
    }

    function update_population_data(game) {
        var population = _c.population(game);
        var population_current = population.current;
        var population_max = population.max;

        $pointers.population_current.text(population_current);
        $pointers.population_max.text(population_max);

        _.each(purchase_multiples, function (times) {

            var food_cost = _c.worker_food_cost(game, times);
            var description = "Consume " + food_cost + " food";

            $pointers["create_workers_x" + times]
                .prop({disabled: !_c.workers_are_creatable(game, times)});

            $pointers["create_workers_x" + times + "_cost"]
                .text(description);
        });
    }

    //------------------------------------------
    function show_jobs_list(game) {
        $('<h3>')
            .text('Jobs')
            .hide()
            .appendTo($pointers.jobs_list);

        var $table = $('<table>')
            .appendTo($pointers.jobs_list);

        var lastStyle = game.game_options.populations[0].type;
        _.each(game.game_options.populations, function (job) {
            var name = _.str.titleize(job.title || job.name);
            var amount = game.data.populations[job.name];

            if (job.type != lastStyle) {
                $('<tr>')
                    .css({height: '6px'})
                    .appendTo($table);
            }
            lastStyle = job.type;

            var $tr = $('<tr>')
                .appendTo($table);
            if (!amount) $tr.hide();

            var $td1 = $('<td>')
                .appendTo($tr);
            _.each(assign_multiples, function (times) {
                var times_text;
                var use_button = false;
                var show = false;

                if (_.isNumber(times)) {
                    if (times > 0) {
                        times_text = "+" + times;
                    } else {
                        times_text = times;
                    }
                    if (!job.unassignable) {
                        use_button = true;
                        show = true;
                    }
                } else if (times == 'info') {
                    times_text = name + ": ";
                    show = true;
                } else {
                    times_text = times;
                    use_button = true;
                    if (!job.unassignable) {
                        show = true;
                    }
                }

                var title = (_.isString(times)) ? name : times + " " + Helpers.pluralize(name);
                var description = _c.cost_benefits_text(game, job, true, times);

                if (show){
                    if (use_button) {
                        job["$btn_x" + times] = $('<button>')
                            .text(times_text)
                            .popover({title: "Assign " + title, content: description, trigger: 'hover', placement: 'bottom', html: true})
                            .prop({disabled: true})
                            .addClass('multiplier')
                            .on('click', function () {
                                _c.assign_workers(game, job, times);
                                _c.redraw_data(game);
                            })
                            .appendTo($td1);
                    } else {
                        var $inner = $('<div>')
                            .addClass('multiplier_holder')
                            .popover({title: title, content: description, trigger: 'hover', placement: 'bottom', html: true})
                            .appendTo($td1);
                        $('<span>')
                            .text(times_text)
                            .appendTo($inner);
                        job.$holder = $('<span>')
                            .addClass('number')
                            .attr('id', 'job-' + job.name)
                            .text(amount)
                            .appendTo($inner);
                    }
                }

            });

            job.$display = $tr;
        });
    }

    function update_jobs_list(game) {
        var jobs_shown = false;
        _.each(game.game_options.populations, function (job) {

            var amount = game.data.populations[job.name];
            var assignable = _c.population_is_assignable(game, job, 1);
            var enabled;

            if (!job.shown_before && (assignable || amount)) {
                job.shown_before = true;
                job.$display.css({display: "block"});
            }
            if (job.shown_before) {
                jobs_shown = true;

                enabled = assignable;
                job.$holder.text(amount);

                _.each(assign_multiples, function (times) {
                    enabled = _c.population_is_assignable(game, job, times);
                    var $btn = job["$btn_x" + times];
                    if ($btn) {
                        var currently_disabled = $btn.prop('disabled');
                        if (!currently_disabled && !enabled) {
                            //Changing to disabled, so turn off any popovers
                            $btn.popover('hide');
                        }
                        $btn.prop({disabled: !enabled});
                    }
                });
            }
        });
        if (jobs_shown) {
            $pointers.jobs_list.find('h3').show();
        }
    }

    //------------------------------------------
    function show_upgrades_list(game) {
        var $available = $('<h3>')
            .text('Available Upgrades')
            .appendTo($pointers.upgrade_list);
        $("<div>")
            .appendTo($available);

        var $researched = $('<h3>')
            .text('Researched Upgrades')
            .appendTo($pointers.upgrade_list);
        $("<div>")
            .appendTo($researched);

        var lastStyle = '';
        var upgrades_non_deity = _.filter(game.game_options.upgrades, function(up){return up.type != 'deity'});
        _.each(upgrades_non_deity, function (upgrade) {
            var name = _.str.titleize(upgrade.title || upgrade.name);
            var has_upgrade = game.data.upgrades[upgrade.name];
            var can_purchase = _c.can_purchase_upgrade(game, upgrade);

            var title = "Upgrade: "+name;
            var description = _c.cost_benefits_text(game, upgrade, true);

            if (upgrade.type != lastStyle) {
                $('<div>')
                    .css({fontSize:'8px'})
                    .text(_.str.titleize(upgrade.type) + ":")
                    .appendTo($available);
            }
            lastStyle = upgrade.type;

            upgrade.$holder = $('<button>')
                .text(name)
                .css({display: has_upgrade ? 'none' : 'inline-block'})
                .prop({disabled:!can_purchase})
                .popover({title: title, content: description, trigger: 'hover', placement: 'top', html: true})
                .on('click', function(){
                    upgrade.$holder.popover('hide');
                    _c.purchase_upgrade(game, upgrade);
                    _c.redraw_data(game);
                })
                .addClass('icon upgrade_holder')
                .appendTo($available);

            upgrade.$holder_purchased = $('<div>')
                .text(name)
                .css({backgroundColor:'lightgreen', display: has_upgrade ? 'inline-block' : 'none'})
                .popover({title: 'Purchased '+title, content: description, trigger: 'hover', placement: 'top', html: true})
                .addClass('icon upgrade_holder')
                .appendTo($researched);
        });
    }
    function update_upgrade_list(game) {
        var upgrades_non_deity = _.filter(game.game_options.upgrades, function(up){return up.type != 'deity'});
        _.each(upgrades_non_deity, function (upgrade) {
            var has_upgrade = game.data.upgrades[upgrade.name];
            var can_purchase = _c.can_purchase_upgrade(game, upgrade);

            upgrade.$holder
                .css({display: has_upgrade ? 'none' : 'inline-block'})
                .prop({disabled:!can_purchase});

            upgrade.$holder_purchased
                .css({display: has_upgrade ? 'inline-block' : 'none'})
        });
    }

    //-------------------------------------------------
    var _c = new Civvies('get_private_functions');
    _c.buildInitialDisplay = function (game) {
        $pointers.basic_resources = $('#basic_resources');
        show_basic_resources(game);

        $pointers.secondary_resources = $('#secondary_resources');
        show_secondary_resources(game);

        $pointers.building_list = $('#buildingsPane');
        show_building_buttons(game);

        $pointers.population_info = $('#populationContainer');
        show_population_data(game);

        $pointers.jobs_list = $('#jobsContainer');
        show_jobs_list(game);

        $pointers.logs = $('#eventsContainer');

        $pointers.upgrade_list = $('#upgradesPane');
        show_upgrades_list(game);

    };

    _c.redraw_data = function (game) {
        //TODO: Don't show these every time
        update_resources(game);
        update_building_buttons(game);
        update_population_data(game);
        update_jobs_list(game);
        update_upgrade_list(game);
    };

    _c.log_display = function(game) {
        if ($pointers.logs) {
            var log = "<b>Civvies: [seed:" + game.game_options.rand_seed + "]</b>";

            var head_log = _.last(game.timing_log, 5);
            _.each(head_log.reverse(), function (log_item){
                if (log_item.name == 'exception') {
                    if (log_item.ex && log_item.ex.name) {
                        log += "<br/> -- EXCEPTION: " + log_item.ex.name + ", " + log_item.ex.message;
                    } else if (log_item.msg) {
                        log += "<br/> -- EXCEPTION: " + log_item.msg;
                    } else {
                        log += "<br/> -- EXCEPTION";
                    }
                } else if (log_item.elapsed) {
                    log += "<br/> - " + log_item.name + ": " + Helpers.round(log_item.elapsed, 4) + "ms";
                } else {
                    log += "<br/> - " + log_item.name;
                }
            });
            $pointers.logs.html(log);
        }
    };

    _c.updateBuildingTotals = function () {

    };
    _c.updateSpawnButtons = function () {

    };
    _c.updateJobs = function () {

    };
    _c.updateJobButtons = function () {

    };
    _c.updateUpgrades = function () {

    };
    _c.updateDeity = function () {

    };
    _c.updateOldDeities = function () {

    };
    _c.updateMobs = function () {

    };
    _c.updateDevotion = function () {

    };
    _c.updateRequirements = function () {

    };
    _c.updateAchievements = function () {

    };
    _c.updateParty = function () {

    };
    _c.updatePartyButtons = function () {

    };
    _c.updateTargets = function () {

    };
    _c.updateHappiness = function () {

    };
    _c.updateWonder = function () {

    };
    _c.updateWonderList = function () {

    };
    _c.updateReset = function () {

    };
    _c.paneSelect = function () {

    };
    _c.toggleCustomIncrements = function () {

    };
    _c.toggleNotes = function () {

    };
    _c.impExp = function () {

    };
    _c.tips = function () {

    };
    _c.versionAlert = function () {

    };
    _c.text = function () {

    };
    _c.textShadow = function () {

    };
    _c.iconToggle = function () {

    };
    _c.prettify = function () {

    };
    _c.toggleDelimiters = function () {

    };
    _c.toggleWorksafe = function () {

    };
    _c.gameLog = function () {

    };


})(Civvies);
(function (Civvies) {
    var _c = new Civvies('get_private_functions');

    _c.increment_from_click = function (game, resource) {
        _c.increment_resource(game, resource, resource.amount_from_click || 1);
        _c.redraw_data(game);
        //TODO: Add in a delay, and a gui-countdown wipe in orange

    };
    _c.buildInitialData = function (game) {
        game.data = game.data || {};

        game.data.resources = game.data.resources || {};
        _.each(game.game_options.resources, function (resource) {
            game.data.resources[resource.name] = resource.initial || 0;
        });

        game.data.buildings = game.data.buildings || {};
        _.each(game.game_options.buildings, function (building) {
            game.data.buildings[building.name] = building.initial || 0;
        });

        game.data.populations = game.data.populations || {};
        _.each(game.game_options.populations, function (population) {
            game.data.populations[population.name] = population.initial || 0;
        });

        game.data.variables = game.data.variables || {};
        _.each(game.game_options.variables, function (variable) {
            game.data.variables[variable.name] = variable.value || 0;
        });

        game.data.upgrades = game.data.upgrades || {};
        _.each(game.game_options.upgrades, function (upgrade) {
            game.data.upgrades[upgrade.name] = upgrade.initial || false;
        });

        game.data.achievements = game.data.achievements || {};
        _.each(game.game_options.achievements, function (achievement) {
            game.data.achievements[achievement.name] = achievement.initial || false;
        });
    };
    _c.info = function (game, kind, name, sub_var, if_not_listed) {
        //Usage:  var info = _c.info(game, 'buildings', resource.name);
        var val = _.find(game.game_options[kind], function (item) {
            return item.name == name
        });
        if (val && sub_var) {
            val = val[sub_var];
        }
        if (!val) val = if_not_listed;

        return val;
    };
    _c.getResourceMax = function (game, resource) {
        var storage = game.game_options.storage_initial;
        _.each(game.game_options.buildings, function (building) {
            if (building.supports && building.supports[resource.name]) {
                var num_buildings = game.data.buildings[building.name];
                storage += (num_buildings * building.supports[resource.name]);
            }
        });
        return storage;
    };
    _c.getResourceRate = function (game, resource) {

    };
    _c.cost_benefits_text = function (game, item, as_html, times) {
        times = times || 1;
        if (!_.isNumber(times)) times = 1;

        var costs = [];
        var consumes = [];
        var benefits = [];
        var supports = [];
        var produces = [];
        var key, amount, out;

        for (key in item.costs || {}) {
            amount = item.costs[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='cost_text'>" + out + "</span>"
            }
            costs.push(out);
        }
        for (key in item.consumes || {}) {
            amount = item.consumes[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='cost_text'>" + out + "</span>"
            }
            consumes.push(out);
        }
        for (key in item.benefits || {}) {
            amount = item.benefits[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='benefit_text'>" + out + "</span>"
            }
            benefits.push(out);
        }
        for (key in item.produces || {}) {
            amount = item.produces[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='benefit_text'>" + out + "</span>"
            }
            produces.push(out);
        }
        for (key in item.supports || {}) {
            amount = item.supports[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='benefit_text'>" + out + "</span>"
            }
            supports.push(out);
        }
        if (item.population_supports) {
            if (amount == 1) {
                out = "houses 1 person";
            } else {
                out = "houses " + Helpers.abbreviateNumber(item.population_supports * times) + " people";
            }
            if (as_html) {
                out = "<span class='benefit_population_text'>" + out + "</span>"
            }
            benefits.push(out);
        }
        var notes;
        if (item.notes) {
            notes = item.notes;
            if (as_html) {
                notes = "<span class='notes_text'>" + notes + "</span>";
            }
        }
        var gather;
        if (item.amount_from_click) {
            gather = "Gather " + item.amount_from_click + ' ' + Helpers.pluralize(item.name);
            if (as_html) {
                gather = "<span class='benefit_text'>" + gather + "</span>";
            }
        }
        var chances = [];
        _.each(item.chances || [], function (chance) {
            out = "";
            if (chance.resource) {
                out = "Chance to find " + chance.resource;
            }
            if (as_html) {
                out = "<span class='notes_text'>" + out + "</span>"
            }
            chances.push(out);
        });

        var text_pieces = [];
        if (gather) text_pieces.push(gather);
        if (costs.length) text_pieces.push("Costs: " + costs.join(", "));
        if (consumes.length) text_pieces.push("Consumes: " + consumes.join(", "));
        if (benefits.length) text_pieces.push("Benefits: " + benefits.join(", "));
        if (produces.length) text_pieces.push("Produces: " + produces.join(", "));
        if (chances.length) text_pieces.push(chances.join(", "));
        if (supports.length) text_pieces.push("Supports: " + supports.join(", "));
        if (notes) text_pieces.push("Notes: " + notes);

        var join_text = as_html ? ".</br>" : ".  ";

        return text_pieces.join(join_text) || "";
    };
    _c.create_building = function (game, building, amount) {
        amount = amount || 1;
        if (_c.building_is_purchasable(game, building, amount)) {
            var resource_costs = building.costs || {};
            for (var cost in resource_costs) {
                game.data.resources[cost] -= (amount * resource_costs[cost])
            }
            game.data.buildings[building.name] += amount;
            _c.redraw_data(game);

            game.logMessage("Purchased: " + amount + "x " + building.name, true);
        } else {
            console.error("Can't purchase building: " + amount + "x " + building.name);
        }
    };
    _c.building_is_purchasable = function (game, building, amount) {
        amount = amount || 1;
        var resource_costs = building.costs || {};
        var upgrades_cost = building.upgrades || {};

        var buildable = true;
        for (var cost in resource_costs) {
            var current = game.data.resources[cost];
            if (current < (amount * resource_costs[cost])) {
                buildable = false;
                break;
            }
        }
        if (buildable) {
            for (var ucost in upgrades_cost) {
                var has_upgrade = game.data.upgrades[ucost];
                if (!has_upgrade) {
                    buildable = false;
                    break;
                }
            }
        }
        return buildable;
    };
    _c.test = function (game) {
        _c.increment_resource(game, _c.info(game, 'resources', 'food'), 1000);
        _c.increment_resource(game, _c.info(game, 'resources', 'wood'), 1000);
        _c.increment_resource(game, _c.info(game, 'resources', 'stone'), 1000);
        _c.increment_resource(game, _c.info(game, 'resources', 'herbs'), 10);
        _c.increment_resource(game, _c.info(game, 'resources', 'skins'), 10);
        _c.increment_resource(game, _c.info(game, 'resources', 'ore'), 10);
        _c.increment_resource(game, _c.info(game, 'resources', 'leather'), 10);
        _c.increment_resource(game, _c.info(game, 'resources', 'metal'), 10);

        _c.redraw_data(game);
    };
    _c.increment_resource = function (game, resource, amount) {

        //TODO: This now only does one roll, then gives resources if roll passes. Needs to simulate doing 'amount' roles
        var max = _c.getResourceMax(game, resource);
        game.data.resources[resource.name] = maths.clamp(game.data.resources[resource.name] + amount, 0, max);

        if (resource.chances) {
            _.each(resource.chances || [], function (chance) {
                var percent = chance.chance || 0.01;
                if (_.isString(percent)) {
                    percent = game.data.variables[percent];
                }
                if (_.isNumber(percent)) {
                    if (_c.random(game.game_options) < percent) {
                        if (chance.resource) {
                            game.data.resources[chance.resource] += amount;
                        }
                    }
                }
            });
        }
    };
    _c.population = function (game) {
        var pop = {current: 0, max: 0, current_that_eats: 0};

        var people = 0;
        var eaters = 0;
        for (var key in game.data.populations) {
            people += game.data.populations[key];
            if (!_c.info(game, 'populations', key, 'doesnt_consume_food', false)) {
                eaters += game.data.populations[key];
            }
        }
        pop.current = people;
        pop.current_that_eats = eaters;

        var storage = 0;
        _.each(game.game_options.buildings, function (building) {
            if (building.population_supports) {
                var num_buildings = game.data.buildings[building.name];
                storage += (num_buildings * building.population_supports);
            }
        });
        pop.max = storage;

        return pop;
    };
    _c.worker_food_cost = function (game, times) {
        var initial_cost = _c.info(game, 'variables', 'foodCostInitial', 'value', 20);
        times = times || 1;

        var pop = _c.population(game);
        var food_cost = initial_cost + Math.floor((pop.current + times) / 100);

        return food_cost * times;
    };
    _c.create_workers = function (game, times) {
        if (_c.workers_are_creatable(game, times)) {
            game.data.resources.food -= _c.worker_food_cost(game, times);
            game.data.populations.unemployed += times;

            game.logMessage("Purchased: " + times + "x unemployed workers", true);
        }
    };
    _c.workers_are_creatable = function (game, times) {
        var enough_food = (_c.worker_food_cost(game, times) <= game.data.resources.food);
        var enough_space = false;
        if (enough_food) {
            var pop = _c.population(game);
            enough_space = (pop.current + times <= pop.max);
        }
        return enough_food && enough_space;
    };
    _c.population_is_assignable = function (game, job, times) {
        times = times || 1;
        //TODO: Take into account all/max

        var assignable = false;
        if (!job.unassignable) {
            var current = game.data.populations[job.name];
            if (_.isNumber(times)) {
                if (times > 0) {
                    var unassigned_workers = game.data.populations.unemployed;
                    if (times <= unassigned_workers) assignable = true;
                } else {
                    if ((current + times) >= 0) assignable = true;
                }
            }
            if (assignable && !job.doesnt_require_office) {
                //Check through buildings
                var offices_total = 0;
                _.each(game.game_options.buildings, function (building) {
                    if (building.supports) {
                        var offices_per = building.supports[job.name];
                        if (offices_per) {
                            offices_total += (game.data.buildings[building.name] * offices_per);
                        }
                    }
                });
                assignable = ((current + times) <= offices_total);
            }
        }
        return assignable;
    };
    _c.assign_workers = function (game, job, times) {
        //TODO: Take into account all/max
        if (_c.population_is_assignable(game, job, times)) {
            if (_.isNumber(times)) {
                game.data.populations[job.name] += times;
                game.data.populations.unemployed -= times;
            }
        }
    };
    _c.can_purchase_upgrade = function (game, upgrade) {
        var resource_costs = upgrade.costs;

        var buildable = true;
        for (var cost in resource_costs) {
            var current = game.data.resources[cost];
            if (current < (resource_costs[cost])) {
                buildable = false;
                break;
            }
        }
        return buildable;
    };
    _c.purchase_upgrade = function (game, upgrade) {
        if (_c.can_purchase_upgrade(game, upgrade)){

            var resource_costs = upgrade.costs;

            for (var cost in resource_costs) {
                var amount = resource_costs[cost];
                _c.increment_resource(game, _c.info(game, 'resources', cost), -amount);
            }
            game.data.upgrades[upgrade.name] = true;
        }
    };


    //-Not implemented yet------------------
    _c.increment = function () {

    };
    _c.createBuilding = function () {

    };
    _c.buildCustom = function () {

    };
    _c.calcCost = function () {

    };
    _c.spawn = function () {

    };
    _c.spawnCustom = function () {

    };
    _c.jobCull = function () {

    };
    _c.hire = function () {

    };
    _c.hireAll = function () {

    };
    _c.fire = function () {

    };
    _c.fireAll = function () {

    };
    _c.fireCustom = function () {

    };
    _c.hireCustom = function () {

    };
    _c.raiseDead = function () {

    };
    _c.shade = function () {

    };
    _c.upgrade = function () {

    };
    _c.digGraves = function () {

    };
    _c.randomWorker = function () {

    };
    _c.wickerman = function () {

    };
    _c.walk = function () {

    };
    _c.pestControl = function () {

    };
    _c.plague = function () {

    };
    _c.spawnMob = function () {

    };
    _c.smite = function () {

    };
    _c.party = function () {

    };
    _c.partyCustom = function () {

    };
    _c.invade = function () {

    };
    _c.plunder = function () {

    };
    _c.glory = function () {

    };
    _c.grace = function () {

    };
    _c.mood = function () {

    };
    _c.startWonder = function () {

    };
    _c.renameWonder = function () {

    };
    _c.wonderBonus = function () {

    };
    _c.updateWonderLimited = function () {

    };
    _c.tradeTimer = function () {

    };
    _c.trade = function () {

    };
    _c.buy = function () {

    };
    _c.speedWonder = function () {

    };

})(Civvies);
(function (Civvies) {
    var _c = new Civvies('get_private_functions');

    function populations_produce_products(game) {
        for (var val in game.data.populations){
            var number =  game.data.populations[val];
            if (number) {
                var job_details = _c.info(game,'populations',val);
                var consumes = job_details.consumes;
                var produces = job_details.produces;
                var resource;

                var can_produce = number;

                if (consumes) {
                    var can_consume = number; //TODO: find the amount that can be consumed if it's only partial
                    for (resource in consumes) {
                        var res_c = _c.info(game,'resources',resource);
                        var amount_c = consumes[resource];
                        if (_.isString(amount_c)) {
                            amount_c = game.data.variables[amount_c];
                        }
                        _c.increment_resource(game, res_c, can_consume * -amount_c);
                    }
                    can_produce = can_consume;
                }

                if (produces && can_produce) {
                    for (resource in produces) {
                        var res_p = _c.info(game,'resources',resource);
                        var amount_p = produces[resource];
                        if (_.isString(amount_p)) {
                            amount_p = game.data.variables[amount_p];
                        }
                        _c.increment_resource(game, res_p, can_produce * amount_p);
                    }
                }
            }
        }
    }

    function eat_food_or_die(game) {
        var population = _c.population(game);

        if (population.current <= game.data.resources.food) {
            //Enough food, everyone is happy
            game.data.resources.food -= population.current_that_eats;
        } else {
            //The culling
            game.data.resources.food /= 2;

            //TODO: Runs out of farmers a bit fast, might need to tweak it

            var to_remove =  population.current_that_eats - game.data.resources.food - game.data.populations.farmers;
            game.logMessage("Not enough food, need to cull the population: " + to_remove, true);

            var culling_order = game.game_options.populations.sort(function(a,b){
                var a_ord = a.cull_order || ((a.doesnt_consume_food)? 15 : 5);
                var b_ord = b.cull_order || ((b.doesnt_consume_food)? 15 : 5);

                return a_ord - b_ord;
            });

            for (var p=0; p<culling_order.length; p++) {
                if (to_remove > 0 && !culling_order[p].doesnt_consume_food) {
                    var name = culling_order[p].name;
                    var num = game.data.populations[name];
                    if (num >= to_remove) {
                        game.data.populations[name] -= to_remove;
                        to_remove = 0;  //Culling stops here
                    } else {
                        to_remove -= game.data.populations[name];
                        game.data.populations[name] = 0;
                    }
                }
            }

        }
    }


    var game_loop_timer = null;
    _c.start_game_loop = function (game, game_options) {
        game_options = game_options || {};

        //Run game tick every second
        _c.stop_game_loop(game);
        game.logMessage('Game Loop Starting');
        game_loop_timer = setInterval(function () {
            _c.tick_interval(game)
        }, game_options.tick_time || 1000);
    };
    _c.stop_game_loop = function (game) {
        if (game_loop_timer) {
            clearInterval(game_loop_timer);
            game.logMessage('Game Loop Stopped');
        }
    };
    _c.tick_interval = function (game) {
//        //The whole game runs on a single setInterval clock.
        _c.autosave_if_time(game);

//        //Resource-related
        populations_produce_products(game);
        eat_food_or_die(game);

//
//        var millMod = 1;
//        if (population.current > 0 || population.zombies > 0) millMod = population.current / (population.current + population.zombies);
//        food.total += population.farmers * (1 + (efficiency.farmers * efficiency.happiness)) * (1 + efficiency.pestBonus) * (1 + (wonder.food / 10)) * (1 + walkTotal / 120) * (1 + mill.total * millMod / 200); //Farmers farm food
//        if (upgrades.skinning == 1 && population.farmers > 0) { //and sometimes get skins
//            x = Math.random();
//            if (x < food.specialchance) {
//                z = 0;
//                if (upgrades.butchering == 1) {
//                    z = population.farmers / 15
//                }
//                ;
//                skins.total += ((food.increment + z) * (1 + (wonder.skins / 10)));
//            }
//        }
//        wood.total += population.woodcutters * (efficiency.woodcutters * efficiency.happiness) * (1 + (wonder.wood / 10)); //Woodcutters cut wood
//        if (upgrades.harvesting == 1 && population.woodcutters > 0) { //and sometimes get herbs
//            x = Math.random();
//            if (x < wood.specialchance) {
//                z = 0;
//                if (upgrades.gardening == 1) {
//                    z = population.woodcutters / 5
//                }
//                ;
//                herbs.total += (wood.increment + z) * (1 + (wonder.herbs / 10));
//            }
//        }
//        stone.total += population.miners * (efficiency.miners * efficiency.happiness) * (1 + (wonder.stone / 10)); //Miners mine stone
//        if (upgrades.prospecting == 1 && population.miners > 0) { //and sometimes get ore
//            x = Math.random();
//            if (x < stone.specialchance) {
//                z = 0;
//                if (upgrades.extraction == 1) {
//                    z = population.miners / 5
//                }
//                ;
//                ore.total += (stone.increment + z) * (1 + (wonder.ore / 10));
//            }
//        }
//        food.total -= population.current; //The living population eats food.
//        if (food.total < 0) { //and will starve if they don't have enough
//            if (upgrades.waste && population.corpses >= (food.total * -1)) { //population eats corpses instead
//                population.corpses = Math.floor(population.corpses + food.total);
//            } else if (upgrades.waste && population.corpses > 0) { //corpses mitigate starvation
//                var starve = Math.ceil((population.current - population.corpses) / 1000);
//                if (starve == 1) gameLog('A worker starved to death');
//                if (starve > 1) gameLog(prettify(starve) + ' workers starved to death');
//                for (var i = 0; i < starve; i++) {
//                    jobCull();
//                }
//                updateJobs();
//                population.corpses = 0;
//            } else { //they just starve
//                var starve = Math.ceil(population.current / 1000);
//                if (starve == 1) gameLog('A worker starved to death');
//                if (starve > 1) gameLog(prettify(starve) + ' workers starved to death');
//                for (var i = 0; i < starve; i++) {
//                    jobCull();
//                }
//                updateJobs();
//                mood(-0.01);
//            }
//            ;
//            food.total = 0;
//            updatePopulation(); //Called because jobCull doesn't. May just change jobCull?
//        }
//        //Resources occasionally go above their caps.
//        if (food.total > 200 + ((barn.total + (barn.total * upgrades.granaries)) * 200)) {
//            food.total = 200 + ((barn.total + (barn.total * upgrades.granaries)) * 200);
//        }
//        ;
//        if (wood.total > 200 + (woodstock.total * 200)) {
//            wood.total = 200 + (woodstock.total * 200);
//        }
//        ;
//        if (stone.total > 200 + (stonestock.total * 200)) {
//            stone.total = 200 + (stonestock.total * 200);
//        }
//        ;
//        //Workers convert secondary resources into tertiary resources
//        if (ore.total >= population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness)) {
//            metal.total += population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness) * (1 + (wonder.metal / 10));
//            ore.total -= population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness);
//        } else if (population.blacksmiths) {
//            metal.total += ore.total * (1 + (wonder.metal / 10));
//            ore.total = 0;
//        }
//        ;
//        if (skins.total >= population.tanners * (efficiency.tanners * efficiency.happiness)) {
//            leather.total += population.tanners * (efficiency.tanners * efficiency.happiness) * (1 + (wonder.leather / 10));
//            skins.total -= population.tanners * (efficiency.tanners * efficiency.happiness);
//        } else if (population.tanners) {
//            leather.total += skins.total * (1 + (wonder.leather / 10));
//            skins.total = 0;
//        }
//        ;
//        //Clerics generate piety
//        piety.total += population.clerics * (efficiency.clerics + (efficiency.clerics * upgrades.writing)) * (1 + (upgrades.secrets * (1 - 100 / (graveyard.total + 100)))) * efficiency.happiness * (1 + (wonder.piety / 10));
//
//        //Timers - routines that do not occur every second
//
//        //Checks when mobs will attack
//        if (population.current + population.zombies > 0) attackCounter += 1;
//        if (population.current + population.zombies > 0 && attackCounter > (60 * 5)) { //Minimum 5 minutes
//            var check = Math.random() * 600;
//            if (check < 1) {
//                attackCounter = 0;
//                //Chooses which kind of mob will attack
//                if (population.current + population.zombies >= 10000) {
//                    var choose = Math.random();
//                    if (choose > 0.5) {
//                        spawnMob('barbarian');
//                    } else if (choose > 0.2) {
//                        spawnMob('bandit');
//                    } else {
//                        spawnMob('wolf');
//                    }
//                } else if (population.current + population.zombies >= 1000) {
//                    if (Math.random() > 0.5) {
//                        spawnMob('bandit');
//                    } else {
//                        spawnMob('wolf');
//                    }
//                } else {
//                    spawnMob('wolf');
//                }
//            }
//        }
//        //Decrements the pestTimer, and resets the bonus once it runs out
//        if (pestTimer > 0) {
//            pestTimer -= 1;
//        } else {
//            efficiency.pestBonus = 0;
//        }
//
//        //Handles the Glory bonus
//        if (gloryTimer > 0) {
//            document.getElementById('gloryTimer').innerHTML = gloryTimer;
//            gloryTimer -= 1;
//        } else {
//            document.getElementById('gloryGroup').style.display = 'none';
//        }
//
//        //traders occasionally show up
//        if (population.current + population.zombies > 0) tradeCounter += 1;
//        if (population.current + population.zombies > 0 && tradeCounter > (60 * (3 - upgrades.currency - upgrades.commerce))) {
//            var check = Math.random() * (60 * (3 - upgrades.currency - upgrades.commerce));
//            if (check < (1 + (0.2 * upgrades.comfort))) {
//                tradeCounter = 0;
//                tradeTimer();
//            }
//        }
//
//        updateResourceTotals(); //This is the point where the page is updated with new resource totals
//
//        //Population-related
//
//        //Handling wolf attacks (this is complicated)
//        if (population.wolves > 0) {
//            if (population.soldiers > 0 || population.cavalry > 0) { //FIGHT!
//                //handles cavalry
//                if (population.cavalry > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
//                    population.wolvesCas -= (population.cavalry * efficiency.cavalry);
//                    population.cavalryCas -= (population.wolves * (0.05 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0));
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.wolvesCas < 0) {
//                        population.wolvesCas = 0;
//                    }
//                    if (population.cavalryCas < 0) {
//                        population.cavalryCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.wolves - population.wolvesCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.cavalry - population.cavalryCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0; //weirdness with floating point numbers. not sure why this is necessary
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.wolves = Math.ceil(population.wolvesCas);
//                    population.cavalry = Math.ceil(population.cavalryCas);
//                }
//                //handles soldiers
//                if (population.soldiers > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
//                    population.wolvesCas -= (population.soldiers * efficiency.soldiers);
//                    population.soldiersCas -= (population.wolves * (0.05 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0));
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.wolvesCas < 0) {
//                        population.wolvesCas = 0;
//                    }
//                    if (population.soldiersCas < 0) {
//                        population.soldiersCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.wolves - population.wolvesCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.soldiers - population.soldiersCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0; //weirdness with floating point numbers. not sure why this is necessary
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.wolves = Math.ceil(population.wolvesCas);
//                    population.soldiers = Math.ceil(population.soldiersCas);
//                }
//                //Updates population figures (including total population)
//                updatePopulation();
//            } else {
//                //Check to see if there are workers that the wolves can eat
//                if (population.healthy > 0) {
//                    //Choose random worker
//                    var target = randomWorker();
//                    if (Math.random() > 0.5) { //Wolves will sometimes not disappear after eating someone
//                        population.wolves -= 1;
//                        population.wolvesCas -= 1;
//                    }
//                    if (population.wolvesCas < 0) population.wolvesCas = 0;
//                    console.log('Wolves ate a ' + target);
//                    gameLog('Wolves ate a ' + target);
//                    if (target == "unemployed") {
//                        population.current -= 1;
//                        population.unemployed -= 1;
//                    } else if (target == "farmer") {
//                        population.current -= 1;
//                        population.farmers -= 1;
//                    } else if (target == "woodcutter") {
//                        population.current -= 1;
//                        population.woodcutters -= 1;
//                    } else if (target == "miner") {
//                        population.current -= 1;
//                        population.miners -= 1;
//                    } else if (target == "tanner") {
//                        population.current -= 1;
//                        population.tanners -= 1;
//                    } else if (target == "blacksmith") {
//                        population.current -= 1;
//                        population.blacksmiths -= 1;
//                    } else if (target == "apothecary") {
//                        population.current -= 1;
//                        population.apothecaries -= 1;
//                    } else if (target == "cleric") {
//                        population.current -= 1;
//                        population.clerics -= 1;
//                    } else if (target == "labourer") {
//                        population.current -= 1;
//                        population.labourers -= 1;
//                    } else if (target == "soldier") {
//                        population.current -= 1;
//                        population.soldiers -= 1;
//                        population.soldiersCas -= 1;
//                        if (population.soldiersCas < 0) {
//                            population.soldiers = 0;
//                            population.soldiersCas = 0;
//                        }
//                    } else if (target == "cavalry") {
//                        population.current -= 1;
//                        population.cavalry -= 1;
//                        population.cavalryCas -= 1;
//                        if (population.cavalryCas < 0) {
//                            population.cavalry = 0;
//                            population.cavalryCas = 0;
//                        }
//                    }
//                    updatePopulation();
//                } else {
//                    //wolves will leave
//                    var leaving = Math.ceil(population.wolves * Math.random());
//                    population.wolves -= leaving;
//                    population.wolvesCas -= leaving;
//                    updateMobs();
//                }
//                ;
//            }
//        }
//        if (population.bandits > 0) {
//            if (population.soldiers > 0 || population.cavalry > 0) {//FIGHT!
//                //Handles cavalry
//                if (population.cavalry > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value
//                    population.banditsCas -= (population.cavalry * efficiency.cavalry);
//                    population.cavalryCas -= (population.bandits * (0.07 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0)) * 1.5; //cavalry take 50% more casualties vs infantry
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.banditsCas < 0) {
//                        population.banditsCas = 0;
//                    }
//                    if (population.cavalryCas < 0) {
//                        population.cavalryCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.bandits - population.banditsCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.cavalry - population.cavalryCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0;
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.bandits = Math.ceil(population.banditsCas);
//                    population.cavalry = Math.ceil(population.cavalryCas);
//                }
//                //Handles infantry
//                if (population.soldiers > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value
//                    population.banditsCas -= (population.soldiers * efficiency.soldiers);
//                    population.soldiersCas -= (population.bandits * (0.07 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0));
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.banditsCas < 0) {
//                        population.banditsCas = 0;
//                    }
//                    if (population.soldiersCas < 0) {
//                        population.soldiersCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.bandits - population.banditsCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.soldiers - population.soldiersCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0;
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.bandits = Math.ceil(population.banditsCas);
//                    population.soldiers = Math.ceil(population.soldiersCas);
//                }
//                //Updates population figures (including total population)
//                updatePopulation();
//            } else {
//                //Bandits will steal resources. Select random resource, steal random amount of it.
//                var num = Math.random();
//                var stolen = Math.floor((Math.random() * 1000)); //Steal up to 1000.
//                if (num < 1 / 8) {
//                    if (food.total > 0) gameLog('Bandits stole food');
//                    if (food.total >= stolen) {
//                        food.total -= stolen;
//                    } else {
//                        food.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 2 / 8) {
//                    if (wood.total > 0) gameLog('Bandits stole wood');
//                    if (wood.total >= stolen) {
//                        wood.total -= stolen;
//                    } else {
//                        wood.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 3 / 8) {
//                    if (stone.total > 0) gameLog('Bandits stole stone');
//                    if (stone.total >= stolen) {
//                        stone.total -= stolen;
//                    } else {
//                        stone.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 4 / 8) {
//                    if (skins.total > 0) gameLog('Bandits stole skins');
//                    if (skins.total >= stolen) {
//                        skins.total -= stolen;
//                    } else {
//                        skins.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 5 / 8) {
//                    if (herbs.total > 0) gameLog('Bandits stole herbs');
//                    if (herbs.total >= stolen) {
//                        herbs.total -= stolen;
//                    } else {
//                        herbs.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 6 / 8) {
//                    if (ore.total > 0) gameLog('Bandits stole ore');
//                    if (ore.total >= stolen) {
//                        ore.total -= stolen;
//                    } else {
//                        ore.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 7 / 8) {
//                    if (leather.total > 0) gameLog('Bandits stole leather');
//                    if (leather.total >= stolen) {
//                        leather.total -= stolen;
//                    } else {
//                        leather.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else {
//                    if (metal.total > 0) gameLog('Bandits stole metal');
//                    if (metal.total >= stolen) {
//                        metal.total -= stolen;
//                    } else {
//                        metal.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                }
//                ;
//                population.bandits -= 1; //Bandits leave after stealing something.
//                population.banditsCas -= 1;
//                if (population.banditsCas < 0) population.banditsCas = 0;
//                updateResourceTotals();
//                updatePopulation();
//            }
//        }
//        if (population.barbarians) {
//            if (population.soldiers > 0 || population.cavalry > 0) {//FIGHT!
//                //Handles cavalry
//                if (population.cavalry > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value
//                    population.barbariansCas -= (population.cavalry * efficiency.cavalry);
//                    population.cavalryCas -= (population.barbarians * (0.09 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0)) * 1.5; //Cavalry take 50% more casualties vs. infantry
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.barbariansCas < 0) {
//                        population.barbariansCas = 0;
//                    }
//                    if (population.cavalryCas < 0) {
//                        population.cavalryCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.barbarians - population.barbariansCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.cavalry - population.cavalryCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0;
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.barbarians = Math.ceil(population.barbariansCas);
//                    population.cavalry = Math.ceil(population.cavalryCas);
//                }
//                //Handles infantry
//                if (population.soldiers > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value
//                    population.barbariansCas -= (population.soldiers * efficiency.soldiers);
//                    population.soldiersCas -= (population.barbarians * (0.09 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0));
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.barbariansCas < 0) {
//                        population.barbariansCas = 0;
//                    }
//                    if (population.soldiersCas < 0) {
//                        population.soldiersCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.barbarians - population.barbariansCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.soldiers - population.soldiersCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0;
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.barbarians = Math.ceil(population.barbariansCas);
//                    population.soldiers = Math.ceil(population.soldiersCas);
//                }
//                //Updates population figures (including total population)
//                updatePopulation();
//            } else {
//                var havoc = Math.random(); //barbarians do different things
//                if (havoc < 0.3) {
//                    //Kill people, see wolves
//                    if (population.healthy > 0) {
//                        //No honor in killing the sick who will starve anyway
//                        var target = randomWorker(); //Choose random worker
//                        population.barbarians -= 1; //Barbarians always disappear after killing
//                        population.barbariansCas -= 1;
//                        if (population.barbariansCas < 0) population.barbariansCas = 0;
//                        console.log('Barbarians killed a ' + target);
//                        gameLog('Barbarians killed a ' + target);
//                        if (target == "unemployed") {
//                            population.current -= 1;
//                            population.unemployed -= 1;
//                        } else if (target == "farmer") {
//                            population.current -= 1;
//                            population.farmers -= 1;
//                        } else if (target == "woodcutter") {
//                            population.current -= 1;
//                            population.woodcutters -= 1;
//                        } else if (target == "miner") {
//                            population.current -= 1;
//                            population.miners -= 1;
//                        } else if (target == "tanner") {
//                            population.current -= 1;
//                            population.tanners -= 1;
//                        } else if (target == "blacksmith") {
//                            population.current -= 1;
//                            population.blacksmiths -= 1;
//                        } else if (target == "apothecary") {
//                            population.current -= 1;
//                            population.apothecaries -= 1;
//                        } else if (target == "cleric") {
//                            population.current -= 1;
//                            population.clerics -= 1;
//                        } else if (target == "labourer") {
//                            population.current -= 1;
//                            population.labourers -= 1;
//                        } else if (target == "soldier") {
//                            population.current -= 1;
//                            population.soldiers -= 1;
//                            population.soldiersCas -= 1;
//                            if (population.soldiersCas < 0) {
//                                population.soldiers = 0;
//                                population.soldiersCas = 0;
//                            }
//                        } else if (target == "cavalry") {
//                            population.current -= 1;
//                            population.cavalry -= 1;
//                            population.cavalryCas -= 1;
//                            if (population.cavalryCas < 0) {
//                                population.cavalry = 0;
//                                population.cavalryCas = 0;
//                            }
//                        }
//                        population.corpses += 1; //Unlike wolves, Barbarians leave corpses behind
//                        updatePopulation();
//                    } else {
//                        var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 3);
//                        population.barbarians -= leaving;
//                        population.barbariansCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (havoc < 0.6) {
//                    //Steal shit, see bandits
//                    var num = Math.random();
//                    var stolen = Math.floor((Math.random() * 1000)); //Steal up to 1000.
//                    if (num < 1 / 8) {
//                        if (food.total > 0) gameLog('Barbarians stole food');
//                        if (food.total >= stolen) {
//                            food.total -= stolen;
//                        } else {
//                            food.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 2 / 8) {
//                        if (wood.total > 0) gameLog('Barbarians stole wood');
//                        if (wood.total >= stolen) {
//                            wood.total -= stolen;
//                        } else {
//                            wood.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 3 / 8) {
//                        if (stone.total > 0) gameLog('Barbarians stole stone');
//                        if (stone.total >= stolen) {
//                            stone.total -= stolen;
//                        } else {
//                            stone.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 4 / 8) {
//                        if (skins.total > 0) gameLog('Barbarians stole skins');
//                        if (skins.total >= stolen) {
//                            skins.total -= stolen;
//                        } else {
//                            skins.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 5 / 8) {
//                        if (herbs.total > 0) gameLog('Barbarians stole herbs');
//                        if (herbs.total >= stolen) {
//                            herbs.total -= stolen;
//                        } else {
//                            herbs.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 6 / 8) {
//                        if (ore.total > 0) gameLog('Barbarians stole ore');
//                        if (ore.total >= stolen) {
//                            ore.total -= stolen;
//                        } else {
//                            ore.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 7 / 8) {
//                        if (leather.total > 0) gameLog('Barbarians stole leather');
//                        if (leather.total >= stolen) {
//                            leather.total -= stolen;
//                        } else {
//                            leather.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else {
//                        if (metal.total > 0) gameLog('Barbarians stole metal');
//                        if (metal.total >= stolen) {
//                            metal.total -= stolen;
//                        } else {
//                            metal.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    }
//                    ;
//                    population.barbarians -= 1; //Barbarians leave after stealing something.
//                    population.barbariansCas -= 1;
//                    if (population.barbariansCas < 0) population.barbariansCas = 0;
//                    updateResourceTotals();
//                    updatePopulation();
//                } else {
//                    //Destroy buildings
//                    var num = Math.random(); //Barbarians attempt to destroy random buildings (and leave if they do)
//                    if (num < 1 / 16) {
//                        if (tent.total > 0) {
//                            tent.total -= 1;
//                            gameLog('Barbarians destroyed a tent');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 2 / 16) {
//                        if (whut.total > 0) {
//                            whut.total -= 1;
//                            gameLog('Barbarians destroyed a wooden hut');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 3 / 16) {
//                        if (cottage.total > 0) {
//                            cottage.total -= 1;
//                            gameLog('Barbarians destroyed a cottage');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 4 / 16) {
//                        if (house.total > 0) {
//                            house.total -= 1;
//                            gameLog('Barbarians destroyed a house');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 5 / 16) {
//                        if (mansion.total > 0) {
//                            mansion.total -= 1;
//                            gameLog('Barbarians destroyed a mansion');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 6 / 16) {
//                        if (barn.total > 0) {
//                            barn.total -= 1;
//                            gameLog('Barbarians destroyed a barn');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 7 / 16) {
//                        if (woodstock.total > 0) {
//                            woodstock.total -= 1;
//                            gameLog('Barbarians destroyed a wood stockpile');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 8 / 16) {
//                        if (stonestock.total > 0) {
//                            stonestock.total -= 1;
//                            gameLog('Barbarians destroyed a stone stockpile');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 9 / 16) {
//                        if (tannery.total > 0) {
//                            tannery.total -= 1;
//                            gameLog('Barbarians destroyed a tannery');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 10 / 16) {
//                        if (smithy.total > 0) {
//                            smithy.total -= 1;
//                            gameLog('Barbarians destroyed a smithy');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 11 / 16) {
//                        if (apothecary.total > 0) {
//                            apothecary.total -= 1;
//                            gameLog('Barbarians destroyed an apothecary');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 12 / 16) {
//                        if (temple.total > 0) {
//                            temple.total -= 1;
//                            gameLog('Barbarians destroyed a temple');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 13 / 16) {
//                        if (fortification.total > 0) {
//                            fortification.total -= 1;
//                            gameLog('Barbarians damaged fortifications');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 14 / 16) {
//                        if (stable.total > 0) {
//                            stable.total -= 1;
//                            gameLog('Barbarians destroyed a stable');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 15 / 16) {
//                        if (mill.total > 0) {
//                            mill.total -= 1;
//                            gameLog('Barbarians destroyed a mill');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else {
//                        if (barracks.total > 0) {
//                            barracks.total -= 1;
//                            gameLog('Barbarians destroyed a barracks');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    }
//                    ;
//                    population.barbarians -= 1;
//                    population.barbariansCas -= 1;
//                    if (population.barbarians < 0) population.barbarians = 0;
//                    if (population.barbariansCas < 0) population.barbariansCas = 0;
//                    updateBuildingTotals();
//                    updatePopulation();
//                }
//            }
//        }
//        if (population.shades > 0) {
//            if (population.wolves >= population.shades / 4) {
//                population.wolves -= Math.floor(population.shades / 4);
//                population.wolvesCas -= population.shades / 4;
//                population.shades -= Math.floor(population.shades / 4);
//            } else if (population.wolves > 0) {
//                population.shades -= Math.floor(population.wolves);
//                population.wolves = 0;
//                population.wolvesCas = 0;
//            }
//            if (population.bandits >= population.shades / 4) {
//                population.bandits -= Math.floor(population.shades / 4);
//                population.banditsCas -= population.shades / 4;
//                population.shades -= Math.floor(population.shades / 4);
//            } else if (population.bandits > 0) {
//                population.shades -= Math.floor(population.bandits);
//                population.bandits = 0;
//                population.banditsCas = 0;
//            }
//            if (population.barbarians >= population.shades / 4) {
//                population.barbarians -= Math.floor(population.shades / 4);
//                population.barbariansCas -= population.shades / 4;
//                population.shades -= Math.floor(population.shades / 4);
//            } else if (population.bandits > 0) {
//                population.shades -= Math.floor(population.barbarians);
//                population.barbarians = 0;
//                population.barbariansCas = 0;
//            }
//            population.shades = Math.floor(population.shades * 0.95);
//            if (population.shades < 0) population.shades = 0;
//            updatePopulation();
//        }
//        if (population.esiege > 0) {
//            //First check there are enemies there defending them
//            if (population.bandits > 0 || population.barbarians > 0) {
//                if (fortification.total > 0) { //needs to be something to fire at
//                    var firing = Math.ceil(Math.min(population.esiege / 2, 100)); //At most half or 100 can fire at a time
//                    for (var i = 0; i < firing; i++) {
//                        if (fortification.total > 0) { //still needs to be something to fire at
//                            var hit = Math.random();
//                            if (hit < 0.1) { //each siege engine has 10% to hit
//                                fortification.total -= 1;
//                                gameLog('Enemy siege engine damaged our fortifications');
//                                updateRequirements(fortification);
//                            } else if (hit > 0.95) { //each siege engine has 5% to misfire and destroy itself
//                                population.esiege -= 1;
//                            }
//                        }
//                    }
//                    updateBuildingTotals();
//                }
//                ;
//            } else if (population.soldiers > 0 || population.cavalry > 0) {
//                //the siege engines are undefended
//                if (upgrades.mathematics) { //Can we use them?
//                    gameLog('Captured ' + prettify(population.esiege) + ' enemy siege engines.');
//                    population.siege += population.esiege; //capture them
//                    updateParty(); //show them in conquest pane
//                } else {
//                    //we can't use them, therefore simply destroy them
//                    gameLog('Destroyed ' + prettify(population.esiege) + ' enemy siege engines.');
//                }
//                population.esiege = 0;
//            }
//            updateMobs();
//        }
//
//        if (raiding.raiding) { //handles the raiding subroutine
//            if (population.soldiersParty > 0 || population.cavalryParty || raiding.victory) { //technically you can win, then remove all your soldiers
//                if (population.esoldiers > 0) {
//                    /* FIGHT! */
//                    //Handles cavalry
//                    if (population.cavalryParty > 0) {
//                        //Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
//                        population.esoldiersCas -= (population.cavalryParty * efficiency.cavalry) * Math.max(1 - population.eforts / 100, 0);
//                        population.cavalryPartyCas -= (population.esoldiers * 0.05 * 1.5); //Cavalry takes 50% more casualties vs. infantry
//                        //If this reduces effective strengths below 0, reset it to 0.
//                        if (population.esoldiersCas < 0) {
//                            population.esoldiersCas = 0;
//                        }
//                        if (population.cavalryPartyCas < 0) {
//                            population.cavalryPartyCas = 0;
//                        }
//                        //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                        var mobCasualties = population.esoldiers - population.esoldiersCas,
//                            mobCasFloor = Math.floor(mobCasualties),
//                            casualties = population.cavalryParty - population.cavalryPartyCas,
//                            casFloor = Math.floor(casualties);
//                        if (!(mobCasFloor > 0)) mobCasFloor = 0; //weirdness with floating point numbers. not sure why this is necessary
//                        if (!(casFloor > 0)) casFloor = 0;
//                        //Increments enemies slain, corpses, and piety
//                        population.enemiesSlain += mobCasFloor;
//                        if (upgrades.throne) throneCount += mobCasFloor;
//                        population.corpses += (casFloor + mobCasFloor);
//                        updatePopulation();
//                        if (upgrades.book) {
//                            piety.total += (casFloor + mobCasFloor) * 10;
//                            updateResourceTotals();
//                        }
//                        ;
//                        //Resets the actual numbers based on effective strength
//                        population.esoldiers = Math.ceil(population.esoldiersCas);
//                        population.cavalryParty = Math.ceil(population.cavalryPartyCas);
//                    }
//                    //Handles infantry
//                    if (population.soldiersParty > 0) {
//                        //Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
//                        population.esoldiersCas -= (population.soldiersParty * efficiency.soldiers) * Math.max(1 - population.eforts / 100, 0);
//                        population.soldiersPartyCas -= (population.esoldiers * 0.05);
//                        //If this reduces effective strengths below 0, reset it to 0.
//                        if (population.esoldiersCas < 0) {
//                            population.esoldiersCas = 0;
//                        }
//                        if (population.soldiersPartyCas < 0) {
//                            population.soldiersPartyCas = 0;
//                        }
//                        //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                        var mobCasualties = population.esoldiers - population.esoldiersCas,
//                            mobCasFloor = Math.floor(mobCasualties),
//                            casualties = population.soldiersParty - population.soldiersPartyCas,
//                            casFloor = Math.floor(casualties);
//                        if (!(mobCasFloor > 0)) mobCasFloor = 0; //weirdness with floating point numbers. not sure why this is necessary
//                        if (!(casFloor > 0)) casFloor = 0;
//                        //Increments enemies slain, corpses, and piety
//                        population.enemiesSlain += mobCasFloor;
//                        if (upgrades.throne) throneCount += mobCasFloor;
//                        population.corpses += (casFloor + mobCasFloor);
//                        updatePopulation();
//                        if (upgrades.book) {
//                            piety.total += (casFloor + mobCasFloor) * 10;
//                            updateResourceTotals();
//                        }
//                        ;
//                        //Resets the actual numbers based on effective strength
//                        population.esoldiers = Math.ceil(population.esoldiersCas);
//                        population.soldiersParty = Math.ceil(population.soldiersPartyCas);
//                    }
//                    //Handles siege engines
//                    if (population.siege > 0 && population.eforts > 0) { //need to be siege weapons and something to fire at
//                        var firing = Math.ceil(Math.min(population.siege / 2, population.eforts * 2));
//                        if (firing > population.siege) firing = population.siege; //should never happen
//                        for (var i = 0; i < firing; i++) {
//                            if (population.eforts > 0) { //still needs to be something to fire at
//                                var hit = Math.random();
//                                if (hit < 0.1) { //each siege engine has 10% to hit
//                                    population.eforts -= 1;
//                                } else if (hit > 0.95) { //each siege engine has 5% to misfire and destroy itself
//                                    population.siege -= 1;
//                                }
//                            }
//                        }
//                    }
//
//                    /* END FIGHT! */
//
//                    //checks victory conditions (needed here because of the order of tests)
//                    if (population.esoldiers <= 0) {
//                        population.esoldiers = 0; //ensure esoldiers is 0
//                        population.esoldiersCas = 0; //ensure esoldiers is 0
//                        population.eforts = 0; //ensure eforts is 0
//                        gameLog('Raid victorious!'); //notify player
//                        raiding.victory = true; //set victory for future handling
//                        //conquest achievements
//                        if (!achievements.raider) {
//                            achievements.raider = 1;
//                            updateAchievements();
//                        }
//                        if (raiding.last == 'empire' && !achievements.domination) {
//                            achievements.domination = 1;
//                            updateAchievements();
//                        }
//                        //lamentation
//                        if (upgrades.lament) {
//                            attackCounter -= Math.ceil(raiding.iterations / 100);
//                        }
//                        //ups the targetMax and improves mood (reverse order to prevent it being immediate set to Empire)
//                        if (raiding.last == 'empire') {
//                            mood(0.12);
//                        }
//                        if (raiding.last == 'largeNation') {
//                            if (targetMax == 'largeNation') targetMax = 'empire';
//                            mood(0.11);
//                        }
//                        if (raiding.last == 'nation') {
//                            if (targetMax == 'nation') targetMax = 'largeNation';
//                            mood(0.10);
//                        }
//                        if (raiding.last == 'smallNation') {
//                            if (targetMax == 'smallNation') targetMax = 'nation';
//                            mood(0.09);
//                        }
//                        if (raiding.last == 'metropolis') {
//                            if (targetMax == 'metropolis') targetMax = 'smallNation';
//                            mood(0.08);
//                        }
//                        if (raiding.last == 'largeCity') {
//                            if (targetMax == 'largeCity') targetMax = 'metropolis';
//                            mood(0.07);
//                        }
//                        if (raiding.last == 'smallCity') {
//                            if (targetMax == 'smallCity') targetMax = 'largeCity';
//                            mood(0.06);
//                        }
//                        if (raiding.last == 'largeTown') {
//                            if (targetMax == 'largeTown') targetMax = 'smallCity';
//                            mood(0.05);
//                        }
//                        if (raiding.last == 'smallTown') {
//                            if (targetMax == 'smallTown') targetMax = 'largeTown';
//                            mood(0.04);
//                        }
//                        if (raiding.last == 'village') {
//                            if (targetMax == 'village') targetMax = 'smallTown';
//                            mood(0.03);
//                        }
//                        if (raiding.last == 'hamlet') {
//                            if (targetMax == 'hamlet') targetMax = 'village';
//                            mood(0.02);
//                        }
//                        if (raiding.last == 'thorp') {
//                            if (targetMax == 'thorp') targetMax = 'hamlet';
//                            mood(0.01);
//                        }
//                        updateTargets(); //update the new target
//                    }
//                    ;
//                    updateParty(); //display new totals for army soldiers and enemy soldiers
//                } else if (raiding.victory) {
//                    //handles the victory outcome
//                    document.getElementById('victoryGroup').style.display = 'block';
//                } else {
//                    //victory outcome has been handled, end raid
//                    raiding.raiding = false;
//                    raiding.iterations = 0;
//                }
//            } else {
//                gameLog('Raid defeated');
//                population.esoldiers = 0;
//                population.esoldiersCas = 0;
//                population.eforts = 0;
//                population.siege = 0;
//                updateParty();
//                raiding.raiding = false;
//                raiding.iterations = 0;
//            }
//        } else {
//            document.getElementById('raidGroup').style.display = 'block'
//        }
//
//        if (population.corpses > 0 && population.graves > 0) {
//            //Clerics will bury corpses if there are graves to fill and corpses lying around
//            for (var i = 0; i < population.clerics; i++) {
//                if (population.corpses > 0 && population.graves > 0) {
//                    population.corpses -= 1;
//                    population.graves -= 1;
//                }
//            }
//            updatePopulation();
//        }
//        if (population.totalSick > 0 && population.apothecaries + (population.cats * upgrades.companion) > 0) {
//            //Apothecaries curing sick people
//            for (var i = 0; i < population.apothecaries + (population.cats * upgrades.companion); i++) {
//                if (herbs.total > 0) {
//                    //Increment efficiency counter
//                    cureCounter += (efficiency.apothecaries * efficiency.happiness);
//                    while (cureCounter >= 1 && herbs.total >= 1) { //OH GOD WHY AM I USING THIS
//                        //Decrement counter
//                        //This is doubly important because of the While loop
//                        cureCounter -= 1;
//                        //Select a sick worker to cure, with certain priorities
//                        if (population.apothecariesIll > 0) { //Don't all get sick
//                            population.apothecariesIll -= 1;
//                            population.apothecaries += 1;
//                            herbs.total -= 1;
//                        } else if (population.farmersIll > 0) { //Don't starve
//                            population.farmersIll -= 1;
//                            population.farmers += 1;
//                            herbs.total -= 1;
//                        } else if (population.soldiersIll > 0) { //Don't get attacked
//                            population.soldiersIll -= 1;
//                            population.soldiers += 1;
//                            population.soldiersCas += 1;
//                            herbs.total -= 1;
//                        } else if (population.cavalryIll > 0) { //Don't get attacked
//                            population.cavalryIll -= 1;
//                            population.cavalry += 1;
//                            population.cavalryCas += 1;
//                            herbs.total -= 1;
//                        } else if (population.clericsIll > 0) { //Bury corpses to make this problem go away
//                            population.clericsIll -= 1;
//                            population.clerics += 1;
//                            herbs.total -= 1;
//                        } else if (population.labourersIll > 0) {
//                            population.labourersIll -= 1;
//                            population.labourers += 1;
//                            herbs.total -= 1;
//                        } else if (population.woodcuttersIll > 0) {
//                            population.woodcuttersIll -= 1;
//                            population.woodcutters += 1;
//                            herbs.total -= 1;
//                        } else if (population.minersIll > 0) {
//                            population.minersIll -= 1;
//                            population.miners += 1;
//                            herbs.total -= 1;
//                        } else if (population.tannersIll > 0) {
//                            population.tannersIll -= 1;
//                            population.tanners += 1;
//                            herbs.total -= 1;
//                        } else if (population.blacksmithsIll > 0) {
//                            population.blacksmithsIll -= 1;
//                            population.blacksmiths += 1;
//                            herbs.total -= 1;
//                        } else if (population.unemployedIll > 0) {
//                            population.unemployedIll -= 1;
//                            population.unemployed += 1;
//                            herbs.total -= 1;
//                        }
//                    }
//                }
//            }
//            updatePopulation();
//        }
//        if (population.corpses > 0) {
//            //Corpses lying around will occasionally make people sick.
//            var sickChance = Math.random() * (50 + (upgrades.feast * 50));
//            if (sickChance < 1) {
//                var sickNum = Math.floor(population.current / 100 * Math.random());
//                if (sickNum > 0) plague(sickNum);
//            }
//        }
//
//        if (throneCount >= 100) {
//            //If sufficient enemies have been slain, build new temples for free
//            temple.total += Math.floor(throneCount / 100);
//            throneCount = 0;
//            updateBuildingTotals();
//        }
//
//        if (graceCost > 1000) {
//            graceCost -= 1;
//            graceCost = Math.floor(graceCost);
//            document.getElementById('graceCost').innerHTML = prettify(graceCost);
//        }
//
//        if (walkTotal > 0) {
//            if (population.healthy > 0) {
//                for (var i = 0; i < walkTotal; i++) {
//                    var target = randomWorker();
//                    if (target == "unemployed") {
//                        population.current -= 1;
//                        population.unemployed -= 1;
//                    } else if (target == "farmer") {
//                        population.current -= 1;
//                        population.farmers -= 1;
//                    } else if (target == "woodcutter") {
//                        population.current -= 1;
//                        population.woodcutters -= 1;
//                    } else if (target == "miner") {
//                        population.current -= 1;
//                        population.miners -= 1;
//                    } else if (target == "tanner") {
//                        population.current -= 1;
//                        population.tanners -= 1;
//                    } else if (target == "blacksmith") {
//                        population.current -= 1;
//                        population.blacksmiths -= 1;
//                    } else if (target == "apothecary") {
//                        population.current -= 1;
//                        population.apothecaries -= 1;
//                    } else if (target == "cleric") {
//                        population.current -= 1;
//                        population.clerics -= 1;
//                    } else if (target == "labourer") {
//                        population.current -= 1;
//                        population.labourers -= 1;
//                    } else if (target == "soldier") {
//                        population.current -= 1;
//                        population.soldiers -= 1;
//                        population.soldiersCas -= 1;
//                        if (population.soldiersCas < 0) {
//                            population.soldiers = 0;
//                            population.soldiersCas = 0;
//                        }
//                    } else if (target == "cavalry") {
//                        population.current -= 1;
//                        population.cavalry -= 1;
//                        population.cavalryCas -= 1;
//                        if (population.cavalryCas < 0) {
//                            population.cavalry = 0;
//                            population.cavalryCas = 0;
//                        }
//                    }
//                }
//                updatePopulation();
//            } else {
//                walkTotal = 0;
//                document.getElementById('ceaseWalk').disabled = true;
//            }
//        }
//
//        if (wonder.building) {
//            if (wonder.progress >= 100) {
//                //Wonder is finished! First, send workers home
//                population.unemployed += population.labourers;
//                population.unemployedIll += population.labourersIll;
//                population.labourers = 0;
//                population.labourersIll = 0;
//                updatePopulation();
//                //hide limited notice
//                document.getElementById('lowResources').style.display = 'none';
//                //then set wonder.completed so things will be updated appropriately
//                wonder.completed = true;
//                //check to see if neverclick was achieved
//                if (!achievements.neverclick && resourceClicks <= 22) {
//                    achievements.neverclick = 1;
//                    gameLog('Achievement Unlocked: Neverclick!');
//                    updateAchievements();
//                }
//            } else {
//                //we're still building
//                //first, check for labourers
//                if (population.labourers > 0) {
//                    //then check we have enough resources
//                    if (food.total >= population.labourers && stone.total >= population.labourers && wood.total >= population.labourers && skins.total >= population.labourers && herbs.total >= population.labourers && ore.total >= population.labourers && metal.total >= population.labourers && leather.total >= population.labourers && piety.total >= population.labourers) {
//                        //remove resources
//                        food.total -= population.labourers;
//                        wood.total -= population.labourers;
//                        stone.total -= population.labourers;
//                        skins.total -= population.labourers;
//                        herbs.total -= population.labourers;
//                        ore.total -= population.labourers;
//                        leather.total -= population.labourers;
//                        metal.total -= population.labourers;
//                        piety.total -= population.labourers;
//                        //increase progress
//                        wonder.progress += population.labourers / (1000000 * Math.pow(1.5, wonder.total));
//                        //hide limited notice
//                        document.getElementById('lowResources').style.display = 'none';
//                    } else if (food.total >= 1 && stone.total >= 1 && wood.total >= 1 && skins.total >= 1 && herbs.total >= 1 && ore.total >= 1 && metal.total >= 1 && leather.total >= 1 && piety.total >= 1) {
//                        //or at least some resources
//                        var number = Math.min(food.total, wood.total, stone.total, skins.total, herbs.total, ore.total, leather.total, metal.total, piety.total);
//                        //remove resources
//                        food.total -= number;
//                        wood.total -= number;
//                        stone.total -= number;
//                        skins.total -= number;
//                        herbs.total -= number;
//                        ore.total -= number;
//                        leather.total -= number;
//                        metal.total -= number;
//                        piety.total -= number;
//                        //increase progress
//                        wonder.progress += number / (1000000 * Math.pow(1.5, wonder.total));
//                        //show limited notice
//                        document.getElementById('lowResources').style.display = 'block';
//                        updateWonderLimited();
//                    } else {
//                        //we don't have enough resources to do any work
//                        //show limited notice
//                        document.getElementById('lowResources').style.display = 'block';
//                        updateWonderLimited();
//                    }
//                } else {
//                    //we're not working on the wonder, so hide limited notice
//                    document.getElementById('lowResources').style.display = 'none';
//                }
//            }
//            updateWonder();
//        }
//
//        //Trader stuff
//
//        if (trader.timer > 0) {
//            if (trader.timer > 1) {
//                trader.timer -= 1;
//            } else {
//                document.getElementById('tradeContainer').style.display = 'none';
//                trader.timer -= 1;
//            }
//        }
//
//        updateUpgrades();
//        updateBuildingButtons();
//        updateJobs();
//        updatePartyButtons();
//        updateSpawnButtons();
//        updateReset();

        _c.redraw_data(game);

    }

})(Civvies);
(function (Civvies) {

    var _c = new Civvies('get_private_functions');

    _c.autosave_if_time = function(game) {
        if (game.game_options.autosave) {
            game.data.autosave_counter = game.data.autosave_counter || 0;
            game.data.autosave_counter += 1;
            if (game.data.autosave_counter >= game.game_options.autosave_every) {
                _c.save(game, 'auto');
                game.data.autosave_counter = 0;
            }
        }
    };
    _c.load = function(game, loadType) {

    };
    _c.save = function(game, saveType) {
        console.log("Autosave");

    };
    _c.toggleAutosave = function(game, saveType) {

    };
    _c.deleteSave = function(game, saveType) {

    };
    _c.renameCiv = function(saveType) {

    };
    _c.renameRuler = function(saveType) {

    };
    _c.renameDeity = function(saveType) {

    };
    _c.reset = function(saveType) {

    };


})(Civvies);
(function (CivviesClass) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        autosave_every: 60,
        autosave: true,

        //TODO: These should move to variables
        storage_initial: 100,

        resources: [
            //Note: Grouping 1 is clickable by user to gather resources manually
            {name: 'food', grouping:1, image:'../images/civclicker/food.png', chances:[{chance:"foodSpecialChance", resource:'herbs'}], amount_from_click:1},
            {name: 'wood', grouping:1, image:'../images/civclicker/wood.png', chances:[{chance:"woodSpecialChance", resource:'skins'}], amount_from_click:1},
            {name: 'stone', grouping:1, image:'../images/civclicker/stone.png', chances:[{chance:"stoneSpecialChance", resource:'ore'}], amount_from_click:1},

            {name: 'herbs', grouping:2, image:'../images/civclicker/herbs.png'},
            {name: 'skins', grouping:2, image:'../images/civclicker/skins.png'},
            {name: 'ore', grouping:2, image:'../images/civclicker/ore.png'},

            {name: 'leather', grouping:2, image:'../images/civclicker/leather.png'},
            {name: 'metal', grouping:2, image:'../images/civclicker/metal.png'},
            {name: 'gold', grouping:2, image:'../images/civclicker/gold.png'},

            {name: 'piety', grouping:2, image:'../images/civclicker/piety.png'},
            {name: 'corpses', grouping:2, image:'../images/civclicker/piety.png'},
            {name: 'wonder', grouping:3, image:'../images/civclicker/piety.png'}
        ],
        buildings: [ //TODO: Add upgrades required
            {name: 'tent', type:'home', costs:{skins: 2, wood: 2}, population_supports: 2, initial:1},
            {name: 'hut', type:'home', costs:{skins: 1, wood: 20}, population_supports: 4},
            {name: 'cottage', type:'home', costs:{stone: 30, wood: 10}, population_supports: 6},
            {name: 'house', type:'home', costs:{stone: 70, wood: 30}, population_supports: 10},
            {name: 'mansion', type:'home', costs:{stone: 200, wood: 200, leather:20}, population_supports: 20},

            {name: 'barn', type:'storage', costs:{wood: 100}, supports:{food:100}, notes:"Increase the food you can store"},
            {name: 'woodstock', type:'storage', costs:{wood: 100}, supports:{wood:100}, notes:"Increase the wood you can store"},
            {name: 'stonestock', type:'storage', costs:{wood: 100}, supports:{stone:100}, notes:"Increase the stone you can store"},

            {name: 'tannery', type:'business', costs:{wood: 30, stone:70, skins:2}, supports:{tanners:2}},
            {name: 'smithy', type:'business', costs:{wood: 30, stone:70, ore:2}, supports:{blacksmiths:2}},
            {name: 'apothecary', type:'business', costs:{wood: 30, stone:70, herbs:2}, supports:{apothecaries:2}},
            {name: 'temple', type:'business', costs:{wood: 30, stone:120, herbs:10}, supports:{clerics:1}},
            {name: 'barracks', type:'business', costs:{food: 20, wood: 60, stone:120}, supports:{soldiers:5}},
            {name: 'stable', type:'business', costs:{food: 60, wood: 60, stone:120, leather:10}, supports:{cavalry:5}},

            {name: 'mill', type:'upgrade', costs:{wood: 100, stone: 100}, options:{food_efficiency:.1}, notes:"Improves Farming Efficiency"},
            {name: 'graveyard', type:'upgrade', costs:{wood: 50, stone:200, herbs:50}, options:{grave_spot: 100}, notes:"Increases Grave Plots"}, //TODO: Should graves be a resource?
            {name: 'fortification', type:'upgrade', costs:{stone:100}, options:{defense_improvement:5}, notes:"Improves Defenses"},

//TODO: How to handle altars?
            {name: 'battleAltar', title: "Battle Altar", type:'altar', costs:{devotion: 1, stone:200, metal:50, piety:200}},
            {name: 'fieldsAltar', title: "Fields Altar", type:'altar', costs:{devotion: 1, food: 500, wood: 500, stone:200, piety:200}},
            {name: 'underworldAltar', title: "Underworld Altar", type:'altar', costs:{devotion: 1, stone:200, piety:200, corpses:1}},
            {name: 'catAltar', title: "Cat Altar", type:'altar', costs:{devotion: 1, herbs: 100, stone:200, piety:200}}
//TODO: How to handle Wonder? Laborers currently produce it
        ],
        populations: [
            {name: 'unemployed', title:'Unemployed Worker', type:'basic', notes:"Unassigned Workers that eat up food", unassignable:true, cull_order:2},
            {name: 'sick', type:'basic', notes:"Sick workers that need medical help", unassignable:true, cull_order:1},
            {name: 'farmers', type:'basic', produces:{food:"farmers"}, doesnt_require_office:true, cull_order:10},
            {name: 'woodcutters', type:'basic', produces:{wood:1}, doesnt_require_office:true, cull_order:9},
            {name: 'miners', type:'basic', produces:{stone:1}, doesnt_require_office:true},

            {name: 'tanners', type:'medieval', consumes:{skins:1}, produces:{leather:1}},
            {name: 'blacksmiths', type:'medieval', consumes:{ore:1}, produces:{metal:1}},
            {name: 'apothecaries', type:'medieval', consumes:{herbs:1}, supports:{healing:1}},
            {name: 'clerics', type:'medieval', consumes:{food:2, herbs:1}, supports:{healing:.1, burying: 5}, produces:{piety:1}, cull_order:6},
            {name: 'labourers', type:'medieval', consumes:{herbs:10, leather:10, metal:10, piety:10}, produces:{wonder:1}, cull_order:2},

            {name: 'cats', type:'mystical', cull_order:11},  //TODO: What makes cats?
            {name: 'zombies', type:'mystical', costs:{corpses:1}, doesnt_consume_food:true},

            {name: 'soldiers', type:'warfare', consumes:{food:2}, supports:{battle:1.5}, cull_order:8},
            {name: 'cavalry', type:'warfare', consumes:{food:1, herbs:1}, supports:{battle:2}, cull_order:7},
            {name: 'siege', type:'warfare', costs:{metal:10, wood:100}, supports:{battle:5}, doesnt_require_office:true, doesnt_consume_food:true}
        ],
        variables: [
            {name: "happiness", value:1},
            {name: "farmers", value:1.2},
            {name: "pestBonus", value:0},
            {name: "woodcutters", value:0.5},
            {name: "miners", value:0.2},
            {name: "tanners", value:0.5},
            {name: "blacksmiths", value:0.5},
            {name: "apothecaries", value:0.1},
            {name: "clerics", value:0.05},
            {name: "soldiers", value:0.05},
            {name: "cavalry", value:0.08},
            {name: "foodSpecialChance", value:0.02},
            {name: "woodSpecialChance", value:0.02},
            {name: "stoneSpecialChance", value:0.01},
            {name: "foodCostInitial", value:20}
        ],
        upgrades: [
            //TODO: Have a grouping mechanism
            {name:"skinning", type:'stone age', costs:{skins:10}, unlocks:["butchering"]},
           	{name:"harvesting", type:'stone age', costs:{herbs:10}, unlocks:["gardening"]},
           	{name:"prospecting", type:'stone age', costs:{ore:10}, unlocks:["extraction"]},

            {name:"domestication", type:'basic farming', costs:{leather:20}, variable_increase:{farmers:0.1}},
           	{name:"ploughshares", type:'basic farming', costs:{metal:20}, variable_increase:{farmers:0.1}},
           	{name:"irrigation", type:'basic farming', costs:{wood:500, stone:200}, variable_increase:{farmers:0.1}},

           	{name:"butchering", type:'special farming', costs:{leather:40}},
           	{name:"gardening", type:'special farming', costs:{herbs:40}},
           	{name:"extraction", type:'special farming', title: "Metal Extraction", costs:{metal:40}},

            {name:"flensing", type:'efficiency farming', title: "Flaying", costs:{metal:1000}, variable_increase:{foodSpecialChance:0.001}},
           	{name:"macerating", type:'efficiency farming', title: "Ore Refining", costs:{leather:500, stone:500}, variable_increase:{stoneSpecialChance:0.001}},

           	{name:"croprotation", type:'improved farming', title: "Crop Rotation", costs:{herbs:5000, piety:1000}, variable_increase:{farmers:0.1}},
           	{name:"selectivebreeding", type:'improved farming', title: "Breeding", costs:{skins:5000, piety:1000}, variable_increase:{farmers:0.1}},
           	{name:"fertilizers", type:'improved farming', costs:{ore:5000, piety:1000}, variable_increase:{farmers:0.1}},

           	{name:"masonry", type:'construction', costs:{wood:100, stone:100}},
           	{name:"construction", type:'construction', costs:{wood:1000, stone:1000}},
           	{name:"architecture", type:'construction', costs:{wood:10000, stone:10000}},

            {name:"tenements", type:'housing', costs:{food:200, wood:500, stone:500}},
            {name:"slums", type:'housing', costs:{food:500, wood:1000, stone:1000}},

            {name:"granaries", type:'city efficiency', costs:{wood:1000, stone:1000}},
           	{name:"palisade", type:'city efficiency', costs:{wood:2000, stone:1000}},

            {name:"weaponry", type:'weaponry', costs:{wood:500, metal:500}, variable_increase:{soldier:0.01, cavalry:0.01}},
           	{name:"shields", type:'weaponry', costs:{wood:500, leather:500}, variable_increase:{soldier:0.01, cavalry:0.01}},
            {name:"horseback", type:'weaponry', costs:{wood:500, food:500}},
           	{name:"wheel", type:'weaponry', costs:{wood:500, stone:500}},

           	{name:"writing", type:'writing', costs:{skins:500}},
           	{name:"administration", type:'writing', costs:{skins:1000, stone:1000}},
           	{name:"codeoflaws", type:'writing', title: "Code of Laws", costs:{skins:1000, stone:1000}},
           	{name:"mathematics", type:'writing', costs:{herbs:1000, piety:1000}},
           	{name:"aesthetics", type:'writing', costs:{piety:5000}},
            {name:"standard", type:'writing', title:"Battle Standard", costs:{leather:1000, metal:1000}},

            {name:"civilservice", type:'civil', title: "Civil Service", costs:{piety:5000}},
           	{name:"feudalism", type:'civil', costs:{piety:10000}},
           	{name:"guilds", type:'civil', costs:{piety:10000}},
           	{name:"serfs", type:'civil', costs:{piety:20000}},
           	{name:"nationalism", type:'civil', costs:{piety:50000}},

            {name:"trade", type:'commerce', costs:{gold:1}},
           	{name:"currency", type:'commerce', costs:{gold:10, ore:1000}},
           	{name:"commerce", type:'commerce', costs:{gold:100, piety:10000}},

           	{name:"deity", type:'deity', costs:{piety:1000}, special:"choose deity"},
//           	{name:"deityType"}, //TODO: How to handle 4 deities?

           	{name:"lure", type:'deity', costs:{piety:1000}},
           	{name:"companion", type:'deity', costs:{piety:1000}},
           	{name:"comfort", type:'deity', costs:{piety:5000}},
           	{name:"blessing", type:'deity', costs:{piety:1000}},
           	{name:"waste", type:'deity', costs:{piety:1000}},
           	{name:"stay", type:'deity', costs:{piety:5000}},
           	{name:"riddle", type:'deity', costs:{piety:1000}},
           	{name:"throne", type:'deity', costs:{piety:1000}},
           	{name:"lament", type:'deity', costs:{piety:5000}},
           	{name:"book", type:'deity', costs:{piety:1000}},
           	{name:"feast", type:'deity', costs:{piety:1000}},
           	{name:"secrets", type:'deity', costs:{piety:5000}}

        ],
        achievements: [
            {name: "hamlet"},
            {name: "village"},
            {name: "smallTown"},
            {name: "largeTown"},
            {name: "smallCity"},
            {name: "largeCity"},
            {name: "metropolis"},
            {name: "smallNation"},
            {name: "nation"},
            {name: "largeNation"},
            {name: "empire"},
            {name: "raider"},
            {name: "engineer"},
            {name: "domination"},
            {name: "hated"},
            {name: "loved"},
            {name: "cat"},
            {name: "glaring"},
            {name: "clowder"},
            {name: "battle"},
            {name: "cats"},
            {name: "fields"},
            {name: "underworld"},
            {name: "fullHouse"},
            {name: "plague"},
            {name: "ghostTown"},
            {name: "wonder"},
            {name: "seven"},
            {name: "merchant"},
            {name: "rushed"},
            {name: "neverclick"}
        ]
    };


    CivviesClass.initializeOptions('game_options', _game_options);

})(Civvies);