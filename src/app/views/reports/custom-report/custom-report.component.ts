import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-report',
  templateUrl: './custom-report.component.html'
})
export class CustomReportComponent {
  queryModel: any
  constructor() { }

  generateReport($event) {
    this.queryModel = $event.queryModel;
  }
}
