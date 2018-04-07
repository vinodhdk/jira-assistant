import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'formatTs'
})
export class FormatTsPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(d: any): any {
    return this.$transform.formatTs(d);
  }
}
