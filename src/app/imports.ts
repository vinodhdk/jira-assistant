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
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TabViewModule } from 'primeng/tabview';

export const PRIME_MODULES = [PanelModule, ButtonModule, BlockUIModule, ScrollPanelModule, TieredMenuModule,
  SplitButtonModule, DropdownModule, CalendarModule, DataViewModule, AutoCompleteModule, InplaceModule, DialogModule,
  InputMaskModule, CheckboxModule, StepsModule, ChipsModule, GrowlModule, ScheduleModule, OverlayPanelModule,
  ColorPickerModule, TabViewModule]

export const JA_DIRECTIVES: any = [];


// Import pipes
import {
  FormatDateTimePipe, FormatDatePipe, FormatTsPipe, ToTicketUrlPipe,
  YesnoPipe, ConvertSecsPipe, FormatTimePipe, FormatSecsPipe, CutPipe
  //AvgPipe, BytesPipe, CountPipe, FormatUserPipe, GetPropertyPipe, MaxPipe, MinPipe,
  //PropOfNthItemPipe, SumPipe
} from './pipes'

export const JA_PIPES = [
  FormatDateTimePipe, FormatDatePipe, FormatTsPipe, ToTicketUrlPipe,
  YesnoPipe, ConvertSecsPipe, FormatTimePipe, FormatSecsPipe, CutPipe
  //AvgPipe, BytesPipe, CountPipe, CutPipe, FormatUserPipe, GetPropertyPipe, MaxPipe, MinPipe,
  //PropOfNthItemPipe, SumPipe
]

// Import controls

import { GroupEditorComponent } from './controls/group-editor/group-editor.component';
import { DateRangePickerComponent } from './controls/date-range-picker/date-range-picker.component'
import { AddWorklogComponent } from './controls/add-worklog/add-worklog.component'
import { ColorPickerComponent } from './controls/color-picker/color-picker.component';
import { ExportComponent } from './controls/export/export.component';
import { QueryEditorComponent } from './controls/query-editor/query-editor.component';
import { BindOperatorComponent } from './controls/bind-operator/bind-operator.component';
import { BindValueComponent } from './controls/bind-value/bind-value.component';
import { BindFunctionComponent } from './controls/bind-function/bind-function.component';

export const JA_CONTROLS = [DateRangePickerComponent, GroupEditorComponent, AddWorklogComponent, ColorPickerComponent,
  ExportComponent, QueryEditorComponent, BindOperatorComponent, BindValueComponent, BindFunctionComponent]

import {
  CalendarComponent, MyOpenTicketsComponent, DateWiseWorklogComponent, TicketWiseWorklogComponent, DynamicGadgetComponent,
  PendingWorklogComponent, MyBookmarksComponent, MyFiltersComponent, DayWiseWorklogComponent, ReportViewerComponent
} from './gadgets'

export const JA_GADGETS = [
  CalendarComponent,
  MyOpenTicketsComponent,
  DateWiseWorklogComponent,
  TicketWiseWorklogComponent,
  PendingWorklogComponent,
  MyBookmarksComponent,
  MyFiltersComponent,
  DayWiseWorklogComponent,
  ReportViewerComponent,
  DynamicGadgetComponent
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
