import { Component, OnInit, ElementRef } from '@angular/core';
import { FacadeService, MessageService, UtilsService } from '../../services/index';
import { BaseGadget, GadgetAction, GadgetActionType } from '../base-gadget';

@Component({
  selector: '[pendingWorklog]',
  templateUrl: './pending-worklog.component.html'
})
export class PendingWorklogComponent extends BaseGadget {
  worklogs: any[]
  isLoading: boolean
  contextMenu: any[]//MenuItem
  selectedItem: any
  selAllWks: boolean

  //dateStarted
  constructor(private $facade: FacadeService, private $jaUtils: UtilsService, el: ElementRef, private message: MessageService) {
    super(el, 'Worklog - [Pending upload]','fa-clock-o')
    this.selAllWks = true;
    this.fillWorklogs();
    this.contextMenu = [
      { label: "Select worklog", icon: "fa-check-square-o", command: () => this.selectedItem.selected = true },
      { label: "Edit worklog", icon: "fa-edit", command: () => this.editWorklogObj() },
      { label: "Copy worklog", icon: "fa-copy", command: () => this.editWorklogObj(true) },
      { label: "Upload worklog", icon: "fa-upload", command: () => this.uploadWorklog([this.selectedItem]) },
      { label: "Delete worklog", icon: "fa-trash-o", command: () => this.deleteWorklog([this.selectedItem]) }
    ];
  }

  fillWorklogs() {
    this.isLoading = true;
    return this.$facade.getPendingWorklogs()
      .then((result) => {
        this.worklogs = result.ForEach((w) => {
          w.selected = this.selAllWks;
          w.rowClass = this.$jaUtils.getRowStatus(w);
        });
        this.isLoading = false;
      });
  }

  editWorklogObj(copy?: boolean) {
    var newObj = Object.create(this.selectedItem);
    newObj.copy = copy;
    this.addWorklog(newObj);
  }

  selectAll(selAllWks: boolean) {
    this.worklogs.ForEach(wl => wl.selected = !selAllWks);
  }

  getRowStatus(d, index) {
    return d.rowClass;
  }

  getTicketUrl(ticketNo: string) { return this.$jaUtils.getTicketUrl(ticketNo); }

  showContext($event: any, b: any, menu: any): any {
    this.selectedItem = b;
    menu.toggle($event);
  }

  uploadWorklog(items?: any[]) {
    if (!items) {
      items = this.worklogs.Where((w) => w.selected);
    }

    var ids = items.Select((w) => w.id);
    if (ids.length == 0) { this.message.info("Select the worklogs to be uploaded!"); return; }
    this.isLoading = true;
    this.$facade.uploadWorklogs(ids).then((result) => {
      this.worklogs = result;
      this.isLoading = false;
      super.performAction(GadgetActionType.WorklogModified);
    }, (obj) => {
      if (obj && obj.message) { this.message.warning(obj.message); }
      this.fillWorklogs();
      this.isLoading = false;
    });
  }

  deleteWorklog(items?: any[]) {
    if (!items) {
      items = this.worklogs.Where((w) => w.selected);
    }
    var ids = items.Select((w) => w.id);
    if (ids.length == 0) { this.message.info("Select the worklogs to be deleted!"); return; }
    this.isLoading = true;
    this.$facade.deleteWorklogs(ids).then((result) => {
      this.fillWorklogs();
      this.performAction(GadgetActionType.DeletedWorklog);
    });
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
