/// <reference path="../common/linq.extensions.ts" />
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { SessionService } from './session.service';
import { AjaxService } from './ajax.service';
import { CacheService } from './cache.service';
import { JiraService } from './jira.service';
import { AppBrowserService } from './app-browser.service';
import { UtilsService } from './utils.service';
import { MessageService } from './message.service';
import { ApiUrls, dateFormats, timeFormats } from '../_constants';
import { FormatTsPipe } from '../pipes/format-ts.pipe'
import * as moment from 'moment'
import { ISessionUser, IUser, IWidget, IValueLabel, IWorklog } from '../common/interfaces';
import { updateDashboard } from '../_nav';

@Injectable()
export class FacadeService {
  private ticketsCache: any = {};
  constructor(private $session: SessionService, private $db: DatabaseService, private $jaHttp: AjaxService,
    private $jaCache: CacheService, private $jaDataSvc: JiraService, private $jaUtils: UtilsService,
    private $jaBrowserExtn: AppBrowserService, private formatTs: FormatTsPipe, private message: MessageService) { } // format ts should be pipe

  getUserDetails(): Promise<ISessionUser> {
    var curUsrId = this.$jaCache.get("CurrentUserId");
    var root = this.$jaCache.get("CurrentJiraUrl");
    this.$session.rootUrl = root;

    var feedbackUrl = "https://docs.google.com/forms/d/e/1FAIpQLScJvQtHZI_yZr1xd4Z8TwWgvtFss33hW5nJp4gePCgI2ScNvg/viewform?entry.326955045&entry.1696159737&entry.485428648={0}&entry.879531967={1}&entry.1426640786={2}&entry.972533768={3}";
    var prom = [
      this.$jaDataSvc.getCurrentUser().then(null, (e: any) => {
        if (e.status == 401) {
          return Promise.resolve({}); // ToDo: Send the jira user object form cache
        }
        return Promise.reject(e);
      }),
      this.$db.users.get(curUsrId)
    ];

    return Promise.all(prom).then((arr) => {
      var jiraUser = arr[0];
      var currentUser: IUser = arr[1];
      if (!currentUser.settings) { currentUser.settings = {}; }

      var settings = {
        page_dashboard: currentUser.settings.page_dashboard,
        page_calendar: currentUser.settings.page_calendar,
        page_reports_UserDayWise: currentUser.settings.page_reports_UserDayWise
      };

      var gridList = (settings.page_dashboard || {}).gridList;
      if (gridList && gridList.length > 0) {
        var converter = {
          'myTickets': 'myOpenTickets', 'bookmarksList': 'myBookmarks', 'dtWiseWL': 'dateWiseWorklog',
          'pendingWL': 'pendingWorklog', 'ticketWiseWL': 'ticketWiseWorklog', 'savedQuery': 'myFilters'
        };
        gridList = gridList.Select(g => converter[g] || g);
      }
      else { gridList = ['myOpenTickets', 'myBookmarks', 'dateWiseWorklog', 'pendingWorklog']; }

      //this.$session.userId = curUsrId;
      //this.$session.authTokken = currentUser.dataStore;
      var sessionUser: ISessionUser = {
        userId: currentUser.id,
        jiraUser: jiraUser,
        displayName: jiraUser.displayName || "(not available)",
        name: jiraUser.name,
        emailAddress: jiraUser.emailAddress || "(not available)",
        dateFormat: currentUser.dateFormat || dateFormats[0],
        timeFormat: currentUser.timeFormat || timeFormats[0],
        workingDays: currentUser.workingDays || [1, 2, 3, 4, 5],
        startOfDay: currentUser.startOfDay || "10:00",
        endOfDay: currentUser.endOfDay || "19:00",
        notifyWL: currentUser.notifyWL,
        jiraUrl: currentUser.jiraUrl,
        ticketViewUrl: currentUser.jiraUrl + "/browse/",
        profileUrl: currentUser.jiraUrl + "/secure/ViewProfile.jspa",
        maxHours: currentUser.maxHours || 8,
        meetingTicket: currentUser.meetingTicket,
        team: currentUser.team || [],
        projects: currentUser.projects,
        rapidViews: currentUser.rapidViews,
        settings: settings,
        gIntegration: currentUser.googleIntegration,
        hasGoogleCreds: currentUser.dataStore != null,
        feedbackUrl: feedbackUrl + "&embedded=true",
        dashboards: currentUser.dashboards || [{
          isQuickView: true, layout: 1, name: 'Default', icon: 'fa fa-tachometer',
          widgets: gridList.Select(g => { return { name: g } })
        }]
      };

      return sessionUser;
    });
  }

