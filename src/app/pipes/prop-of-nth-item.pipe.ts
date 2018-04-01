import { Pipe, PipeTransform } from '@angular/core';
import { GetPropertyPipe } from './get-property.pipe';

@Pipe({
  name: 'propOfNthItem'
})
export class PropOfNthItemPipe implements PipeTransform {
  constructor(private getProperty: GetPropertyPipe) { }
  transform(arr: Array<any>, index: any, prop?: string, fromCsv?: boolean): any {
    if (!arr) return null;
    if (!Array.isArray(arr)) return "#Error:Array expected";
    if (!arr.length) return null;

    if (typeof index === "string" && isNaN(Number(index))) {
      if (index === "last")
        index = arr.length - 1;
    }
    if (index - 0 === index) {
      index = index - 0;
      if (index < 0) return "#Error:Out of L Bound";
      if (index >= arr.length) return "#Error:Out of U Bound";
    }

    return this.getProperty.transform(arr[index], prop, fromCsv);
  }

}
