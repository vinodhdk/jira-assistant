import { Component, HostListener, ElementRef } from '@angular/core';
import * as moment from 'moment';
import { JiraService } from '../../services/jira.service';
import { UtilsService, CacheService, SessionService } from '../../services';
import { FormatTimePipe, ConvertSecsPipe } from '../../pipes';
import { FacadeService } from '../../services/facade.service';
import { BaseGadget } from '../base-gadget';


// ToDo: Sprint wise filters
// Filter columns
// show more instructions about settings
// 

@Component({
  selector: '[dayWiseWorklog]',
  templateUrl: './day-wise-worklog.component.html'
})
export class DayWiseWorklogComponent extends BaseGadget {
  dateRange: any
  dates: any[]
  userDayWise: any[]
  months: any[]
  userList: any[]
  groups: any[]
  isLoading: boolean
  showSettings: boolean
  showGroupsPopup: boolean
  pageSettings: any = { breakupMode: '1', groupMode: '1' } // ToDo : Implement page settings

  groupedData: any // Contains data for grouped report
  flatData: any[] // Contains data for flat report

  constructor(el: ElementRef, private $jaDataSvc: JiraService, private $jaCache: CacheService, private $facade: FacadeService,
    private $utils: UtilsService, private formatTime: FormatTimePipe, private convertSecs: ConvertSecsPipe, $session: SessionService) {
    super(el, 'Logged Work - [User - Day wise]', 'fa-list-alt');
    this.dateRange = {};
    $facade.getUserGroups().then(grps => this.groups = grps);
    this.pageSettings = $session.pageSettings.reports_UserDayWise;
    //this.onResize({ target: window });
  }

  dateSelected($event): void {
    this.generateReport();
  }

  generateReport(): void {
    if (!this.groups) { return; }
    this.userList = this.groups.Union(grps => grps.users.ForEach(gu => gu.groupName = grps.name));
    var req = {
      userList: this.userList.Select(u => u.name.toLowerCase()),
      fromDate: this.dateRange.fromDate,
      toDate: this.dateRange.toDate
    };
    this.isLoading = true;
    this.getDayWiseReportData(req).then(res => {
      //this.processReportData(res);
      this.generateGroupData(res);
      this.generateFlatData(res);
      this.isLoading = false;
      this.onResize({ target: window });
    });
  }

  getDayWiseReportData(req) {
    var userList = req.userList.Distinct();
    var mfromDate = moment(req.fromDate);
    var mtoDate = moment(req.toDate);
    var fromDate = mfromDate.toDate();
    var toDate = mtoDate.toDate();

    var dateArr = this.getDateArray(fromDate, toDate);
    this.dates = dateArr.Select(d => {
      return {
        prop: d.format('yyyyMMdd'),
        display: d.format('DDD, dd'),
        date: d,
        isHoliday: this.$utils.isHoliday(d)
      }
    });

    this.months = dateArr.GroupBy((d) => d.format("MMM, yyyy")).Select(grp => { return { monthName: grp.key, days: grp.values.length }; });

    var jql = "worklogAuthor in ('" + userList.join("','") + "') and worklogDate >= '"
      + mfromDate.clone().add(-1, 'days').format("YYYY-MM-DD") + "' and worklogDate < '" + mtoDate.clone().add(1, 'days').format("YYYY-MM-DD") + "'";

    return this.$jaDataSvc.searchTickets(jql, ["summary", "worklog", "issuetype", "parent"])//, "status", "assignee"
      .then((issues) => {
        var arr = userList.Select((u) => { return { logData: [], userName: u.toLowerCase() }; });

        var report = {};
        for (var x = 0; x < arr.length; x++) {
          var a = arr[x];
          report[a.userName] = a;
        }

        for (var iss = 0; iss < issues.length; iss++) {
          var issue = issues[iss];
          var fields = issue.fields;
          var worklogs = fields.worklog.worklogs;

          for (var i = 0; i < worklogs.length; i++) {
            var worklog = worklogs[i];
            var startedTime = moment(worklog.started).toDate();
            var startedDate = moment(worklog.started).startOf("day").toDate();

            if (startedDate.getTime() >= fromDate.getTime() && startedDate.getTime() <= toDate.getTime()) {
              var reportUser = report[worklog.author.name.toLowerCase()];
              if (reportUser) {
                reportUser.logData.Add({
                  ticketNo: issue.key,
                  url: this.$utils.getTicketUrl(issue.key),
                  issueType: (fields.issuetype || "").name,
                  parent: (fields.parent || "").key,
                  summary: fields.summary,
                  logTime: startedTime,
                  comment: worklog.comment,
                  totalHours: worklog.timeSpentSeconds
                });
              }
            }
          }
        }

        for (var i = 0; i < arr.length; i++) {
          var userData = arr[i];
          userData.totalHours = userData.logData.Sum((t) => { return t.totalHours; });
        }

        return arr;
      });
  }

