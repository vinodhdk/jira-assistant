import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avg'
})
export class AvgPipe implements PipeTransform {
  transform(arr: Array<any>, prop?: string): any {
    if (!arr) { return null; }
    if (prop) {
      return arr.Avg(function (v) { return v[prop]; });
    }
    else {
      return arr.Avg();
    }
  }
}
