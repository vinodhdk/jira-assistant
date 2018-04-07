import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum'
})
export class SumPipe implements PipeTransform {
  transform(arr: Array<any>, prop?: string): any {
    if (!arr) { return null; }
    if (prop) {
      return arr.Sum((v) => v[prop]);
    }
    else {
      return arr.Sum();
    }
  }
}