  private generateGroupData(data) {
    this.groupedData = this.groups.Select(grp => {
      var grpInfo = {
        name: grp.name,
        total: {},
        grandTotal: 0,
        users: null
      };

      grpInfo.users = grp.users.Select(usr => {
        var usrInfo = {
          name: usr.name,
          displayName: usr.displayName,
          emailAddress: usr.emailAddress,
          //timeZone: usr.timeZone,
          imageUrl: usr.avatarUrls['48x48'] || usr.avatarUrls['32x32'],
          profileUrl: usr.self,
          tickets: null,
          total: {},
          logClass: {},
          grandTotal: 0
        };

        var logData: any[] = data.First(d => d.userName == usr.name.toLowerCase()).logData;
        usrInfo.tickets = logData.GroupBy(lGrp => lGrp.ticketNo)
          .Select(tGrp => {
            var items = tGrp.values;
            var firstTkt = items.First();
            var logs = {};
            var ticket = {
              ticketNo: tGrp.key,
              parent: firstTkt.parent,
              parentUrl: firstTkt.parent ? this.$utils.getTicketUrl(firstTkt.parent) : null,
              issueType: firstTkt.issueType,
              summary: firstTkt.summary,
              url: firstTkt.url,
              logs: logs
            };

            items.ForEach(item => {
              var dateFormated = item.logTime.format('yyyyMMdd');
              var logForDate = logs[dateFormated];
              if (!logForDate) { logForDate = []; logs[dateFormated] = logForDate; }
              logForDate.Add({ logTime: item.logTime, totalHours: item.totalHours, comment: item.comment });
            });

            return ticket;
          });

        // Set date wise total per user
        var logClass = usrInfo.logClass;
        var usrTotal = usrInfo.total;
        var usrGTotal = 0;
        this.dates.ForEach(d => {
          var totalHrs = usrInfo.tickets.Sum(t => {
            var lgArr = t.logs[d.prop];
            if (lgArr) { return lgArr.Sum(l => l.totalHours) }
            else { return 0; }
          });
          if (totalHrs > 0) { usrTotal[d.prop] = totalHrs; usrGTotal += totalHrs; }
          logClass[d.prop] = this.getCssClass(d, totalHrs);
        });
        usrInfo.grandTotal = usrGTotal;

        return usrInfo;
      });

      // Set date wise total per group
      var grpTotal = grpInfo.total;
      var grpGTotal = 0;
      this.dates.ForEach(d => {
        var totalHrs = grpInfo.users.Sum(u => u.total[d.prop] || 0);
        if (totalHrs > 0) { grpTotal[d.prop] = totalHrs; grpGTotal += totalHrs; }
      });
      grpInfo.grandTotal = grpGTotal;

      return grpInfo;
    });

    // Set date wise total for all groups
    var grandTotal = 0;
    var grpTotal = {};
    this.dates.ForEach(d => {
      var totalHrs = this.groupedData.Sum(u => u.total[d.prop] || 0);
      if (totalHrs > 0) { grpTotal[d.prop] = totalHrs; grandTotal += totalHrs; }
    });
    this.groupedData.grandTotal = grandTotal;
    this.groupedData.total = grpTotal;
  }

  private generateFlatData(data) {
    this.flatData = this.groups.Union(grp => {
      var groupName = grp.name;

      return grp.users.Union(usr => {
        var userName = usr.displayName;
        return data.First(d => d.userName == usr.name.toLowerCase()).logData
          .Select(log => {
            return {
              groupName: groupName,
              userDisplay: userName,

              parent: log.parent,
              parentUrl: log.parent ? this.$utils.getTicketUrl(log.parent) : null,

              ticketNo: log.ticketNo,
              ticketUrl: log.url,
              issueType: log.issueType,
              summary: log.summary,

              logTime: log.logTime,
              timeSpent: log.totalHours,
              comment: log.comment
            };
          });
      });
    });
  }

