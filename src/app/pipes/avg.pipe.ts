import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'avg'
})
export class AvgPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(arr: Array<any>, prop?: string): any {
    return this.$transform.avg(arr, prop);
  }
}
