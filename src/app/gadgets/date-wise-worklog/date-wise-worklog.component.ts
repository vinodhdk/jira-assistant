import { Component, OnInit, ElementRef } from '@angular/core';
import { FacadeService, UtilsService } from '../../services/index';
import { BaseGadget } from '../base-gadget';

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

  constructor(private $jaFacade: FacadeService, private $jaUtils: UtilsService, el: ElementRef) {
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

  uploadWorklog() { alert("This functionality is not yet implemented!"); }

  addWorklog() { alert("This functionality is not yet implemented!"); }
}
