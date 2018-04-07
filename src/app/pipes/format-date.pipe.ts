import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(value: any, format?: string, utc?: boolean): any {
    return this.$transform.formatDate(value, format, utc);
  }
}
