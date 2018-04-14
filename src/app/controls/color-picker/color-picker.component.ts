import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ja-color-picker',
  templateUrl: './color-picker.component.html'
})
export class ColorPickerComponent {

  private colorCodeValue: string

  @Input() get colorCode() { return this.colorCodeValue; }

  @Output() colorCodeChange = new EventEmitter();

  set colorCode(val) {
    this.colorCodeValue = val;
    this.colorCodeChange.emit(this.colorCodeValue);
  }

  constructor() { }
}