  getCurrentUser() {
    if (!this.$session.userId) {
      this.$session.userId = this.$jaCache.get("CurrentUserId");
    }
    return this.$db.users.get(this.$session.userId);
  }

  addBookmark(ticketNo: string[]): Promise<string[]> {
    if (ticketNo == null || ticketNo.length == 0) {
      this.message.warning("No ticket number specified to bookmark");
      return Promise.reject("No ticket number specified to bookmark");
    }

    return this.$db.users.get(this.$session.userId).then((u) => {
      var favTickets = u.favTicketList;
      if (!favTickets) {
        favTickets = [];
      }

      var pending = ticketNo.Where((t) => { return !favTickets.Any((k) => { return k.toUpperCase() == t.toUpperCase(); }) });
      if (pending.length == 0) {
        this.message.warning(ticketNo.length === 1 ? ticketNo[0] + " is already bookmarked" : "The specified ticket is already bookmarked");
        return [];
      }

      return this.getTicketDetails(pending, true).then((issues: any[]) => {
        if (issues == null || issues.length == 0) {
          return ticketNo;
        }

        favTickets.AddRange(issues.Select((i) => { return i.key; }));
        u.favTicketList = favTickets;
        return this.$db.users.put(u).then(
          () => { return ticketNo.Where((t) => { return !favTickets.Any((k) => { return k.toUpperCase() == t.toUpperCase(); }); }); }
        );
      });
    });
  }

  removeBookmark(tickets: any) {
    if (typeof (tickets) === 'string') { tickets = [tickets]; }
    return this.$db.users.get(this.$session.userId).then((u) => {
      var favTickets = u.favTicketList;
      if (!favTickets) {
        favTickets = [];
      }
      favTickets.RemoveAll(tickets);
      u.favTicketList = favTickets;
      return this.$db.users.put(u).then(() => { return this.getBookmarks() });
    });
  }

  getBookmarks() {
    return this.$db.users.get(this.$session.userId).then((u) => {
      var tickets = u.favTicketList;
      if (tickets && tickets.length > 0) {
        return this.getTicketDetails(tickets, true).then((tickets: any[]) => {
          return tickets.Select((i) => {
            let fields = i.fields;
            return {
              ticketNo: i.key,
              summary: fields.summary,
              assigneeName: (fields.assignee || "").displayName,
              reporterName: (fields.reporter || "").displayName,
              issuetype: (fields.issuetype || {}).name,
              issuetypeIcon: (fields.issuetype || {}).iconUrl,
              priority: (fields.priority || {}).name,
              priorityIcon: (fields.priority || {}).iconUrl,
              statusIcon: (fields.status || {}).iconUrl,
              status: (fields.status || {}).name,
              resolutionIcon: (fields.resolution || {}).iconUrl,
              resolution: (fields.resolution || {}).name,
              createdDate: fields.created,
              updatedDate: fields.updated
            };
          });
        }, (err) => {
          var msg = ((err.error || {}).errorMessages || [])[0];
          if (msg.indexOf('does not exist')) {
            var bks = tickets.Where(t => msg.indexOf(t) > -1);
            if (bks.length > 0) { return this.removeBookmark(bks); }
          }
        });
      }
      else {
        return [];
      }
    });
  }

  getTicketDetails(tickets: string | string[], asArr?: boolean) {
    if (!tickets) { return null; }
    var onlyOne = false;
    if (typeof tickets === "string") {
      tickets = [tickets];
      onlyOne = true;
    }

    return this.fetchTicketDetails(tickets,
      ["summary", "assignee", "reporter", "priority", "status", "resolution", "created", "updated", "issuetype", "parent"]
    ).then((arr) => {
      var result = {};
      arr.ForEach((t) => {
        this.ticketsCache[t.key.toUpperCase()] = t;
        if (!asArr) { result[t.key] = t; }
      });

      if (onlyOne) { return arr[0]; }

      return asArr ? arr : result;
    });
  }

