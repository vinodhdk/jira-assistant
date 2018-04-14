import { Component, OnChanges, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { SessionService, FacadeService, MessageService, AnalyticsService, CalendarService } from '../../services/index';
import { ISessionUser } from '../../common/interfaces';
import * as moment from 'moment';
import * as $ from 'jquery';
import { FormatSecsPipe } from '../../pipes/format-secs.pipe';
import { BaseGadget, GadgetAction, GadgetActionType } from '../base-gadget';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: '[jaCalendar]',
  templateUrl: './calendar.component.html'
})
export class CalendarComponent extends BaseGadget implements OnChanges {
  settings: any
  showSettings: boolean
  fullCalendarOpts: any
  events: CalendarEvents[]
  //defaultView: string //
  startOfDay: string
  endOfDay: string
  businessHours: any
  CurrentUser: ISessionUser
  maxHours: number
  maxTime: number

  isLoading: boolean

  viewModes: any[]
  @Input()
  viewMode: any

  dateRangeTitle: string
  showAddWorklogPopup: boolean

  worklogItem: any

  startDate: any
  endDate: any

  latestData: any[];
  useOldData: boolean;
  hasCalendarData: boolean;

  @ViewChild('calendar')
  calendar: any

  @ViewChild('menu')
  contextMenu: any
  contextMenuItems: any[]
  currentWLItem: any

