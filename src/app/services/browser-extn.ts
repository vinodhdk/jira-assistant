(function (exports, Promise, chrome, browser) {
  function getBrowserExtn($rootScope, $q) {
    $q = $q || Promise;

    const REDIRECT_URL = browser.identity.getRedirectURL();
    const CLIENT_ID = "692513716183-jm587gc534dvsere4qhnk5bj68pql3p9.apps.googleusercontent.com";
    const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
    const AUTH_URL =
      'https://accounts.google.com/o/oauth2/auth?client_id='
      + CLIENT_ID + '&response_type=token&redirect_uri=' + encodeURIComponent(REDIRECT_URL)
      + '&scope=' + encodeURIComponent(SCOPES.join(" "));

    const VALIDATION_BASE_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";


    var notSetting: any = {
      init: function () {
        if (this.curShowing) { return; }
        chrome.notifications.onButtonClicked.addListener(this.buttonClicked);
        chrome.notifications.onClicked.addListener(this.onClicked);
        chrome.notifications.onClosed.addListener(this.onClosed);
        this.curShowing = {};
      },
      buttonClicked: function (id, index) {
        var noti = notSetting.curShowing[id];
        if (noti) {
          var btn = noti.buttons[index];
          if (btn && btn.onClick) {
            btn.onClick();
          }
          else { alert("This functionality is not yet implemented!"); }
          chrome.notifications.clear(id);
        }
      },
      //onClicked: function (id) {
      //  var noti = notSetting.curShowing[id];
      //  if (noti) {
      //    if (noti.onClicked) { noti.onClicked(byUser); }
      //  }
      //},
      onClosed: function (id, byUser) {
        var noti = notSetting.curShowing[id];
        if (noti) {
          delete notSetting.curShowing[id];

          if (noti.onClosed) { noti.onClosed(byUser); }
        }
      },
      show: function (id, title, message, ctxMsg, opts) {
        var msgObj: any = {
          type: "basic",
          iconUrl: "/img/icon_48.png",
          title: title,
          message: message,
          contextMessage: ctxMsg,
          //eventTime
          //buttons: btns,
          //progress: 60,
          isClickable: true
        };

        if (opts.buttons) {
          msgObj.buttons = opts.buttons.Select(function (b) { return { title: b.title }; });
        }

        chrome.notifications.create(id, msgObj, function (notId) {
          notSetting.curShowing[id] = opts;
        });
      }
    };

    var obj = {
      getCurrentUrl: function () {
        return $q(function (resolve, reject) {
          chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
            if (tabs && tabs[0] && tabs[0].url) {
              resolve(tabs[0].url);
            }
            else { reject("Unable to fetch the url"); }
          });
        });
      },
      getCurrentTab: function () {
        return $q(function (resolve, reject) {
          chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
            if (tabs && tabs[0] && tabs[0].url) {
              resolve(tabs[0]);
            }
            else { reject("Unable to fetch the url"); }
          });
        });
      },
      replaceTabUrl: function (url) {
        return obj.getCurrentTab().then(function (tab) {
          alert(tab.id);
          alert(chrome.tabs.update);
          chrome.tabs.update(tab.id, { url: url });
        });
      },
      openTab: function (url) {
        browser.tabs.create({ url: url });
      },
      getStorage: function () {
        return chrome.storage.local;
      },
      getStorageInfo: function () {
        return (navigator as any).storage.estimate().then(function (estimate) {
          var usedSpace = estimate.usage;
          var totalSpace = estimate.quota;

          return {
            totalSpace: totalSpace,
            usedSpace: usedSpace,
            freeSpace: totalSpace - usedSpace,
            usedSpacePerc: Math.round(usedSpace * 100 / totalSpace)
          };
        });
      },
      getAppInfo: function () {
        return browser.management.getSelf().then(function (info) {
          info.isDevelopment = info.installType === browser.management.ExtensionInstallType.DEVELOPMENT;
          return info;
        });
      },
      getAppVersion: function () {
        return obj.getAppInfo().then(function (info) { return info.version; });
      },
      getAppLongName: function () {
        return "Jira Assistant";
      },
      notify: function (id, title, message, ctxMsg, opts) {
        notSetting.init();
        notSetting.show(id, title, message, ctxMsg, opts);
      },
      addCmdListener: function (callback) { chrome.commands.onCommand.addListener(callback); },
      getAuthToken: function (options) {
        return browser.identity.launchWebAuthFlow({
          interactive: options.interactive,
          url: AUTH_URL
        }).then(function (tokken) { return extractAccessToken(tokken); });
        //return $q(function (resolve, reject) {
        //    chrome.identity.getAuthToken(options, function (accessToken) {
        //        if (chrome.runtime.lastError || !accessToken) {
        //            console.error('GCalendar intergation failed', accessToken, chrome.runtime.lastError.message);
        //            reject({ error: chrome.runtime.lastError, tokken: accessToken });
        //        }
        //        else {
        //            resolve(accessToken);
        //        }
        //    });
        //});
      },
      removeAuthTokken: function (authToken) {
        browser.identity.removeCachedAuthToken({ 'token': authToken }, function () { })
      },
      getStoreUrl: function () { return ""; }//FF_STORE_URL
    };

    function extractAccessToken(redirectUri) {
      let m = redirectUri.match(/[#?](.*)/);
      if (!m || m.length < 1)
        return null;
      let params = new URLSearchParams(m[1].split("#")[0]);
      return params.get("access_token");
    }

    return obj;
  }

  exports.getBrowserExtn = getBrowserExtn;
})(window['exports'], window['Promise'], window['chrome'], window['browser']);
