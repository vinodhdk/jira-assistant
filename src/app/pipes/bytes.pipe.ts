import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'bytes'
})
export class BytesPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(bytes: any, precision?: number): any {
    return this.$transform.bytes(bytes, precision);
  }
}
