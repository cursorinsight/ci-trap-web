/* global module */

/*
 * Cookie monster.
 */
var Cookies = function(window, document) {
"use strict";
// ---------------------------------------------------------------------------

// Life of cookie (in ms)
var defaultCookieTimeout = 15768000000; // 6 months

function setCookie(name, value, msToExpire, path, domain, secure) {
  var date = new Date();
  date.setTime(date.getTime() + (msToExpire ? msToExpire : defaultCookieTimeout));

  document.cookie = name + "=" + window.encodeURIComponent(value) +
      ";expires=" + date.toGMTString() +
      ";path=" + (path || "/") +
      (domain ? ";domain=" + domain : "") +
      (secure ? ";secure" : "");
}

function getCookie(name) {
  var cookiePattern = new RegExp("(^|;)[ ]*" + name + "=([^;]*)"),
      cookieMatch = cookiePattern.exec(document.cookie);

  return cookieMatch ? window.decodeURIComponent(cookieMatch[2]) : null;
}

function eraseCookie(name) {
  setCookie(name, "", -1);
}

this.setCookie = setCookie;
this.getCookie = getCookie;
this.eraseCookie = eraseCookie;

// ---------------------------------------------------------------------------
};

module.exports = Cookies;
