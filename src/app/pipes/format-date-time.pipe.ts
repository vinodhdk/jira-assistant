import { Pipe, PipeTransform } from '@angular/core';
import { SessionService } from '../services/session.service';
import { UtilsService } from '../services/utils.service';

@Pipe({
  name: 'formatDateTime'
})
export class FormatDateTimePipe implements PipeTransform {
  constructor(private $session: SessionService, private $utils: UtilsService) {
  }
  transform(value: any, format?: string, utc?: boolean): string {
    if (!value) return value;
    if (!format) format = this.$session.CurrentUser.dateFormat + " " + this.$session.CurrentUser.timeFormat;
    var date = this.$utils.convertDate(value);
    if (date && date instanceof Date) {
      if (utc === true) { date = date.toUTCDate(); }
      return date.format(format);
    }
    return date;
  }

}
