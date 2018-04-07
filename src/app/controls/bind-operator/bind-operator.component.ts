import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { OPERATORS } from '../../_constants'

@Component({
  selector: '[jaBindOperators]',
  templateUrl: './bind-operator.component.html'
})
export class BindOperatorComponent implements OnChanges {
  @Input()
  row: any

  applFuncs: any[]

  constructor() {
  }

  ngOnChanges(change) {
    if (change.row) {
      this.applFuncs = OPERATORS.Where((o) => !o.types || o.types.indexOf(this.row.type) > -1);
    }
  }
}
