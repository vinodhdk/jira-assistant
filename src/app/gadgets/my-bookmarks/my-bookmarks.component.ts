import { Component, OnInit, Output, ElementRef } from '@angular/core';
import { FacadeService, JiraService, MessageService, UtilsService } from '../../services/';
import { BaseGadget } from '../base-gadget';

@Component({
  selector: '[myBookmarks]',
  templateUrl: './my-bookmarks.component.html'
})
export class MyBookmarksComponent extends BaseGadget implements OnInit {
  bookmarksList: any[]
  isLoading: boolean
  contextMenu: any[]//MenuItem
  ticketsList: string[]//MenuItem
  selectedTicket: any
  isFullScreen: boolean
  selAllBks: boolean
  showAddPopup: boolean

  constructor(private $jaDataSvc: JiraService, private $facade: FacadeService, private $jaUtils: UtilsService, el: ElementRef, private message: MessageService) {
    super(el);
    this.fillBookmarksList();
    this.contextMenu = [
      { label: "Select Bookmark", icon: "fa-check-square-o", command: () => this.selectedTicket.selected = true },
      { label: "Add worklog", icon: "fa-clock-o", command: () => this.addWorklogOn(this.selectedTicket.ticketNo) },
      { label: "Delete Bookmark", icon: "fa-trash-o", command: () => this.deleteBookmark(this.selectedTicket.ticketNo) } //ToDo: Add option for move to progress, show in tree view
    ];
  }

  ngOnInit() {
  }

  fillBookmarksList(refresh?: boolean): void {
    this.isLoading = true;
    this.$facade.getBookmarks()
      .then((result) => {
        this.bookmarksList = result;
        this.isLoading = false;
      });
  }

  showContext($event: any, b: any, menu: any): any {
    this.selectedTicket = b;
    menu.toggle($event);
  }

  getRowStatus(d) {
    return this.$jaUtils.getRowStatus(d);
  }

  selectAll(selAllWks: boolean) {
    this.bookmarksList.ForEach(wl => wl.selected = !selAllWks);
  }

  deleteBookmark(ticketNo?: string): void {
    var ids: string[];
    if (ticketNo) { ids = [ticketNo]; }
    else {
      ids = this.bookmarksList.Where((b) => { return b.selected; }).Select((b) => { return b.ticketNo; });
    }
    if (ids.length == 0) { this.message.info("Select the bookmarks to be deleted!"); return; }
    this.isLoading = true;
    this.$facade.removeBookmark(ids).then((result) => { this.bookmarksList = result; this.isLoading = false; });
  }

  addBookmark(ticketNo: string[]) {
    if (this.ticketsList && this.ticketsList.length > 0) {
      this.isLoading = true;
      this.$facade.addBookmark(this.ticketsList)
        .then((result) => {
          if (result.length === 0) {
            this.showAddPopup = false;
            this.ticketsList = [];
          }
          else {
            this.ticketsList = result;
            if (ticketNo.length === this.ticketsList.length) {
              this.message.warning("None of the ticket numbers provided are valid.");
            }
            else if (ticketNo.length > this.ticketsList.length) {
              this.message.warning("Some of the ticket numbers provided are not valid.");
            }
          }
          this.fillBookmarksList();
        });
    }
    else {
      this.showAddPopup = false;
    }
  }
}
