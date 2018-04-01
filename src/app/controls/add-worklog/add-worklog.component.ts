import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { FacadeService } from '../../services/facade.service';
import { FormatDateTimePipe } from '../../pipes/index';
import { IValueLabel } from '../../common/interfaces';

@Component({
  selector: 'add-worklog',
  templateUrl: './add-worklog.component.html'
})
export class AddWorklogComponent implements OnInit {
  vald: any
  ctlClass: any

  @Input()
  worklogItem: any

  log: any

  displayDateFormat = "yyyy-MM-dd HH:mm";
  loading: boolean
  allTicketList: IValueLabel[]
  ticketList: IValueLabel[]

  @Input()
  showPopup: boolean

  @Output()
  onDone: EventEmitter<any>

  constructor(private $jaFacade: FacadeService, private fdt: FormatDateTimePipe, private cd: ChangeDetectorRef) {
    this.vald = {};
    this.ctlClass = {};
    this.log = {};
    this.onDone = new EventEmitter<any>();
  }

  ngOnInit() {
    return this.$jaFacade.getTicketSuggestion().then(u => {
      this.allTicketList = u;
    });
  }

  ngOnChanges(changes) {
    if (changes) {
      if (changes.worklogItem && changes.worklogItem.currentValue) {
        var obj = changes.worklogItem.currentValue;
        if (obj.id) {
          var pro = this.fillWorklog(obj.id);
          if (obj.copy) {
            pro.then(d => {
              delete d.id;
              d.dateStarted = new Date();
            });
          }
        }
        else {
          this.log.ticketNo = { value: obj.ticketNo };
          this.log.dateStarted = obj.startTime || new Date();
          this.log.allowOverride = obj.allowOverride;
          if (this.log.allowOverride) {
            this.log.overrideTimeSpent = obj.timeSpent;
          }
        }
      }
    }
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  searchTickets($event) {
    var query = ($event.query || "").toLowerCase();
    this.ticketList = this.allTicketList.Where(t => t.value.toLowerCase().indexOf(query) > -1 || t.label.toLowerCase().indexOf(query) > -1);
  }

  //this.$watch("logJson",  (newVal)=> {
  //  if (!newVal) return;
  //  var obj = JSON.parse(newVal);

  //  obj.dateStarted = formatDateTime(moment(obj.dateStarted).toDate(), displayDateFormat);
  //  this.log = obj;
  //});

  fillWorklog(worklogId: number) {
    return this.$jaFacade.getWorklog(worklogId).then((d: any) => {
      d.ticketNo = { value: d.ticketNo };
      if (d.timeSpent) {
        d.timeSpent = d.timeSpent.substring(0, 5);
        if (d.timeSpent === "00:00") d.timeSpent = null;
      }
      if (d.overrideTimeSpent) {
        d.overrideTimeSpent = d.overrideTimeSpent.substring(0, 5);
        d.allowOverride = true;
      }
      this.log = d;
      return d;
    });
  }

  validateData(log, vald) {
    if (log.allowOverride)
      log.overrideTimeSpent = log.overrideTimeSpent || log.timeSpent || "1:00";

    var validation = true;
    var ticketNo = this.getTicketNo(log);

    validation = (vald.ticketNo = !(!ticketNo || ticketNo.length < 3)) && validation;

    validation = (vald.dateStarted = !(!log.dateStarted || log.dateStarted.length < 16)) && validation;

    vald.overrideTimeSpent = (log.allowOverride && log.overrideTimeSpent && log.overrideTimeSpent.length >= 4);

    validation = (vald.overrideTimeSpent = vald.overrideTimeSpent || (!log.allowOverride && log.timeSpent && log.timeSpent.length >= 4)) && validation;

    validation = (vald.description = !(!log.description || log.description.length < 5)) && validation;

    this.ctlClass.ticketNo = !this.vald.ticketNo ? 'is-invalid' : 'is-valid';
    this.ctlClass.dateStarted = !this.vald.dateStarted ? 'is-invalid' : 'is-valid';
    this.ctlClass.overrideTimeSpent = !this.vald.overrideTimeSpent ? 'is-invalid' : 'is-valid';
    this.ctlClass.description = !this.vald.description ? 'is-invalid' : 'is-valid';

    return validation;
  }

  saveWorklog(worklog, vald) {
    if (!this.validateData(worklog, vald)) { return false; }
    this.loading = true;

    this.$jaFacade.saveWorklog({
      ticketNo: this.getTicketNo(worklog),
      dateStarted: worklog.dateStarted,
      overrideTimeSpent: worklog.overrideTimeSpent,
      description: worklog.description,
      worklogId: worklog.worklogId,
      isUploaded: worklog.isUploaded,
      timeSpent: worklog.timeSpent,
      parentId: worklog.parentId,
      id: worklog.id
    }).then((result) => {
      this.loading = false;
      this.showPopup = false;
      this.onDone.emit(worklog.id > 0 ? { edited: result } : { added: result });
    });
  }

  private getTicketNo(worklog): string {
    if (!worklog || !worklog.ticketNo) { return null; }
    return worklog.ticketNo.value || worklog.ticketNo;
  }

  deleteWorklog(log) {
    this.loading = true;
    this.$jaFacade.deleteWorklogs([log.id]).then((result) => {
      this.onDone.emit({ removed: log.id });
      this.loading = false;
      this.showPopup = false;
    });
  }

  modelOnDone($event) {
    this.onDone.emit({ closed: true });
  }
}
