import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import controls

import { PRIME_MODULES } from './imports'

import { GroupEditorComponent } from './controls/group-editor/group-editor.component';
import { DateRangePickerComponent } from './controls/date-range-picker/date-range-picker.component'
import { AddWorklogComponent } from './controls/add-worklog/add-worklog.component'
import { ColorPickerComponent } from './controls/color-picker/color-picker.component';
import { ExportComponent } from './controls/export/export.component';
import { QueryEditorComponent } from './controls/query-editor/query-editor.component';
import { BindOperatorComponent } from './controls/bind-operator/bind-operator.component';
import { BindValueComponent } from './controls/bind-value/bind-value.component';
import { BindFunctionComponent } from './controls/bind-function/bind-function.component';
import { DaysInWeekComponent } from './controls/days-in-week/days-in-week.component';

const JA_CONTROLS = [DateRangePickerComponent, GroupEditorComponent, AddWorklogComponent, ColorPickerComponent,
  ExportComponent, QueryEditorComponent, BindOperatorComponent, BindValueComponent, BindFunctionComponent, DaysInWeekComponent]

import {
  BurndownChartComponent, CalendarComponent, MyOpenTicketsComponent, DateWiseWorklogComponent, TicketWiseWorklogComponent, DynamicGadgetComponent,
  PendingWorklogComponent, MyBookmarksComponent, MyFiltersComponent, DayWiseWorklogComponent, ReportViewerComponent
} from './gadgets'

const JA_GADGETS = [
  BurndownChartComponent,
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

import { FormsModule } from '@angular/forms';
import { ServicesModule, JA_PIPES } from './services.module'
import { NgxDnDModule } from '@swimlane/ngx-dnd'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PRIME_MODULES,
    NgxDnDModule,
    ServicesModule
  ],
  declarations: [
    ...JA_GADGETS,
    ...JA_CONTROLS
  ],
  providers: [
    ...JA_PIPES
  ],
  exports: [
    ...JA_GADGETS,
    ...JA_CONTROLS
  ]
})
export class GadgetsModule { }