  constructor(private $session: SessionService, private $jaFacade: FacadeService, private message: MessageService,
    private $jaAnalytics: AnalyticsService, private $jaCalendar: CalendarService, private $formatSecs: FormatSecsPipe,
    el: ElementRef) {
    super(el);
    this.viewModes = [{ value: 'month', label: 'Month' }, { value: 'agendaWeek', label: 'Week' }, { value: 'agendaDay', label: 'Day' }];
    this.settings = this.$session.pageSettings.calendar || { viewMode: 'agendaWeek', showMeetings: true, showWorklogs: true, showInfo: true };

    this.contextMenuItems = [
      { label: "Edit worklog", icon: "fa-edit", command: () => this.showWorklogPopup({ id: this.currentWLItem.id }) },
      { label: "Copy worklog", icon: "fa-copy", command: () => this.copyWorklog() },
      { label: "Upload worklog", icon: "fa-upload", command: () => this.uploadWorklog() },
      { label: "Delete worklog", icon: "fa-times", command: () => this.deleteWorklog() }
    ];

    this.fullCalendarOpts = {
      displayEventTime: true, selectable: true, selectHelper: true, timezone: 'local',
      select: (start, end, jsEvent) => this.select(start, end, jsEvent),
      eventRender: (event, element, view) => this.eventRender(event, element, view)
    };
    this.CurrentUser = $session.CurrentUser;
    //this.defaultView = this.settings.viewMode || "month";
    this.startOfDay = this.CurrentUser.startOfDay || "10:00";//"08:00:00",
    this.endOfDay = this.CurrentUser.endOfDay || "19:00";//"22:00:00",
    this.businessHours = {
      // days of week. an array of zero-based day of week integers (0=Sunday)
      dow: this.$session.CurrentUser.workingDays || [1, 2, 3, 4, 5],
      start: this.CurrentUser.startOfDay || "10:00",
      end: this.CurrentUser.endOfDay || "19:00",
    };


    this.maxTime = this.CurrentUser.maxHours;
    if (this.maxTime) {
      this.maxTime = this.maxTime * 60 * 60;
    }
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.viewMode && change.viewMode.currentValue) {
      this.settings.viewMode = this.viewMode;
      //this.viewModeChanged();
    }
    super.ngOnChanges(change);
  }

  fillCalendar() {
    this.fillEvents(this.startDate, this.endDate);
  }

  viewModeChanged() {
    this.calendar.changeView(this.settings.viewMode);
    this.saveSettings();
  }

  private createWorklog($event, m) {
    if (!m.start.dateTime) { return; }
    $event.stopPropagation();
    $event.preventDefault();

    var mTicket = this.CurrentUser.meetingTicket;
    var diff = moment.duration(moment(m.end.dateTime).diff(m.start.dateTime));
    var obj: any = {
      dateStarted: m.start.dateTime,
      timeSpent: diff.hours().pad(2) + ':' + diff.minutes().pad(2),
      description: m.summary,
      parentId: m.id
    };
    var prom = null;
    if (mTicket) {
      obj.ticketNo = mTicket;
      prom = this.$jaFacade.saveWorklog(obj).then((entry) => { this.addEvent({ added: entry }); return true; });
      this.$jaAnalytics.trackEvent("Quick add WL");
    }
    else {
      prom = this.showWorklogPopup(obj);
    }
    prom.then((result) => { if (result) { $($event.currentTarget).remove(); } });
    return false;
  }

  fillEvents(start, end) {
    var filter = (data) => {
      var types: number[] = [];
      var ps = this.settings;

      if (ps.showMeetings) types.Add(2);
      if (ps.showWorklogs) types.Add(1);
      if (ps.showInfo) types.Add(3);

      switch (types.length) {
        case 0: data = []; break;
        case 3: break;
        default: data = data.Where((e: any) => { return types.indexOf(e.entryType) > -1; }); break;
      }
      this.setColors(data);
      this.events = data;
    }
    if (this.useOldData && this.latestData) {
      filter(this.latestData);
    }
    else {
      var req = [this.$jaFacade.getWorklogsEntry(start, end)];

      if (this.CurrentUser.gIntegration && this.CurrentUser.hasGoogleCreds && this.settings.showMeetings) {
        req.Add(this.$jaCalendar.getEvents(start, end).then((data) => { return data; }, (err) => {
          var msg = "Unable to fetch meetings!";
          if (err.error && err.error.message) {
            msg += "<br /><br />Reason:- " + err.error.message;
          }
          this.message.warning(msg); return [];
        }));
        this.hasCalendarData = true;
      }
      else { this.hasCalendarData = false; }

      Promise.all(req).then((arr) => {
        var data = arr[0];
        var allDayEvents = data.Where((d) => { return d.entryType === 1; })
          .GroupBy((key) => { return moment(key.start).format("YYYY-MM-DD"); })
          .Select((d) => this.getAllDayObj(d));
        this.latestData = data;
        filter(data.AddRange(allDayEvents).AddRange(arr[1]));
      });
    }
    this.useOldData = false;
  }

  private formatSecs(time) { return this.$formatSecs.transform(time); }

  private setLoggedTime(arr, obj) {
    var time = this.getTimeSpent(arr);
    obj.logged = time;
    var title = "Logged: " + this.formatSecs(time);
    obj.diff = time - this.maxTime;
    if (this.maxTime && obj.diff) {
      title += " (" + (obj.diff > 0 ? "+" : "-") + this.formatSecs(Math.abs(obj.diff)) + ")";
    }
    this.setInfoColor(obj, this.settings);
    obj.title = title;
    return obj;
  }

  private setInfoColor(obj, ps) {
    if (this.maxTime && obj.diff) {
      obj.color = obj.diff > 0 ? ps.infoColor_high : ps.infoColor_less;
    }
    else {
      obj.color = ps.infoColor_valid;
    }
    //obj.textColor = "";
  }

  private getTimeSpent(arr) {
    return arr.Sum((v) => {
      var s = moment(v.start);
      var e = moment(v.end);
      var diff = moment.duration(e.diff(s));
      return diff.asSeconds();
    });
  }

  private updateAllDayEvent(result) {
    var key = moment(result.start).format("YYYY-MM-DD");
    this.events.RemoveAll((e) => e.id == key && e.entryType === 3);
    var logs = this.events.Where((a) => { return a.entryType === 1 && moment(a.start).format("YYYY-MM-DD") == key; });
    if (logs && logs.length > 0) {
      var allDayEvent = this.getAllDayObj({ key: key, values: logs });
      if (allDayEvent.logged) {
        this.events.Add(allDayEvent);
        //this.calendar.renderEvent(allDayEvent);
        this.setLoggedTime(logs, allDayEvent);
        //this.calendar.updateEvent(allDayEvent)
      }
    }
    this.performAction(GadgetActionType.WorklogModified);
  }

  private showWorklogPopup(obj) {
    this.showAddWorklogPopup = true;
    if (obj.copy) { this.worklogItem = obj.copy; return; }
    // Load autocomplete data based on bookmarked tickets
    var worklogObj: any = {};

    if (obj.id) {
      worklogObj.id = obj.id;
    }
    else if (obj.parentId) {
      worklogObj = obj;//        modal.element.find("#txtWLJson").val(JSON.stringify(obj)).trigger('change');
    }
    else {
      var diff = moment.duration(obj.end.diff(obj.start));
      worklogObj.timeSpent = diff.hours().pad(2) + ':' + diff.minutes().pad(2);
      worklogObj.startTime = obj.isMonthMode ? moment(obj.start.format("YYYY-MM-DD") + " " + this.CurrentUser.startOfDay, "YYYY-MM-DD HH:mm").toDate() : obj.start.toDate();
      worklogObj.allowOverride = true;
    }
    this.worklogItem = worklogObj;

    //return modal.close.then(addEvent); ToDo:
  }

  addEvent(result) {
    var resp = false;
    if (result.removed) {
      result = this.events.First((e) => { return e.id == result.removed && e.entryType === 1; });
      this.events.Remove(result);
      this.latestData.Remove((e) => { return e.id == result.id && e.entryType === 1; });
    }
    else if (result.added) {
      result = result.added;
      result.color = this.settings.worklogColor; // Set color for newely added worklog
      //this.calendar.removeEvents((e) => { return e.id === result.id && e.entryType === 1; });
      this.latestData.Add(result);
      //this.calendar.renderEvent(result);
      resp = true;
    }
    this.updateAllDayEvent(result);
    return resp;
  }

  private getAllDayObj(d) {
    return this.setLoggedTime(d.values, {
      id: d.key, entryType: 3, start: d.key,
      allDay: true, editable: false
    });
  }

  private setColors(data) {
    var ps = this.settings;
    var wc = ps.worklogColor, ec = ps.eventColor;
    data.ForEach((w) => {
      switch (w.entryType) {
        case 1: w.color = wc; break; // Set color for worklogs
        case 2: w.color = ec; break; // Set color for events
        case 3: this.setInfoColor(w, ps); break; // Set color for info
      }
    });
  }


  select(start, end, jsEvent) {
    var isMonthMode = this.settings.viewMode === "month";
    if (!isMonthMode && !start.hasTime()) { return false; }
    this.showWorklogPopup({ isMonthMode: isMonthMode, start: start, end: end });
    return false;
  }

  showCalendarDetails(event, jsEvent, view) {
    //ToDo : implementation 
  }

  eventClick(calEvent, jsEvent, view) {
    if (calEvent.entryType === 1) { this.showWorklogPopup({ id: calEvent.id }); }
    else { this.showCalendarDetails(calEvent, jsEvent, view); }
    return false;
  }

  //dayClick: function (date) { console.log('dayClick', date.format()); },
  viewRender(view, ele) {
    this.settings.viewMode = view.name;
    this.startDate = view.start;
    this.endDate = view.end;
    this.fillCalendar();
    this.dateRangeTitle = view.title.replace(/[^a-zA-Z0-9, ]+/g, '-');
    $(this.calendar.el.nativeElement).find(".fc-header-toolbar").hide();
  }

  eventDrop(event, delta, revertFunc, jsEvent, ui, view) {
    if (jsEvent.ctrlKey || jsEvent.altKey) {
      revertFunc();
      var eventFromArr: any = this.events.First(e => e.entryType == 1 && e.id == event.sourceObject.id);
      if (eventFromArr) {
        var srcObj = eventFromArr.sourceObject;
        eventFromArr.start = moment(new Date(srcObj.dateStarted)).toDate();
        eventFromArr.end = moment(new Date(srcObj.dateStarted))
          .add(this.$jaFacade.getTimeSpent(srcObj), "minutes").toDate();
        //.add(this.$utils.getTotalSecs(srcObj.overrideTimeSpent || srcObj.timeSpent), 'seconds').toDate();
      }
      this.$jaFacade.copyWorklog(event.sourceObject.id, event.start.format("YYYY-MM-DD HH:mm"))
        .then((result) => { this.addEvent({ added: result }); });
    }
    else {
      this.$jaFacade.changeWorklogDate(event.sourceObject.id, event.start.format("YYYY-MM-DD HH:mm")).then(() => {
        this.updateAllDayEvent({ start: event.sourceObject.dateStarted }); // This is to update the info of previous date
        event.sourceObject.dateStarted = event.start.toDate();
        //var evnt = this.latestData.First((e) => { return e.id === event.id && e.entryType === 1; });
        //evnt.start = event.start.toDate();
        //evnt.end = event.end.toDate();

        this.updateAllDayEvent(event);
      });
    }
  }

  eventResize(event, delta, revertFunc, jsEvent, ui, view) {
    var diff = moment.duration(event.end.diff(event.start));
    this.$jaFacade.changeWorklogTS(event.sourceObject.id, diff.hours().pad(2) + ":" + diff.minutes().pad(2)).then(() => { this.updateAllDayEvent(event); });
  }

  eventRender(event, element, view) {
    if (event.entryType === 1) {
      let w = event.sourceObject;
      let icon = $('<i class="fa fa-ellipsis-v pull-left" title="Show options"></i>')
        .on('click', (e) => { e.stopPropagation(); this.currentWLItem = w; this.contextMenu.hide(); this.contextMenu.toggle(e); });
      element.find(".fc-time").prepend(icon);
      element.bind('contextmenu', (e) => {
        e.stopPropagation(); e.preventDefault(); icon.click();
      });
    }
    else if (event.entryType === 2) {
      if (!this.latestData.Any((e) => { return e.parentId === event.id && e.entryType === 1; })) {

        let m = event.sourceObject;
        var icon = $('<i class="fa fa-clock-o pull-left" title="Create worklog for this meeting"></i>')
          .on('click', (e) => { e.stopPropagation(); this.createWorklog(e, m); });
        element.find(".fc-time").prepend(icon);
        element.bind('contextmenu', (e) => {
          e.stopPropagation(); e.preventDefault(); this.contextMenu.toggle(e);
        });
      }
    }
  }

  uploadWorklog() {
    this.$jaFacade.uploadWorklogs([this.currentWLItem.id])
      .then(() => { return this.$jaFacade.getWorklog(this.currentWLItem.id); })
      .then((wl) => {
        this.message.success("Worklog uploaded successfully!");
        // ToDo: update latestData collection also for is uploaded flag
        this.addEvent({ added: this.$jaFacade.getWLCalendarEntry(wl) });
      });
  }

  deleteWorklog() {
    this.$jaFacade.deleteWorklogs([this.currentWLItem.id]).then(() => { this.addEvent({ removed: this.currentWLItem.id }); });
  }

  copyWorklog() {
    var newObj = Object.create(this.currentWLItem);
    newObj.copy = true;
    this.showWorklogPopup({ copy: newObj });
  }


  executeEvent(action: GadgetAction) {
    if (action.type == GadgetActionType.AddWorklog || action.type == GadgetActionType.DeletedWorklog || action.type == GadgetActionType.WorklogModified) {
      this.fillCalendar();
    }
    else {
      super.executeEvent(action);
    }
  }

  saveSettings() {
    this.fillCalendar();
    this.$jaFacade.saveSettings('calendar');
  }
}

interface CalendarEvents {
  id: string
  entryType: number
  start: Date
  logged: boolean
}
