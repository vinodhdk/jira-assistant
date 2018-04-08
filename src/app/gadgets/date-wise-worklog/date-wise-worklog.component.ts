import { Component, OnInit, ElementRef } from '@angular/core';
import { FacadeService, UtilsService } from '../../services/index';
import { BaseGadget, GadgetAction, GadgetActionType } from '../base-gadget';
import { DataTransformService } from '../../services/data-transform.service';
import * as moment from 'moment'

@Component({
  selector: '[dateWiseWorklog]',
  templateUrl: './date-wise-worklog.component.html'
})
export class DateWiseWorklogComponent extends BaseGadget {

  worklogs_DW: any[]
  isLoading: boolean
  contextMenu: any[]//MenuItem
  selectedDay: any
  dateRange: any

  constructor(private $jaFacade: FacadeService, private $jaUtils: UtilsService, private $transform: DataTransformService, el: ElementRef) {
    super(el);
    this.dateRange = {};
    this.fillWorklogs();
    this.contextMenu = [
      { label: "Upload worklog", icon: "fa-clock-o", command: () => this.uploadWorklog() },
      { label: "Add worklog", icon: "fa-bookmark", command: () => this.addWorklog() } //ToDo: Add option for move to progress, show in tree view
    ];
  }

  fillWorklogs(): void {
    var selDate = this.dateRange;
    if (!selDate || !selDate.fromDate) { return; }
    this.isLoading = true;
    selDate.dateWise = true;
    this.$jaFacade.getWorklogs(selDate).then((result) => { this.worklogs_DW = result; this.isLoading = false; });
  }

  getWorklogUrl(ticketNo: string, worklogId: number): string {
    return this.$jaUtils.getWorklogUrl(ticketNo, worklogId);
  }

  showContext($event: any, b: any, menu: any): any {
    this.selectedDay = b;
    menu.toggle($event);
  }

  dateSelected($event: any): void {
    this.fillWorklogs();
  }

  getRowStatus(d) {
    return this.$jaUtils.getRowStatus(d);
  }

  uploadWorklog() {
    var toUpload = this.selectedDay.ticketList.Where(t => !t.worklogId).Select(t => t.id)
    if (toUpload.length == 0) { return; }
    this.isLoading = true;
    this.$jaFacade.uploadWorklogs(toUpload).then(() => this.fillWorklogs(), (err) => { this.isLoading = false; });
  }

  addWorklog() {
    var date = moment(this.selectedDay.dateLogged).toDate();
    var hrsRemaining = null;
    if (this.selectedDay.pendingUpload > 0) {
      hrsRemaining = this.$transform.formatTs(this.selectedDay.pendingUpload, true);
    }
    super.addWorklog({ startTime: date, timeSpent: hrsRemaining, allowOverride: hrsRemaining ? true : false });
  }

  executeEvent(action: GadgetAction) {
    if (action.type == GadgetActionType.AddWorklog || action.type == GadgetActionType.DeletedWorklog || action.type == GadgetActionType.WorklogModified) {
      this.fillWorklogs();
    }
    else {
      super.executeEvent(action);
    }
  }
}