  private processReportData(data) {
    var param = { fromDate: this.dateRange.fromDate, toDate: this.dateRange.toDate, dateArr: [] };
    data.ForEach((d) => {
      var usr = this.userList.First((u) => u.name.toLowerCase() === d.userName.toLowerCase());
      d.userName = usr.name;
      d.displayName = usr.displayName;
      d.userEmail = usr.emailAddress;
      d.groupName = usr.groupName;
      delete usr.groupName;
      d.jiraUser = usr;
    });

    var dateArr = this.getDateArray(param.fromDate, param.toDate);
    param.dateArr = dateArr;
    var months = dateArr.Distinct((d) => { return d.format("MMM, yyyy"); })
      .Select((m) => {
        return {
          monthName: m,
          dates: dateArr.Where((d) => { return d.format("MMM, yyyy") === m; })
        };
      });
    data.ForEach((u) => {
      u.profileImgUrl = this.$utils.getProfileImgUrl(u);
      u.ticketWise = u.logData.DistinctObj((t) => {
        return {
          ticketNo: t.ticketNo,
          url: this.$utils.getTicketUrl(t.ticketNo),
          summary: t.summary,
          parent: t.parent,
          parentUrl: this.$utils.getTicketUrl(t.parent),
        };
      });
      u.ticketWise.ForEach((t) => {
        var tickets = u.logData.Where((l) => {
          return l.ticketNo === t.ticketNo;
        });
        t.totalHours = tickets.Sum((l) => { return l.totalHours; });

        var dates = tickets.Distinct((l) => { return this.$utils.convertDate(l.logTime).format("yyyyMMdd"); });
        dates.ForEach((d) => {
          t[d] = tickets.Where((l) => {
            return this.$utils.convertDate(l.logTime).format("yyyyMMdd") === d;
          }).Select((l) => {
            return {
              logTime: l.logTime,
              totalHours: l.totalHours,
              comment: l.comment
            };
          });
        });
      });
    });
    this.bindReportData(dateArr, data, months);
  }

  private bindReportData(dateArr, data, months) {
    if (!dateArr && !data) {
      var obj = this.$jaCache.session.get("lastViewed_DayWiseRpt");
      if (obj) {
        dateArr = obj.dateRanges;
        data = obj.logs;
        months = obj.months;
      }
    }
    else { this.$jaCache.session.set("lastViewed_DayWiseRpt", { dateRanges: dateArr, logs: data, months: months }); }

    this.dates = dateArr;
    this.userDayWise = data;
    this.months = months;
    //this.setContSize(); // ToDo
  }

  filterUserData(arr: any[], date: Date) {
    let tmp = date.format('yyyyMMdd');
    return arr.Where((d) => { return this.$utils.convertDate(d.logTime).format('yyyyMMdd') === tmp; }).Sum(d => d.totalHours);
  }

  getGroupTotal(groupName?: string, date?: Date) {
    var groupdUsers = this.userDayWise;

    if (groupName) {
      groupdUsers = groupdUsers.Where(g => g.groupName == groupName);
    }

    if (date) {
      let tmp = date.format('yyyyMMdd');
      return groupdUsers.Union<any>(g => g.logData)
        .Where((d) => { return this.$utils.convertDate(d.logTime).format('yyyyMMdd') === tmp; }).Sum(d => d.totalHours);
    }
    else { return groupdUsers.Sum(d => d.totalHours); }
  }

  getLogClass(date, time) {
    var isHoliday = this.$utils.isHoliday(date);
    if (isHoliday) {
      return time ? 'log-high' : 'col-holiday';
    }
    else {
      var secsPerDay = (8 * 60 * 60);
      if (time === secsPerDay) return 'log-good';
      else if (time < secsPerDay) return 'log-less';
      else if (time > secsPerDay) return 'log-high';
    }
  }

  private getCssClass(day: any, time: number) {
    time = time > 0 ? time : 0;
    if (day.isHoliday) {
      return time ? 'log-high' : 'col-holiday';
    }
    else {
      var secsPerDay = (8 * 60 * 60);
      if (time === secsPerDay) return 'log-good';
      else if (time < secsPerDay) return 'log-less';
      else if (time > secsPerDay) return 'log-high';
    }
  }

  getComments(arr) {
    if (!arr || arr.length === 0) { return ""; }
    var param = { format: this.pageSettings.logFormat == '1' };
    return arr.Select((a) => {
      return this.formatTime.transform(a.logTime) + "(" + this.convertSecs.transform(a.totalHours, param) + ") - " + a.comment;
    }).join(';\n');
  }

  getTotalTime(arr) {
    if (!arr || arr.length === 0) { return ""; }
    return arr.Sum((a) => { return a.totalHours; });
  }

  private getDateArray(startDate: Date, endDate: Date) {
    var interval = 1;
    var retVal = [];
    var current = new Date(startDate);

    while (current <= endDate) {
      retVal.push(new Date(current));
      current = current.addDays(interval);
    }

    return retVal;
  }

  saveSettings() {
    this.$facade.saveSettings('reports_UserDayWise');
  }
}
