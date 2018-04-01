import { Pipe, PipeTransform } from '@angular/core';
import { FormatSecsPipe } from './format-secs.pipe';

@Pipe({
  name: 'convertSecs'
})
export class ConvertSecsPipe implements PipeTransform {
  constructor(private formatSecs: FormatSecsPipe) { }
  transform(d, opts?: any): any {
    if (!opts) { opts = {}; }
    if (!d) {
      return opts.showZeroSecs ? 0 : "";
    }
    else if (Array.isArray(d)) {
      d = d.Sum();
    }
    d = Number(d);
    if (opts.format) { return this.formatSecs.transform(d, opts.showZeroSecs); }
    else { return parseFloat(((d / 3600).toFixed(4))); }
  }

}
