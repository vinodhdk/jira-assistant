import { Pipe, PipeTransform } from '@angular/core';
import { SessionService } from '../services/session.service';
import { FormatDateTimePipe } from './format-date-time.pipe';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  constructor(private $session: SessionService, private formatDateTime: FormatDateTimePipe) {
  }
  transform(value: any, format?: string, utc?: boolean): any {
    if (!format) { format = this.$session.CurrentUser.dateFormat; }
    return this.formatDateTime.transform(value, format, utc);
  }
}
