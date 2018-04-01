import { Component, OnInit, ElementRef } from '@angular/core';
import { FacadeService } from '../../services/facade.service';
import { UtilsService } from '../../services/index';
import { BaseGadget } from '../base-gadget';

@Component({
  selector: '[ticketWiseWorklog]',
  templateUrl: './ticket-wise-worklog.component.html'
})
export class TicketWiseWorklogComponent extends BaseGadget {

  worklogs: any[]
  isLoading: boolean
  contextMenu: any[]//MenuItem
  selectedTicket: any
  dateRange: any
  isFullScreen: boolean

  constructor(private $facade: FacadeService, el: ElementRef, private $jaUtils: UtilsService) {
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
    selDate.dateWise = false;
    this.$facade.getWorklogs(selDate).then((result) => { this.worklogs = result; this.isLoading = false; });
  }

  showContext($event: any, b: any, menu: any): any {
    this.selectedTicket = b;
    menu.toggle($event);
  }

  dateSelected($event): void {
    this.fillWorklogs();
  }

  getTicketUrl(ticketNo: string) { return this.$jaUtils.getTicketUrl(ticketNo); }

  uploadWorklog() { alert("This functionality is not yet implemented!"); }

  addWorklog() { alert("This functionality is not yet implemented!"); }

}
