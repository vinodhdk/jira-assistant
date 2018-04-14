import { Injectable } from '@angular/core';
import { CHROME_WS_URL } from '../_constants';

@Injectable()
export class AppBrowserService {
  private chrome: any
  private $window: Window
  constructor() {
    this.$window = window;
    this.chrome = this.$window['chrome'];
  }


  notSetting: any = {
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
    onClicked: (id, byUser) => {
      var noti = this.notSetting.curShowing[id];
      if (noti) {
        if (noti.onClicked) { noti.onClicked(byUser); }
      }
    },
    onClosed: (id, byUser) => {
      var noti = this.notSetting.curShowing[id];
      if (noti) {
        delete this.notSetting.curShowing[id];

        if (noti.onClosed) { noti.onClosed(byUser); }
      }
    },
    show: (id, title, message, ctxMsg, opts) => {
      var msgObj = {
        type: "basic",
        iconUrl: "/img/icon_48.png",
        title: title,
        message: message,
        contextMessage: ctxMsg,
        //eventTime
        //buttons: btns,
        //progress: 60,
        isClickable: true,
        requireInteraction: true,
        buttons: []
      };

      if (opts.buttons) {
        msgObj.buttons = opts.buttons.Select((b) => { return { title: b.title }; });
      }

      this.chrome.notifications.create(id, msgObj, (notId) => {
        this.notSetting.curShowing[id] = opts;
      });
    }
  };


  getCurrentUrl() {
    return new Promise((resolve, reject) => {
      this.chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          resolve(tabs[0].url);
        }
        else { reject("Unable to fetch the url"); }
      });
    });
  }

  getCurrentTab(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, (tabs) => {
        if (tabs && tabs[0]) {
          resolve(tabs[0]);
        }
        else { reject("Unable to fetch the tab"); }
      });
    });
  }
  replaceTabUrl(url) {
    return this.getCurrentTab().then((tab) => {
      this.chrome.tabs.update(tab.id, { url: url });
    });
  }
  openTab(url) {
    window.open(url);
  }
  getStorage() {
    return this.chrome.storage ? this.chrome.storage.local : localStorage;
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
  getAppInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chrome.management.getSelf((info) => {
        if (info) {
          info.isDevelopment = info.installType === this.chrome.management.ExtensionInstallType.DEVELOPMENT;
          resolve(info);
        }
        else { reject(info); }
      });
    });
  }
  getAppVersion() {
    return this.getAppInfo().then((info) => { return info.version; });
  }
  getAppLongName() {
    return this.chrome.app.getDetails().name;
  }
  notify(id, title, message, ctxMsg, opts) {
    this.notSetting.init();
    this.notSetting.show(id, title, message, ctxMsg, opts);
  }
  addCmdListener(callback) { this.chrome.commands.onCommand.addListener(callback); }
  getAuthToken(options) {
    return new Promise((resolve, reject) => {
      this.chrome.identity.getAuthToken(options, (accessToken) => {
        if (this.chrome.runtime.lastError || !accessToken) {
          console.error('GCalendar intergation failed', accessToken, this.chrome.runtime.lastError.message);
          reject({ error: this.chrome.runtime.lastError, tokken: accessToken });
        }
        else {
          resolve(accessToken);
        }
      });
    });
  }
  removeAuthTokken(authToken) {
    this.chrome.identity.removeCachedAuthToken({ 'token': authToken }, () => { })
  }
  getStoreUrl(forRating?: boolean) { return CHROME_WS_URL + (forRating ? '/reviews' : ''); }//ToDo: 

}