  fetchTicketDetails(tickets: string[], fields: string[]) {
    var result = [];
    var toFetch = [];

    tickets.ForEach((t) => {
      if (!this.ticketsCache[t]) { toFetch.Add(t); }
      else {
        result.Add(this.ticketsCache[t]);
      }
    });

    if (toFetch.length > 0) {
      var jql = "'" + toFetch.join("', '") + "'";
      jql = "key in (" + jql + ")";
      return this.$jaDataSvc.searchTickets(jql, fields).then((list) => {
        result.AddRange(list); return result;
      });
    }
    else {
      return Promise.resolve(result);
    }
  }

  getPendingWorklogs() {
    return this.$db.worklogs.where("createdBy").equals(this.$session.userId).and((w) => { return !w.isUploaded; }).toArray().then((worklogs) => {
      var keys = worklogs.Distinct((w) => { return w.ticketNo; });
      return this.getTicketDetails(keys).then((tickets) => {
        var wlList = worklogs.Select((w) => {
          var fields = tickets[w.ticketNo.toUpperCase()].fields;
          var data = w as any;
          data.summary = fields.summary;
          data.status = (fields.status || "").name;
          return data;
        });
        return wlList;
      });
    });
  }

  uploadWorklogs(ids) {
    return this.$db.worklogs.where("id").anyOf(ids).toArray().then((worklogs) => {
      return Promise.all(worklogs.Select((wl) => { return this.uploadWorklog(wl); }));
    }).then(res => this.getPendingWorklogs());
  }

  uploadWorklog(entry) {
    var timeSpent = entry.overrideTimeSpent || entry.timeSpent;
    var request = {
      comment: entry.description,
      started: entry.dateStarted.toISOString().replace('Z', '').replace('z', '') + "+0000",// + "+0530",//"2016-03-23T10:00:00.932+0530"
      timeSpent: this.formatTs.transform(timeSpent) //,
      //visibility = new Visibility { type="group", value= "Deployment Team" }
    };

    var url = (entry.worklogId > 0) ? ApiUrls.individualWorklog : ApiUrls.issueWorklog;

    var uploadRequest: Promise<any> = null;

    if (entry.worklogId > 0) { uploadRequest = this.$jaHttp.put(url, request, entry.ticketNo, entry.worklogId) }
    else { uploadRequest = this.$jaHttp.post(url, request, entry.ticketNo, entry.worklogId || 0) }

    return uploadRequest.then((result) => {
      entry.worklogId = result.id;
      entry.isUploaded = true;
      entry.timeSpent = timeSpent;
      delete entry.overrideTimeSpent;
      return this.$db.worklogs.put(entry);
    }, (err) => {
      if (err.status === 400) {
        var errors = (err.error || {}).errorMessages || [];
        if (errors.Any((e: string) => e.indexOf("non-editable") > -1)) {
          return Promise.reject({ message: entry.ticketNo + " is already closed and cannot upload worklog" });
        }
        else return err;
      }
    });
  }

  deleteWorklogs(ids: any[]) {
    var reqArr: any[] = [];
    return this.$db.worklogs.where("id").anyOf(ids).toArray().then((wls) => {
      wls.ForEach((entry) => {
        if (entry.worklogId > 0) {
          reqArr.Add(this.$jaHttp.delete(ApiUrls.individualWorklog, entry.ticketNo, entry.worklogId).then(() => { return this.$db.worklogs.where("id").equals(entry.id).delete(); }));
        }
        else {
          reqArr.Add(this.$db.worklogs.where("id").equals(entry.id).delete());
        }
      });

      return Promise.all(reqArr);
    });
  }

  deleteWorklogsBefore(date) {
    return this.$db.worklogs.where("dateStarted").below(date).delete();
  }

  deleteSavedQuery(ids) { return this.$db.savedFilters.where("id").anyOf(ids).delete(); }

  getWorklogs(range) {
    var prom: Promise<any> = this.$db.worklogs.where("dateStarted").between(moment(range.fromDate).toDate(), moment(range.toDate).endOf('day').toDate(), true, true)
      .and((w) => { return w.createdBy === this.$session.userId; }).toArray();
    if (range.dateWise === true) { prom = prom.then(d => this.getDWWorklog(d)); }
    else if (range.dateWise === false) { prom = prom.then(d => this.getTWWorklog(d)); }
    return prom;
  }

