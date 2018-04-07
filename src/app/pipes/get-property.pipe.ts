import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'getProperty'
})
export class GetPropertyPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(object: any, prop: string, fromCsv?: boolean): any {
    return this.$transform.getProperty(object, prop, fromCsv);
  }
}
