import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatSecs'
})
export class FormatSecsPipe implements PipeTransform {

  transform(d, showZeroSecs?: boolean): any {
      if (d === 0) {
        return showZeroSecs ? "0s" : "";
      }
      if (d && Array.isArray(d)) {
        d = d.Sum();
      }

      d = Number(d);
      var prefix = "";
      if (d < 0) { prefix = "-"; d = Math.abs(d); }
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);
      return prefix + ((h > 0 ? h + "h " : "") + (m > 0 ? m + "m " : "") + (s > 0 ? s + "s" : "")).trim();
    }
}
