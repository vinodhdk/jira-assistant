import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'cut'
})
export class CutPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(value: string, max?: any, wordwise?: boolean, tail?: string): any {
    return this.$transform.cut(value, max, wordwise, tail);
  }
}
