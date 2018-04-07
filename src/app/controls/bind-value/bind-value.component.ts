import { Component, OnChanges, Input } from '@angular/core';
import { OPERATORS } from '../../_constants'
import * as moment from 'moment'

@Component({
  selector: '[jaBindValues]',
  templateUrl: './bind-value.component.html'
})
export class BindValueComponent implements OnChanges {

  @Input()
  row: any

  @Input()
  operator: string

  dateRange: any

  oper: any

  constructor() {
    this.oper = {};
  }


  ngOnChanges(change) {
    if (change.operator && change.operator.currentValue) {
      this.oper = OPERATORS.First((o) => o.value === this.operator);

      this.row.valueArr = null;

      var type = this.oper.type;

      if (type === "multiple") {
        if (this.row.value) {
          this.row.valueArr = this.row.value.split(',');
        }
      }
      else if (type === "range") {
        if (this.row.type === "date" || this.row.type === "datetime") {
          if (this.row.quickDate > 0) {
            this.dateRange = { quickDate: this.row.quickDate };
          }
          else if (this.row.value && this.row.value2) {
            this.dateRange = {
              quickDate: 0,
              fromDate: moment(this.row.value, 'YYYY-MM-DD').toDate(),
              toDate: moment(this.row.value2, 'YYYY-MM-DD').toDate()
            };
          }
        }
      }
      //else if (type === "range") {
      //  if (this.row.type === "date" || this.row.type === "datetime") {
      //    var selectHtml = '<div class="dtrange" style="width:100%;max-width:250px;"><span></span><div class="pull-right"><b class="caret"></b></div></div>';
      //  }
      //  else {
      //    var selectHtml = '';
      //  }
      //}
      //else {
      //  var selectHtml = '<input type="text" ng-model="row.value" placeholder="value for {{row.name}}" style="width:100%;max-width:250px;">';
      //}
    }
  }

  setDate(start, end) {
    this.row.value = start.format('YYYY-MM-DD');
    this.row.value2 = end.format('YYYY-MM-DD');
  }

  valueArrChanged(arr) {
    this.row.value = (arr || []).join(',');
  }

  dateSelected(event) {
    this.row.quickDate = event.quickDate;

    if (event.quickDate > 0) {
      delete this.row.value;
      delete this.row.value2;
    }
    else {
      this.row.value = event.fromDate.format('yyyy-MM-dd');
      this.row.value2 = event.toDate.format('yyyy-MM-dd');
    }
  }
}
