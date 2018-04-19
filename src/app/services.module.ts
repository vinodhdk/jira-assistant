import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';


// Import pipes
import {
  FormatDateTimePipe, FormatDatePipe, FormatTsPipe, ToTicketUrlPipe,
  YesnoPipe, ConvertSecsPipe, FormatTimePipe, FormatSecsPipe, CutPipe, BytesPipe
} from './pipes'

export const JA_PIPES = [
  FormatDateTimePipe, FormatDatePipe, FormatTsPipe, ToTicketUrlPipe,
  YesnoPipe, ConvertSecsPipe, FormatTimePipe, FormatSecsPipe, CutPipe, BytesPipe
]

// Import services
import {
  AjaxService, AnalyticsService, AppBrowserService, CacheService, CalendarService, DatabaseService, FacadeService,
  JiraService, MessageService, SessionService, UtilsService, DataTransformService
} from './services';

const JA_SERVICES = [
  AjaxService, AnalyticsService, AppBrowserService, CacheService, CalendarService, DatabaseService, FacadeService,
  JiraService, MessageService, SessionService, UtilsService, DataTransformService
]

import { MessageService as PrimeMessageService } from 'primeng/components/common/messageservice';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ...JA_PIPES
  ],
  exports: [
    ...JA_PIPES
  ]
})
export class ServicesModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ServicesModule,
      providers: [
        PrimeMessageService,
        ...JA_SERVICES,
        ...JA_PIPES
      ]
    };
  }
}
