import { Injectable } from '@angular/core';
import { SessionService } from './session.service'
import * as moment from 'moment'

const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTH_NAMES = ['January', 'Febraury', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TINY_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Injectable()
export class UtilsService {

  constructor(private $session: SessionService) { }

  formatDate(date: Date, format: string) {
    var yyyy = date.getFullYear().toString();
    var mmInt = date.getMonth();
    var mm = mmInt < 9 ? "0" + (mmInt + 1) : (mmInt + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate() < 10 ? "0" + date.getDate() : date.getDate().toString();
    var hhInt = date.getHours();
    var hh = hhInt < 10 ? "0" + hhInt : hhInt.toString();
    var min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes().toString();
    var ss = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds().toString();
    var day = date.getDay();

    if (format)
      return format
        .replace("yyyy", yyyy)
        .replace("yy", yyyy)
        .replace("MMMM", FULL_MONTH_NAMES[mmInt])
        .replace("MMM", SHORT_MONTH_NAMES[mmInt])
        .replace("MM", mm)
        .replace("DDDD", FULL_DAY_NAMES[day])
        .replace("DDD", SHORT_DAY_NAMES[day])
        .replace("dddd", FULL_DAY_NAMES[day])
        .replace("ddd", SHORT_DAY_NAMES[day])
        .replace("DD", TINY_DAY_NAMES[day])
        .replace("dd", dd)
        .replace("HH", hh)
        .replace("hh", (hhInt > 12 ? (hhInt - 12) : hh).toString())
        .replace("mm", min)
        .replace("ss", ss)
        .replace("tt", hhInt >= 12 ? "PM" : "AM")
        ;
    else
      return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min).concat(ss);
  }

  getTicketUrl(ticketNo: string): string {
    if (!ticketNo) {
      return;
    }
    return this.$session.CurrentUser.ticketViewUrl + ticketNo;
  }

  mapJiraUrl(url: string): string {
    if (!url || (url.startsWith('http') && url.indexOf(':') > 3)) {
      return url;
    }
    if (!url.startsWith('/')) { url = '/' + url; }
    return this.$session.CurrentUser.jiraUrl + url;
  }

  getRowStatus(d) {
    var classNames = "";
    if (d.status) {

      classNames += (d.status.name || d.status).toLowerCase() == "closed" ? "closed " : "";
    }

    if (d.difference) {
      var secsDiff = this.getTotalSecs(d.difference);
      if (secsDiff > 0)
        classNames += "log-high ";
      else if (secsDiff < 0)
        classNames += "log-less ";
    }

    return classNames;
  }

  getWorklogUrl(ticketNo, worklogId) {
    var url = this.getTicketUrl(ticketNo);
    if (url && worklogId) {
    }
    url += "?focusedWorklogId=" + worklogId + "&page=com.atlassian.jira.plugin.system.issuetabpanels%3Aworklog-tabpanel#worklog-" + worklogId;
    return url;
  }

  //ToDo:
  //loadModal(url, scope) {
  //  var div = $('<div id="divRemoteModal" class="modal fade" role="dialog"></div>');
  //  $("#divRemoteModal").remove();
  //  $("body > div.page-container").append(div);
  //}

  isHoliday(date: Date): boolean {
    var weekDay = date.getDay();
    var workingDays = this.$session.CurrentUser.workingDays;
    //ToDo: Need to have track of holiday and need to do the checking here
    return workingDays.indexOf(weekDay) === -1;
  }

  // ToDo: Tour need to be fixed
  //loadTour(name, settings) {
  //  if (!name) {
  //    name = obj.currentPage;
  //    settings = obj.pageSettings;
  //  }
  //  if (settings) {
  //    var items = tourData[name];
  //    if (items && items.length > 0) {
  //      bootstro.start('', { items: items });
  //    }
  //  }
  //}

  getProfileImgUrl(user) {
    if (user.jiraUser) { user = user.jiraUser; }
    if (user.avatarUrls) { return user.avatarUrls["48x48"] || user.avatarUrls["32x32"]; }
    else { return this.$session.rootUrl + "/secure/useravatar?ownerId=" + user.name.toLowerCase(); }
    ///Security/ProfilePic / {{userInfo.name }}
  }

  getTotalSecs(ts) {
    if (typeof ts === "string") {
      var num = null;
      if (!ts || (num = ts.split(':')).length < 2) {
        return ts;
      }

      var secs = parseInt(num[0], 0) * 60 * 60;
      secs += parseInt(num[1], 0) * 60;
      if (num.length > 2)
        secs += parseInt(num[2], 0);
      return secs;
    }
    else if (typeof ts === "number") { return ts / 1000; }
  }

  //ToDo: Modal closed event
  //modalClosed() {
  //  $('body').removeClass("modal-open").removeAttr("style"); // This is a fix for Model Service.
  //  $('.modal-backdrop').remove(); // This is fix for modal backdrop not hiding
  //}

  convertDate(value) {
    if (!value) { return value; }
    if (value instanceof Date) { return value; }
    else if (value.indexOf("/Date(") > -1)
      return new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
    else {
      var dateObj = new Date(value);
      if (moment(dateObj).isValid()) { return dateObj; }
      dateObj = moment(value).toDate();
      if (moment(dateObj).isValid()) { return dateObj; }
    }
  }
}
