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
          return {
            ticketNo: t.key,
            issuetypeIcon: t.fields.issuetype.iconUrl,
            issuetype: t.fields.issuetype.name,
            summary: t.fields.summary,
            reporter: t.fields.reporter.displayName,
            priorityIcon: t.fields.priority.iconUrl,
            priority: t.fields.priority.name,
            statusIcon: t.fields.status.iconUrl,
            status: t.fields.status.name,
            resolutionIcon: (t.fields.resolution || {}).iconUrl,
            resolution: (t.fields.resolution || {}).name,
            created: t.fields.created,
            updated: t.fields.updated
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
