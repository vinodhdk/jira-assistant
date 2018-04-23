import { Component, OnChanges, ElementRef, SimpleChanges, Input } from '@angular/core';
import { BaseGadget } from '../base-gadget';
import { SessionService } from '../../services/session.service';

@Component({
  selector: '[jaBurndownChart]',
  templateUrl: './burndown-chart.component.html'
})
export class BurndownChartComponent extends BaseGadget implements OnChanges {
  @Input()
  rapidViewId: number

  isLoading: boolean

  constructor(el: ElementRef, private $session: SessionService) {
    super(el, 'Burndown chart : [Loading...]', 'fa-clock-o')
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.rapidViewId && change.rapidViewId.currentValue) {
      var selView = (this.$session.CurrentUser.rapidViews || []).First(r => r.id == this.rapidViewId);
      if (selView) {
        this.title = 'Burndown chart : [' + selView.name + ']';
      }
    }
  }

  fillReport() { }
}
