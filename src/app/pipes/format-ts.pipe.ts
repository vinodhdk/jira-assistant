import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'formatTs'
})
export class FormatTsPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(d: any, simple?: boolean): any {
    return this.$transform.formatTs(d, simple);
  }
}
