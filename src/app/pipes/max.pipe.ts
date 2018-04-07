import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'max'
})
export class MaxPipe implements PipeTransform {
  transform(arr: Array<any>, prop?: string): any {
    if (!arr) { return null; }
    if (prop) {
      return arr.Max((v) => v[prop]);
    }
    else {
      return arr.Max();
    }
  }
}
