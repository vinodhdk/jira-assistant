import { Injectable } from '@angular/core';

@Injectable()
export class AppBrowserService {
  private browser: any
  private chrome: any
  private CLIENT_ID = "692513716183-jm587gc534dvsere4qhnk5bj68pql3p9.apps.googleusercontent.com";
  private SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
  private VALIDATION_BASE_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";
  private AUTH_URL: string
  private REDIRECT_URL: string

  private notSetting: any
  private $window: Window

  constructor() {
    this.$window = window;
    this.browser = this.$window['browser'];
    this.chrome = this.$window['chrome'];

    this.REDIRECT_URL = this.browser.identity.getRedirectURL();
    this.AUTH_URL = 'https://accounts.google.com/o/oauth2/auth?client_id='
      + this.CLIENT_ID + '&response_type=token&redirect_uri=' + encodeURIComponent(this.REDIRECT_URL)
      + '&scope=' + encodeURIComponent(this.SCOPES.join(" "));

    this.notSetting = {
      init: () => {
        if (this.notSetting.curShowing) { return; }
        this.chrome.notifications.onButtonClicked.addListener(this.notSetting.buttonClicked);
        this.chrome.notifications.onClicked.addListener(this.notSetting.onClicked);
        this.chrome.notifications.onClosed.addListener(this.notSetting.onClosed);
        this.notSetting.curShowing = {};
      },
      buttonClicked: (id, index) => {
        var noti = this.notSetting.curShowing[id];
        if (noti) {
          var btn = noti.buttons[index];
          if (btn && btn.onClick) {
            btn.onClick();
          }
          else { alert("This functionality is not yet implemented!"); }
          this.chrome.notifications.clear(id);
        }
      },
      //onClicked: (id) => {
      //  var noti = this.notSetting.curShowing[id];
      //  if (noti) {
      //    if (noti.onClicked) { noti.onClicked(byUser); }
      //  }
      //},
      onClosed: (id, byUser) => {
        var noti = this.notSetting.curShowing[id];
        if (noti) {
          delete this.notSetting.curShowing[id];

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

        this.chrome.notifications.create(id, msgObj, (notId) => {
          this.notSetting.curShowing[id] = opts;
        });
      }
    };
  }

  getCurrentUrl() {
    return new Promise((resolve, reject) => {
      this.chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        if (tabs && tabs[0] && tabs[0].url) {
          resolve(tabs[0].url);
        }
        else { reject("Unable to fetch the url"); }
      });
    });
  }

  getCurrentTab() {
    return new Promise((resolve, reject) => {
      this.chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        if (tabs && tabs[0] && tabs[0].url) {
          resolve(tabs[0]);
        }
        else { reject("Unable to fetch the url"); }
      });
    });
  }

  //replaceTabUrl(url) {
  //  return this.getCurrentTab().then((tab) => {
  //    this.chrome.tabs.update(tab.id, { url: url });
  //  });
  //}

  openTab(url) {
    this.browser.tabs.create({ url: url });
  }

  getStorage() {
    return this.chrome.storage.local;
  }

  getStorageInfo() {
    return (navigator as any).storage.estimate().then((estimate) => {
      var usedSpace = estimate.usage;
      var totalSpace = estimate.quota;

      return {
        totalSpace: totalSpace,
        usedSpace: usedSpace,
        freeSpace: totalSpace - usedSpace,
        usedSpacePerc: Math.round(usedSpace * 100 / totalSpace)
      };
    });
  }

  getAppInfo() {
    return this.browser.management.getSelf().then((info) => {
      info.isDevelopment = info.installType === this.browser.management.ExtensionInstallType.DEVELOPMENT;
      return info;
    });
  }

  getAppVersion() {
    return this.getAppInfo().then((info) => { return info.version; });
  }

  getAppLongName() {
    return "Jira Assistant";
  }

  notify(id, title, message, ctxMsg, opts) {
    this.notSetting.init();
    this.notSetting.show(id, title, message, ctxMsg, opts);
  }

  addCmdListener(callback) { this.chrome.commands.onCommand.addListener(callback); }

  getAuthToken(options) {
    return this.browser.identity.launchWebAuthFlow({
      interactive: options.interactive,
      url: this.AUTH_URL
    }).then((tokken) => { return this.extractAccessToken(tokken); });
    //return this.$q((resolve, reject) => {
    //    chrome.identity.getAuthToken(options,  (accessToken)=> {
    //        if (chrome.runtime.lastError || !accessToken) {
    //            console.error('GCalendar intergation failed', accessToken, chrome.runtime.lastError.message);
    //            reject({ error: chrome.runtime.lastError, tokken: accessToken });
    //        }
    //        else {
    //            resolve(accessToken);
    //        }
    //    });
    //});
  }

  removeAuthTokken(authToken) {
    this.browser.identity.removeCachedAuthToken({ 'token': authToken }, () => { })
  }

  getStoreUrl() { return ""; }//FF_STORE_URL


  private extractAccessToken(redirectUri) {
    let m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
      return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
  }
}
