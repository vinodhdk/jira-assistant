// Import prime related modules
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { BlockUIModule } from 'primeng/blockui';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DataViewModule } from 'primeng/dataview';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InplaceModule } from 'primeng/inplace';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { StepsModule } from 'primeng/steps';
import { ChipsModule } from 'primeng/chips';
import { GrowlModule } from 'primeng/growl';
import { ScheduleModule } from 'primeng/schedule';

export const PRIME_MODULES = [PanelModule, ButtonModule, BlockUIModule, ScrollPanelModule,
  TieredMenuModule, SplitButtonModule, DropdownModule, CalendarModule, DataViewModule, AutoCompleteModule,
  InplaceModule, DialogModule, InputMaskModule, CheckboxModule, StepsModule, ChipsModule, GrowlModule, ScheduleModule]

export const JA_DIRECTIVES = [];


// Import pipes
import {
  AvgPipe, BytesPipe, ConvertSecsPipe, CountPipe, CutPipe, FormatDateTimePipe, FormatDatePipe,
  FormatSecsPipe, FormatTimePipe, FormatTsPipe, FormatUserPipe, GetPropertyPipe, MaxPipe, MinPipe,
  PropOfNthItemPipe, SumPipe, ToTicketUrlPipe, YesnoPipe
} from './pipes'

export const JA_PIPES = [AvgPipe, BytesPipe, ConvertSecsPipe, CountPipe, CutPipe, FormatDateTimePipe, FormatDatePipe,
  FormatSecsPipe, FormatTimePipe, FormatTsPipe, FormatUserPipe, GetPropertyPipe, MaxPipe, MinPipe,
  PropOfNthItemPipe, SumPipe, ToTicketUrlPipe, YesnoPipe]

// Import controls

import { GroupEditorComponent } from './controls/group-editor/group-editor.component';
import { DateRangePickerComponent } from './controls/date-range-picker/date-range-picker.component'
import { AddWorklogComponent } from './controls/add-worklog/add-worklog.component'

export const JA_CONTROLS = [DateRangePickerComponent, GroupEditorComponent, AddWorklogComponent]

import {
  CalendarComponent, MyOpenTicketsComponent, DateWiseWorklogComponent, TicketWiseWorklogComponent,
  PendingWorklogComponent, MyBookmarksComponent, MyFiltersComponent, DayWiseWorklogComponent
} from './gadgets'


export const JA_GADGETS = [
  CalendarComponent,
  MyOpenTicketsComponent,
  DateWiseWorklogComponent,
  TicketWiseWorklogComponent,
  PendingWorklogComponent,
  MyBookmarksComponent,
  MyFiltersComponent,
  DayWiseWorklogComponent
]

// Import Views
import {
  CalendarViewComponent, DashboardComponent, FeedbackViewComponent, // common
  CustomReportComponent, SprintReportComponent, UserDaywiseReportComponent, // reports
  UserGroupsComponent // settings
} from './views'

export const JA_VIEWS = [
  CalendarViewComponent, DashboardComponent, FeedbackViewComponent, // common
  CustomReportComponent, SprintReportComponent, UserDaywiseReportComponent, // reports
  UserGroupsComponent // settings
]
