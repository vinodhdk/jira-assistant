import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { SelectItemGroup } from 'primeng/api';
import { FormatDatePipe } from 'app/pipes';
import * as moment from 'moment'

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html'
})
export class DateRangePickerComponent implements OnInit {
  @Input()
  ngModal: DateRange

  @Output()
  selected: EventEmitter<DateRange>

  @ViewChild('calendar')
  calendar: any;

  @ViewChild('dropdown')
  dropdown: any;

  options: SelectItemGroup[]
  selectedRangeItem: any
  selectedDateText: string
  rangeDates: Date[];
  @Input()
  width: number

  rangeValues = [
    [moment().startOf('month').toDate(), moment().endOf('month').toDate()],
    [moment().subtract(1, 'months').toDate(), moment().toDate()],
    [moment().subtract(1, 'months').startOf('month').toDate(), moment().subtract(1, 'months').endOf('month').toDate()],
    [moment().startOf('week').toDate(), moment().endOf('week').toDate()],
    [moment().subtract(6, 'days').toDate(), moment().toDate()],
    [moment().subtract(1, 'weeks').startOf('week').toDate(), moment().subtract(1, 'weeks').endOf('week').toDate()]
  ];

  constructor(private formatDate: FormatDatePipe) {
    this.selectedDateText = "Select a date range";
    this.selected = new EventEmitter<DateRange>();
    this.ngModal = this.ngModal || {};

    this.options = [
      {
        label: 'Monthwise',
        items: [
          { label: 'This month', value: 1 },
          { label: 'Last one month', value: 2 },
          { label: 'Last month', value: 3 }
        ]
      },
      {
        label: 'Weekwise',
        items: [
          { label: 'This week', value: 4 },
          { label: 'Last one week', value: 5 },
          { label: 'Last week', value: 6 }
        ]
      },
      {
        label: 'Other',
        items: [
          { label: 'Custom Range', value: 0 }
        ]
      }
    ];
  }

  quickPickChanged($event): void {
    this.ngModal = this.ngModal || {};
    if ($event.value === 0) {
      delete this.ngModal.quickDate;
      this.selectedRangeItem = null;
      this.calendar.showOverlay(this.calendar.inputfieldViewChild.nativeElement);
      $event.originalEvent.stopPropagation();
    }
    else {
      this.ngModal.quickDate = $event.value;
      this.setModelDate(this.rangeValues[$event.value - 1]);
    }
  }

  rangeSelected($event): void {
    this.selectedRangeItem = null;
    if (!this.rangeDates.Any(d => !d)) {
      this.calendar.overlayVisible = false;
      this.selectedDateText = this.formatDate.transform(this.rangeDates[0]) + " - " + this.formatDate.transform(this.rangeDates[1]);
      this.setModelDate(this.rangeDates);
    }
  }

  setModelDate(rangeDates: Date[]): void {
    this.ngModal.fromDate = rangeDates[0];
    this.ngModal.toDate = rangeDates[1];
    this.selected.emit(this.ngModal);
  }

  ngOnInit() {
  }

}
interface DateRange {
  quickDate?: number
  fromDate?: Date
  toDate?: Date
}
