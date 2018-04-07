import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'convertSecs'
})
export class ConvertSecsPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(d, opts?: any): any {
    return this.$transform.convertSecs(d, opts);
  }
}