  getSavedFilters() {
    return this.$db.savedFilters.where("createdBy").equals(this.$session.userId).toArray()
      .then((qrys) => {
        return qrys.Select((q) => {
          return {
            id: q.id,
            queryName: q.queryName,
            isEnabled: q.isEnabled,
            dateCreated: q.dateCreated,
            filtersCount: q.filterFields.length,
            outputCount: q.outputFields.length
          };
        });
      });
  }

  getSavedQuery(id) { return this.$db.savedFilters.where("id").equals(parseInt(id)).first(); }

  toggleQuery(queryId, enabled) {
    return this.$db.savedFilters.where("id").equals(queryId).first().then((e) => { e.isEnabled = enabled; return this.$db.savedFilters.put(e); });
  }

  // ToDo
  //toggleEvent(eventId, enabled) {
  //  return this.$db.events.where("id").equals(eventId).first().then((e) => { e.isEnabled = enabled; return this.$db.events.put(e); });
  //}

  //getEvents() { return this.$db.events.where("createdBy").equals(this.$session.userId).toArray(); }

  saveSettings(pageName: string) {
    return this.getCurrentUser().then((usr) => {
      if (!usr.settings) { usr.settings = {}; }

      usr.settings["page_" + pageName] = this.$session.pageSettings[pageName];
      return this.$db.users.put(usr).then(r => r);
    });
  }

  getWorklogsEntry(start, end) {
    return this.getWorklogs({ fromDate: start.toDate(), toDate: end.toDate() })
      .then((worklogs) => {
        var result = worklogs.Select(w => this.getWLCalendarEntry(w));
        return result;
      });
  }

  copyWorklog(worklogId, startDate) {
    return this.$db.worklogs.where("id").equals(worklogId).first().then((wl) => {
      wl.dateStarted = moment(startDate).toDate();
      delete wl.id;
      delete wl.isUploaded;
      delete wl.worklogId;
      delete wl.parentId;
      return this.$db.worklogs.add(wl).then((id) => { wl.id = id; return this.getWLCalendarEntry(wl); });
    });
  }

  changeWorklogDate(worklogId, startDate) {
    return this.$db.worklogs.where("id").equals(worklogId).first().then((wl) => {
      wl.dateStarted = moment(startDate).toDate();
      var getCalEntry = () => { return this.getWLCalendarEntry(wl); };
      if (wl.worklogId > 0) {
        return this.uploadWorklog(wl).then(getCalEntry);
      } else { return this.$db.worklogs.put(wl).then(getCalEntry); }
    });
  }

  changeWorklogTS(worklogId, timeSpent) {
    return this.$db.worklogs.where("id").equals(worklogId).first().then((wl) => {
      wl.timeSpent = timeSpent;
      delete wl.overrideTimeSpent;
      var getCalEntry = () => { return this.getWLCalendarEntry(wl); };
      if (wl.worklogId > 0) {
        return this.uploadWorklog(wl).then(getCalEntry);
      } else { return this.$db.worklogs.put(wl).then(getCalEntry); }
    });
  }

  getWorklog(worklogId) { return this.$db.worklogs.where("id").equals(parseInt(worklogId)).first(); }

  saveWorklog(worklog) {
    return this.getTicketDetails(worklog.ticketNo).then((ticket) => {
      if (!ticket) {
        this.message.error(worklog.ticketNo + " is not a valid Jira Key");
        return Promise.reject(worklog.ticketNo + " is not a valid Jira Key");
      }
      if (ticket.fields.status.name.toLowerCase() === "closed") {
        this.message.error(worklog.ticketNo + " is already closed. Cannot add worklog for closed ticket!");
        return Promise.reject(worklog.ticketNo + " is already closed. Cannot add worklog for closed ticket!");
      }
      var wl: any = {
        createdBy: this.$session.userId,
        dateStarted: moment(worklog.dateStarted).toDate(),
        ticketNo: ticket.key,
        description: worklog.description
      };

      if (worklog.id) { wl.id = worklog.id; }
      if (worklog.isUploaded) { wl.isUploaded = worklog.isUploaded; }
      if (worklog.worklogId) { wl.worklogId = worklog.worklogId; }
      if (worklog.timeSpent) { wl.timeSpent = worklog.timeSpent; }
      if (worklog.overrideTimeSpent) { wl.overrideTimeSpent = worklog.overrideTimeSpent; }
      if (worklog.parentId) { wl.parentId = worklog.parentId; }

      worklog = wl;
      if (worklog.id > 0) {
        return this.$db.worklogs.put(worklog).then(() => { return this.getWLCalendarEntry(worklog); });
      } else {
        return this.$db.worklogs.add(worklog).then((id) => { worklog.id = id; return this.getWLCalendarEntry(worklog); });
      }
    }, (err) => { console.log("error for ticket number", err); return Promise.reject(err); });
  }

