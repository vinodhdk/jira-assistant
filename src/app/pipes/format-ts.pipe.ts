import { Pipe, PipeTransform } from '@angular/core';
import { FormatSecsPipe } from './format-secs.pipe';
import { UtilsService } from '../services/utils.service';

@Pipe({
  name: 'formatTs'
})
export class FormatTsPipe implements PipeTransform {
  constructor(private formatSecs: FormatSecsPipe, private $jaUtils: UtilsService) { }
  transform(d: any): any {
    return this.formatSecs.transform(this.$jaUtils.getTotalSecs(d), false);
  }

}
