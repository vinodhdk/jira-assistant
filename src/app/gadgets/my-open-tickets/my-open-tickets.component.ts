import { Component, OnInit, ElementRef } from '@angular/core';
import { JiraService } from '../../services/jira.service';
import { FacadeService } from '../../services/facade.service';
import { BaseGadget, GadgetActionType } from '../base-gadget';
//import { MenuItem } from 'primeng/api';

@Component({
  selector: '[myOpenTickets]',
  templateUrl: './my-open-tickets.component.html'
})
export class MyOpenTicketsComponent extends BaseGadget implements OnInit {
  ticketsList: any[]
  isLoading: boolean
  contextMenu: any[]//MenuItem
  selectedTicket: any
  dateRange: any

  constructor(private $jaDataSvc: JiraService, private $facade: FacadeService, el: ElementRef) {
    super(el, "My open tickets", "fa-eye");
    this.fillOpenTickets();
    this.contextMenu = [
      { label: "Add worklog", icon: "fa-clock-o", command: () => this.addWorklogOn(this.selectedTicket.ticketNo) },
      { label: "Bookmark", icon: "fa-bookmark", command: () => this.addBookmark() }
      //{ label: "Start progress", icon: "fa-play", command: () => this.startProgress() } //ToDo: Add option for move to progress, show in tree view
    ];
  }

  ngOnInit() {
  }

  fillOpenTickets(refresh?: boolean): void {
    this.isLoading = true;
    this.$jaDataSvc.getOpenTickets(refresh)
      .then((result) => {
        this.ticketsList = result.Select(t => {
          var fields = t.fields;
          return {
            ticketNo: t.key,
            issuetypeIcon: (fields.issuetype || {}).iconUrl,
            issuetype: (fields.issuetype || {}).name,
            summary: fields.summary,
            reporter: fields.reporter.displayName,
            priorityIcon: (fields.priority || {}).iconUrl,
            priority: (fields.priority || {}).name,
            statusIcon: (fields.status || {}).iconUrl,
            status: (fields.status || {}).name,
            resolutionIcon: (fields.resolution || {}).iconUrl,
            resolution: (fields.resolution || {}).name,
            created: fields.created,
            updated: fields.updated
          };
        });
        this.isLoading = false;
      })
  }

  showContext($event: any, b: any, menu: any): any {
    this.selectedTicket = b;
    menu.toggle($event);
  }

  startProgress() { alert("This functionality is not yet implemented!"); }

  addBookmark() {
    this.$facade.addBookmark([this.selectedTicket.ticketNo])
      .then((result) => {
        //if (result.length > 0) {
        //}
        this.onAction.emit({ type: GadgetActionType.TicketBookmarked });
      });
  }
}
