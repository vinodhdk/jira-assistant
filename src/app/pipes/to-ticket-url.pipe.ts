import { Pipe, PipeTransform } from '@angular/core';
import { UtilsService } from '../services/utils.service';

@Pipe({
  name: 'toTicketUrl'
})
export class ToTicketUrlPipe implements PipeTransform {
  constructor(private $utils: UtilsService) {
  }
  transform(ticketNo: string): string {
    return this.$utils.getTicketUrl(ticketNo);
  }

}
