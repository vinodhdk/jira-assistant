import { Pipe, PipeTransform } from '@angular/core';
import { FormatDateTimePipe } from './format-date-time.pipe';
import { SessionService } from '../services/session.service';

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {
  timeFormat: string

  constructor(private $session: SessionService, private formatDateTime: FormatDateTimePipe) {
    this.timeFormat = $session.CurrentUser.timeFormat;
  }

  transform(value: any, format?: string, utc?: boolean): any {
    return this.formatDateTime.transform(value, format || this.timeFormat, utc);
  }
}
