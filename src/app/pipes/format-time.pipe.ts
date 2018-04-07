import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(value: any, format?: string, utc?: boolean): any {
    return this.$transform.formatTime(value, format, utc);
  }
}
