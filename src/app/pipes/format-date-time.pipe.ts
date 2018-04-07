import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'formatDateTime'
})
export class FormatDateTimePipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(value: any, format?: string, utc?: boolean): string {
    return this.$transform.formatDateTime(value, format, utc);
  }
}
