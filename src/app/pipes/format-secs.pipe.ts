import { Pipe, PipeTransform } from '@angular/core';
import { DataTransformService } from '../services/data-transform.service';

@Pipe({
  name: 'formatSecs'
})
export class FormatSecsPipe implements PipeTransform {
  constructor(private $transform: DataTransformService) { }
  transform(d, showZeroSecs?: boolean): any {
    return this.$transform.formatSecs(d, showZeroSecs);
  }
}
