// Import prime related modules
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { BlockUIModule } from 'primeng/blockui';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InplaceModule } from 'primeng/inplace';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { GrowlModule } from 'primeng/growl';
import { ScheduleModule } from 'primeng/schedule';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TabViewModule } from 'primeng/tabview';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataTableModule } from 'primeng/datatable';
import { TableModule } from 'primeng/table';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ListboxModule } from 'primeng/listbox';
import { AccordionModule } from 'primeng/accordion';
import { TreeTableModule } from 'primeng/treetable';

export const PRIME_MODULES = [PanelModule, ButtonModule, BlockUIModule, ScrollPanelModule, TieredMenuModule,
  SplitButtonModule, DropdownModule, CalendarModule, AutoCompleteModule, InplaceModule, DialogModule,
  InputMaskModule, CheckboxModule, ChipsModule, GrowlModule, ScheduleModule, OverlayPanelModule, ProgressBarModule,
  ColorPickerModule, TabViewModule, DataTableModule, TableModule, ContextMenuModule, ListboxModule, AccordionModule, TreeTableModule]

export const JA_DIRECTIVES: any = [];


// Import pipes
import {
  FormatDateTimePipe, FormatDatePipe, FormatTsPipe, ToTicketUrlPipe,
  YesnoPipe, ConvertSecsPipe, FormatTimePipe, FormatSecsPipe, CutPipe, BytesPipe
} from './pipes'

export const JA_PIPES = [
  FormatDateTimePipe, FormatDatePipe, FormatTsPipe, ToTicketUrlPipe,
  YesnoPipe, ConvertSecsPipe, FormatTimePipe, FormatSecsPipe, CutPipe, BytesPipe
]



// Import Views
import {
  CalendarViewComponent, DashboardComponent, FeedbackViewComponent, // common
  CustomReportComponent, SprintReportComponent, UserDaywiseReportComponent, // reports
  UserGroupsComponent, GeneralComponent, FaqViewComponent
} from './views'

export const JA_VIEWS = [
  CalendarViewComponent, DashboardComponent, FeedbackViewComponent, // common
  CustomReportComponent, SprintReportComponent, UserDaywiseReportComponent, // reports
  UserGroupsComponent, GeneralComponent, FaqViewComponent
]
