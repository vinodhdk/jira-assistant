import { Component, OnChanges, Input } from '@angular/core';
import { functions, defaultFunctions } from '../../common/functions';

@Component({
  selector: '[jaBindFunction]',
  templateUrl: './bind-function.component.html'
})
export class BindFunctionComponent implements OnChanges {

  @Input()
  row: any

  applFuncs: any[]

  selFunction: any

  constructor() { }

  ngOnChanges(change) {
    if (change.row && change.row.currentValue) {
      this.applFuncs = functions.Where((f) => {
        return (
          (
            (f.types.indexOf(this.row.type) > -1 || f.types.indexOf("*") > -1)
            || (this.row.knownObj && f.types.indexOf("object") > -1)
          )
          && (!this.row.isArray === !f.forArray))
          && f.types.indexOf("!" + this.row.type) == -1;
      }).Select(f => { return { value: f.name, label: f.text }; });

      if (this.row.functions) {
        this.selFunction = this.row.functions.id;
      }

      //if (this.row.functions && this.row.functions.name) {
      //  selectHtml.selectpicker("val", this.row.functions.id);
      //}
      //else if (applFuncs.length) {
      //  selectHtml.selectpicker("val", applFuncs[0].name);
      //  selectionChanged();
      //}
    }
  }

  selectionChanged(event) {
    var func = functions.First((f) => { return f.name === this.selFunction; });
    var funcName = func.name.split("?")[0];
    var params = !func.params ? null : func.params.Select((p) => { return (p.value != null) ? p.value : p.default; });
    this.row.functions = { id: func.name, name: funcName, params: params, useArray: func.aggregate, header: func.header };
  }
}
