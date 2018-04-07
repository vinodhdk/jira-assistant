import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'formatUser'
})
export class FormatUserPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(obj: any, fields: string): any {
    return this.$transform.formatUser(obj, fields);
  }
}
