import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'min'
})
export class MinPipe implements PipeTransform {
  transform(arr: Array<any>, prop?: string): any {
    if (!arr) { return null; }
    if (prop) {
      return arr.Min((v) => v[prop]);
    }
    else {
      return arr.Min();
    }
  }
}