  saveQuery(query) {
    query.createdBy = this.$session.userId;
    query.dateCreated = new Date();
    var existingQry = this.$db.savedFilters.where("queryName").equals(query.queryName);
    if (query.id > 0) {
      return existingQry.and((q) => { return q.createdBy === this.$session.userId && query.id != q.id; })
        .first()
        .then((qry) => {
          if (qry) { return Promise.reject({ message: 'The query with the name "' + query.queryName + '" already exists!' }); }
          else { return this.$db.savedFilters.put(query).then(() => { return query.id; }); }
        });
    } else {
      return existingQry.and((q) => { return q.createdBy === this.$session.userId; })
        .first()
        .then((qry) => {
          if (qry) { return Promise.reject({ message: 'The query with the name "' + query.queryName + '" already exists!' }); }
          else { return this.$db.savedFilters.add(query).then((newQueryId) => { return newQueryId; }); }
        });
    }
  }

  updateAuthCode(authCode) {
    return this.$db.users.get(this.$session.userId).then((u) => {
      u.dataStore = authCode;
      return this.$db.users.put(u).then(() => { return true; });
    });
  }

  getUserSettings() {
    return this.getCurrentUser().then((user) => {
      var settings = {
        teamMembers: user.team || [],
        autoUpload: user.autoUpload,
        dateFormat: user.dateFormat,
        maxHours: user.maxHours,
        workingDays: user.workingDays || [1, 2, 3, 4, 5],
        taskLogEnabled: user.taskLogEnabled,
        timeFormat: user.timeFormat,
        uploadLogBy: user.uploadLogBy,
        meetingTicket: user.meetingTicket,

        googleIntegration: user.googleIntegration,
        autoLaunch: user.autoLaunch,
        notifyBefore: user.notifyBefore,
        checkUpdates: user.checkUpdates,
        hasGoogleCredentials: user.dataStore != null,
        pruneInterval: (user.pruneInterval || 4).toString(),

        trackBrowser: user.trackBrowser,
        startOfDay: user.startOfDay || "10:00",
        endOfDay: user.endOfDay || "19:00",

        launchAction: user.launchAction,
        rapidViews: user.rapidViews,
        projects: user.projects,

        highlightVariance: user.highlightVariance,
        notifyWL: user.notifyWL || (user.notifyWL == null ? true : false)
      };
      if (settings.launchAction && user.dashboards) {
        var idx = user.dashboards.indexOf(user.dashboards.First(d => d.isQuickView));
        settings.launchAction.quickIndex = 'D-' + idx;
      }
      var curDate = new Date();
      return {
        settings: settings,
        dateFormats: dateFormats.Select((f) => { return { value: f, text: this.$jaUtils.formatDate(curDate, f) }; }),
        timeFormats: timeFormats.Select((f) => { return { value: f, text: this.$jaUtils.formatDate(curDate, f) }; })
      };
    });
  }

