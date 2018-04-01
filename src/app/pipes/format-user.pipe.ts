import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatUser'
})
export class FormatUserPipe implements PipeTransform {

  transform(obj: any, fields: string): any {
    if (!obj) { return null; }
    switch (fields) {
      case "EM": return obj.emailAddress;
      case "LG": return obj.name;
      case "NE": return obj.displayName + '(' + obj.emailAddress + ')';
      case "NL": return obj.displayName + '(' + obj.name + ')';
      default: return obj.displayName;
    }
  }

}
