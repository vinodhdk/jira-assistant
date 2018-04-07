import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'count'
})
export class CountPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(arr: Array<any>, prop?: string): any {
    return this.$transform.count(arr, prop);
  }
}
