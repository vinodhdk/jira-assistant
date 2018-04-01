import { Component, OnInit, ElementRef } from '@angular/core';
import { FacadeService, MessageService } from '../../services/index';
import { BaseGadget } from '../base-gadget';

@Component({
  selector: '[myFilters]',
  templateUrl: './my-filters.component.html'
})
export class MyFiltersComponent extends BaseGadget implements OnInit {

  savedQueries: any[]
  isLoading: boolean
  isFullScreen: boolean
  selAllSQ: boolean

  constructor(private $jaFacade: FacadeService, el: ElementRef, private message: MessageService) {
    super(el);
    this.fillSavedQuery();
  }

  fillSavedQuery() {
    this.isLoading = true;
    this.$jaFacade.getSavedFilters()
      .then((result) => { this.savedQueries = result; this.isLoading = false; })
  }

  deleteQuery(items?: any) {
    if (!items) {
      items = this.savedQueries.Where((w) => w.selected);
    }
    var ids = items.Select((w) => w.id);
    if (ids.length == 0) { this.message.info("Select the queries to be deleted!"); return; }
    this.isLoading = true;
    this.$jaFacade.deleteSavedQuery(ids).then(() => {
      return this.fillSavedQuery();
    });
  }

  selectAll(selAll: boolean) {
    this.savedQueries.ForEach(wl => wl.selected = selAll);
  }

  ngOnInit() {
  }

}
