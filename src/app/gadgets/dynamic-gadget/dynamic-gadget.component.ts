import { Component, OnChanges, Input, ElementRef, SimpleChanges } from '@angular/core';
import { BaseGadget } from '../base-gadget';

@Component({
  selector: '[dynamicGadget]',
  templateUrl: './dynamic-gadget.component.html'
})
export class DynamicGadgetComponent extends BaseGadget implements OnChanges {

  @Input()
  gadgetName: string

  gadgetType: string
  param1: any

  constructor(el: ElementRef) { super(el); }

  ngOnChanges(change: SimpleChanges) {
    if (change.gadgetName && change.gadgetName.currentValue) {
      var params = this.gadgetName.split(':');
      this.gadgetType = params[0];
      params.RemoveAt(0);
      this.param1 = params[0];
    }
  }

}
