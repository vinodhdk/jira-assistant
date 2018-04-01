import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getProperty'
})
export class GetPropertyPipe implements PipeTransform {

  transform(object: any, prop: string, fromCsv?: boolean): any {

    if (!object) { return object; }

    if (fromCsv && typeof object === "string") { object = this.convertCustObj(object); }

    if (!prop) return object;

    return object[prop];
  }

  convertCustObj(obj: any) {
    if (Array.isArray(obj)) {
      var arr = [];
      for (var i = 0; i < obj.length; i++) {
        arr[i] = this.convertCustObj(obj[i]);
      }
      return arr;
    }
    else {
      if (typeof obj === "string") {
        obj = obj.replace(/(^.*\[|\].*$)/g, '');
        var vals = obj.split(',');
        obj = {};
        for (var i = 0; i < vals.length; i++) {
          var val = vals[i].split('=');
          var data = val[1];
          if (data !== "<null>")
            obj[val[0]] = data;
        }
        return obj;
      }
      else return obj;
    }
  }
}
