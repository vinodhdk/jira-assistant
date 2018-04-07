import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ja-color-picker',
  templateUrl: './color-picker.component.html'
})
export class ColorPickerComponent {

  @Input()
  colorCode: string

  constructor() { }
}
