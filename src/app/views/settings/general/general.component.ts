import { Component, OnInit } from '@angular/core';
import { FacadeService } from '../../../services/facade.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { SessionService } from '../../../services/session.service';
import { AppBrowserService } from '../../../services/app-browser.service';
import { CalendarService } from '../../../services/calendar.service';
import { MessageService } from '../../../services/message.service';
import { navigation } from '../../../_nav';
import { CacheService } from '../../../services/cache.service';

@Component({
  selector: 'ja-general',
  templateUrl: './general.component.html'
})
export class GeneralComponent implements OnInit {
  settings: any
  dateFormats: string[]
  timeFormats: string[]
  removedIntg: boolean
  spaceInfo: any
  menus: any[]
  selectedMenus: any[]
  launchMenus: any[]
  selectedLaunchPage: any
  dashboards: any[]
  selectedDashboard: any

  constructor(private $jaFacade: FacadeService, private $jaBrowserExtn: AppBrowserService,
    private $jaAnalytics: AnalyticsService, private $session: SessionService,
    private $jaCalendar: CalendarService, private message: MessageService, private $cache: CacheService) {
    this.settings = {};
    this.spaceInfo = {};
  }

  ngOnInit() {
    this.$jaBrowserExtn.getStorageInfo().then((info) => {
      this.spaceInfo = info;
      var progressClass = 'progress-bar-';
      if (info.usedSpacePerc < 50) { progressClass += 'green'; }
      else if (info.usedSpacePerc <= 75) { progressClass += 'yellow'; }
      else { progressClass += 'red'; }
      this.spaceInfo.progressClass = progressClass;
    });
    this.$jaFacade.getUserSettings().then(res => {
      this.parseSettings(res);

      this.menus = [];
      this.launchMenus = [];
      let lastGroup = null;
      var launchAct = this.settings.launchAction;
      var selMenus = launchAct.selectedMenu || ['D-0', 'R-UD', 'R-SP', 'R-CG', 'CAL', 'S-GE'];
      this.selectedLaunchPage = launchAct.autoLaunch;
      this.selectedDashboard = launchAct.quickIndex;

      navigation.ForEach(menu => {
        if (menu.name) {
          this.menus.Add({
            id: menu.id, isHead: menu.title, name: menu.name, icon: menu.icon,
            url: menu.url, selected: selMenus.indexOf(menu.id) > -1
          });
          if (menu.title) {
            lastGroup = this.launchMenus.Add({ label: menu.name, items: [] });
          }
          else {
            lastGroup.items.Add({ value: menu.id, label: menu.name, icon: menu.icon });
          }
        }
      });
      this.dashboards = this.launchMenus[0].items;
    });
  }

  saveSettings() {
    var setting: any = { action: parseInt(this.settings.menuAction) };
    var launchSetting: any = { action: setting.action };
    this.settings.launchAction = setting;

    switch (this.settings.menuAction) {
      case '1':
        launchSetting.menus = this.menus.Select(menu => { if (menu.selected && !menu.isHead) { return { name: menu.name, url: menu.url }; } });
        setting.selectedMenus = this.menus.Select(menu => { if (menu.selected && !menu.isHead) { return menu.id; } });
        break;
      case '2':
        if (this.selectedLaunchPage) {
          launchSetting.url = this.menus.First(menu => menu.id == this.selectedLaunchPage).url;
          setting.autoLaunch = this.selectedLaunchPage;
        }
        break;
      case '3':
        if (this.selectedDashboard) {
          launchSetting.index = parseInt((this.selectedDashboard || '0').replace('D-', ''));
          setting.quickIndex = this.selectedDashboard;
        }
        break;
    }
    this.$jaFacade.saveUserSettings(this.settings).then(res => {
      this.$cache.set("menuAction", launchSetting, false, true);
      this.parseSettings(res);
    });
  }

  parseSettings(result) {
    var cUser = this.$session.CurrentUser;
    var sett = this.settings = result.settings;

    this.dateFormats = result.dateFormats;
    this.timeFormats = result.timeFormats;

    cUser.dateFormat = sett.dateFormat;
    cUser.timeFormat = sett.timeFormat;

    cUser.workingDays = sett.workingDays;
    cUser.gIntegration = sett.googleIntegration;
    cUser.maxHours = sett.maxHours;
    cUser.meetingTicket = sett.meetingTicket;
    cUser.hasGoogleCreds = sett.hasGoogleCredentials;
    cUser.pruneInterval = parseInt(sett.pruneInterval || 4);

    if (!sett.launchAction) {
      sett.launchAction = {}; sett.menuAction = '1';
    }
    else { sett.menuAction = '' + sett.launchAction.action; }

    sett.maxHours = "" + sett.maxHours;
    sett.autoLaunch = "" + (sett.autoLaunch || "0");
    sett.notifyBefore = "" + (sett.notifyBefore || "0");
    sett.checkUpdates = "" + (sett.checkUpdates || "15");
    cUser.team = sett.teamMembers;

    if (sett.startOfDay) {
      var temp = sett.startOfDay.split(':');
      cUser.startOfDay = temp[0] + ':' + temp[1];
    }
    if (sett.endOfDay) {
      var temp = sett.endOfDay.split(':');
      cUser.endOfDay = temp[0] + ':' + temp[1];
    }

    this.removedIntg = false;
  }

  googleSignIn() {
    this.$jaCalendar.authenticate(true).then((result) => {
      this.settings.hasGoogleCredentials = true;
      this.$session.CurrentUser.hasGoogleCreds = true;
      this.$jaAnalytics.trackEvent("Signedin to Google Calendar");
      this.message.success("Successfully integrated with google account.");
    }, (err) => { this.message.warning("Unable to integrate with Google Calendar!"); });
  }

  selectSubMenus(menu: any, event): void {
    event.stopPropagation();
    menu = menu.value;
    for (var i = this.menus.indexOf(menu) + 1; i < this.menus.length; i++) {
      var subMenu = this.menus[i];
      if (subMenu.isHead) { return; }
      subMenu.selected = menu.selected;
    }
  }
}
