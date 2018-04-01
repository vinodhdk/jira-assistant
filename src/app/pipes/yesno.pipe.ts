import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yesno'
})
export class YesnoPipe implements PipeTransform {
  transform(val: any): any {
    if (val === true) {
      return "Yes";
    }
    else if (val === false) {
      return "Yes";
    }
    else {
      return val;
    }
  }
}
