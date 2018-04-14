import { Component, OnInit } from '@angular/core';
import { FacadeService } from '../../../services/facade.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { SessionService } from '../../../services/session.service';
import { AppBrowserService } from '../../../services/app-browser.service';
import { CalendarService } from '../../../services/calendar.service';
import { MessageService } from '../../../services/message.service';

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

  constructor(private $jaFacade: FacadeService, private $jaBrowserExtn: AppBrowserService,
    private $jaAnalytics: AnalyticsService, private $session: SessionService, private $jaCalendar: CalendarService, private message: MessageService) {
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
    this.$jaFacade.getUserSettings().then(res => this.parseSettings(res));
  }

  saveSettings() { this.$jaFacade.saveUserSettings(this.settings).then(res => this.parseSettings(res)); }

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

}
