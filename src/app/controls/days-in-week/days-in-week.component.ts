import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: '[jaDaysInWeek]',
  templateUrl: './days-in-week.component.html'
})
export class DaysInWeekComponent implements OnChanges {
  @Input()
  days: any[]

  constructor() {
    this.days = this.days || [1, 2, 3, 4, 5];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.days && !changes.days.currentValue) { this.days = this.days || [1, 2, 3, 4, 5]; }
  }

  getClass($index: number) {
    return this.days.indexOf($index) > -1 ? 'day-on' : '';
  }

  daySelected(index: number) {
    var pos = this.days.indexOf(index);
    if (pos === -1) { this.days.Add(index); }
    else { this.days.RemoveAt(pos); }
    this.days = this.days.OrderBy();
  }
}