  saveUserSettings(settings) {
    return this.$db.users.get(this.$session.userId).then((user) => {
      user.team = settings.teamMembers;
      user.autoUpload = settings.autoUpload;
      user.dateFormat = settings.dateFormat;
      user.maxHours = settings.maxHours;
      user.taskLogEnabled = settings.taskLogEnabled;
      user.timeFormat = settings.timeFormat;
      user.workingDays = settings.workingDays;
      user.uploadLogBy = settings.uploadLogBy;
      user.googleIntegration = settings.googleIntegration;
      user.notifyWL = settings.notifyWL;
      user.meetingTicket = settings.meetingTicket;
      user.pruneInterval = parseInt(settings.pruneInterval || 4);
      user.trackBrowser = settings.trackBrowser;
      user.startOfDay = settings.startOfDay;
      user.endOfDay = settings.endOfDay;
      user.highlightVariance = settings.highlightVariance;
      user.launchAction = settings.launchAction;

      if (user.launchAction && user.launchAction.action == 3) {
        var idx = parseInt((user.launchAction.quickIndex || '0').replace('D-', '')) || 0;
        delete user.launchAction.quickIndex;
        user.dashboards.ForEach((dboard, i) => dboard.isQuickView = i === idx);
      }

      if (!settings.hasGoogleCredentials && user.dataStore) {
        var tokken = user.dataStore.access_token;
        if (tokken) {
          this.$jaHttp.get(ApiUrls.googleLogoutUrl, tokken).then((response) => {
            this.$jaBrowserExtn.removeAuthTokken(tokken);
          });
        }
        delete user.dataStore;
      }

      if (settings.rapidViews && settings.rapidViews.length > 0) {
        user.rapidViews = settings.rapidViews;
      }
      else { delete user.rapidViews; }

      if (settings.projects && settings.projects.length > 0) {
        user.projects = settings.projects;
      }
      else { delete user.projects; }

      var autoLaunch = parseInt(settings.autoLaunch);
      if (autoLaunch > 0) {
        user.autoLaunch = autoLaunch;
      }
      else { delete user.autoLaunch; }

      var notifyBefore = parseInt(settings.notifyBefore);
      if (notifyBefore > 0) {
        user.notifyBefore = notifyBefore;
      }
      else { delete user.notifyBefore; }

      var checkUpdates = parseInt(settings.checkUpdates);
      if (checkUpdates > 0) {
        user.checkUpdates = checkUpdates;
      }
      else { delete user.checkUpdates; }

      user.timeFormat = settings.timeFormat;

      return this.$db.users.put(user).then(() => { this.message.success("Settings saved successfully!"); return this.getUserSettings(); });
    });
  }

  getWLCalendarEntry(worklog) {
    var obj: any = {
      entryType: 1,
      start: worklog.dateStarted,
      title: worklog.ticketNo + ": " + worklog.description,
      id: worklog.id.toString(),
      url: "", // ToDo: Need to update jira url
      end: moment(worklog.dateStarted).add(this.getTimeSpent(worklog), "minutes").toDate(),
      editable: true,
      sourceObject: worklog
    };
    if (worklog.parentId) {
      obj.parentId = worklog.parentId;
    }
    return obj;
  }

  getTimeSpent(entry: IWorklog | string, ticks?): number {
    if (!entry) { return 0; }
    var timeSpent = (typeof entry === 'string') ? entry : (entry.overrideTimeSpent || entry.timeSpent);
    var tmp = timeSpent.replace(" ", "0").split(':');
    if (tmp.length === 2)
      return ((parseInt("0" + tmp[0]) * 60) + parseInt("0" + tmp[1])) * (ticks ? 60 * 1000 : 1);
    else return 0;
  }

  getDWWorklog(data: IWorklog[]) {
    var entries = data.GroupBy((l) => { return l.dateStarted.format("yyyy-MM-dd"); }).Select((l) => {
      var $values = l.values;
      return {
        dateLogged: l.key,
        difference: 0,
        uploaded: $values.Where((d) => d.isUploaded).Sum(t => this.getTimeSpent(t)) * 60 * 1000,
        pendingUpload: $values.Where((d) => !d.isUploaded).Sum(tkt => this.getTimeSpent(tkt)) * 60 * 1000,
        totalHours: $values.Sum(t => this.getTimeSpent(t)) * 60 * 1000,
        ticketList: $values.Select((d) => { return { id: d.id, ticketNo: d.ticketNo, uploaded: (d.overrideTimeSpent || d.timeSpent), comment: d.description, worklogId: d.worklogId }; })
      };
    }).OrderByDescending((l) => { return l.dateLogged; });
    var maxHours = this.$session.CurrentUser.maxHours;
    maxHours = maxHours * 60 * 60 * 1000;
    entries.ForEach((d) => {
      //d.pendingUpload = d.totalHours - d.uploaded;
      if (maxHours != null && maxHours > 0) {
        var diff = d.totalHours - maxHours;
        if (diff != 0) {
          d.difference = diff;
        }
      }
    });
    return entries;
  }

  getTWWorklog(data) {
    var $data = data;
    return this.getTicketDetails($data.Distinct((w) => { return w.ticketNo; })).then((tickets) => {
      var entries = $data.GroupBy((l) => { return l.ticketNo; }).Select((l) => {
        var t = tickets[l.key];
        var item: any = {
          ticketNo: l.key,
          parentSumm: ((t.fields.parent || "").fields || "").summary,
          parentKey: ((t.fields || "").parent || "").key,
          summary: t.fields.summary,
          status: (t.fields.status || "").name,
          uploaded: l.values.Where((d) => { return d.isUploaded }).Sum(this.getTimeSpent) * 60 * 1000,
          totalHours: l.values.Sum(this.getTimeSpent) * 60 * 1000,
          logData: l.values.Select((d) => {
            return {
              id: d.id, dateLogged: d.dateStarted, uploaded: (d.overrideTimeSpent || d.timeSpent), worklogId: d.worklogId
            };
          })
        };
        item.pendingUpload = item.totalHours - item.uploaded;
        return item;
      }).OrderBy((d) => { return d.ticketNo; });

      return entries;
    });
  }

  getUserGroups() {
    return this.getCurrentUser().then(u => {
      var groups = u.groups;

      if (!groups && u.team && u.team.length > 0) {
        groups = [{ name: 'My Team', users: u.team }];
      }

      return groups;
    }
    );
  }

  saveUserGroups(groups: any[]) {
    return this.getCurrentUser().then(u => {
      u.groups = groups;
      return this.$db.users.put(u);
    });
  }

  getTicketSuggestion(): Promise<IValueLabel[]> {
    return Promise.all([
      this.getBookmarks(),
      this.$jaDataSvc.getOpenTickets()
    ]).then((result) => {
      return result[1].Select((t) => { return { value: t.key, label: t.key + " - " + t.fields.summary }; })
        .AddRange(result[0].Select((t) => { return { value: t.ticketNo, label: t.ticketNo + " - " + t.summary }; }));
    });
  }

  authenticate(): Promise<any> {
    return this.getUserDetails().then(userDetails => {
      //Temp code: Need to be removed once old UI is removed
      this.$jaCache.set("useNewUI", true);

      this.$session.CurrentUser = userDetails;
      this.$session.userId = userDetails.userId;
      //ToDo:

      var settings = userDetails.settings;
      this.$session.pageSettings = {
        dashboard: this.parseIfJson(settings.page_dashboard,
          {
            viewMode: 0,
            gridList: ["myTickets", "bookmarksList", "dtWiseWL", "pendingWL"]
          }),
        calendar: this.parseIfJson(settings.page_calendar, {
          viewMode: 'agendaWeek',
          showWorklogs: true,
          showMeetings: true,
          showInfo: true,
          eventColor: '#51b749',
          worklogColor: '#9a9cff',
          infoColor_valid: '#3a87ad',
          infoColor_less: '#f0d44f',
          infoColor_high: '#f06262'
        }),
        reports_UserDayWise: this.parseIfJson(settings.page_reports_UserDayWise, { logFormat: '1', breakupMode: '1', groupMode: '1' })
      };

      if (userDetails.dashboards) { updateDashboard(userDetails.dashboards) }

      var lastVisisted = this.$jaCache.get("LV");
      if (lastVisisted) {
        lastVisisted = moment(lastVisisted);
        if (moment().startOf('day').isAfter(lastVisisted)) {
          this.$jaCache.set("LastVisited", lastVisisted.toDate());
        }
      }
      this.$jaCache.set("LV", new Date());
      if (this.$jaCache.get("SideBarToggled")) {
        // $('body').addClass('sidebar-collapse'); // ToDo:
      }
    });
  }

  private parseIfJson(json, dflt): any {
    if (json) {
      if (typeof json === "string") {
        return JSON.parse(json);
      }
      else { return json; }
    }
    else {
      return dflt;
    }
  }
}
