import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import {
  FullLayoutComponent,
  SimpleLayoutComponent
} from './containers';

import {
  CalendarViewComponent, DashboardComponent, FeedbackViewComponent, // common
  CustomReportComponent, SprintReportComponent, UserDaywiseReportComponent, // reports
  UserGroupsComponent // settings
} from './views'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: FullLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
        //loadChildren: './views/dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'dashboard/:index',
        component: DashboardComponent
        //loadChildren: './views/dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'reports/userdaywise',
        component: UserDaywiseReportComponent
      },
      {
        path: 'reports/sprint',
        component: SprintReportComponent
      },
      {
        path: 'reports/customgrouped',
        component: CustomReportComponent
      },
      {
        path: 'calendar',
        component: CalendarViewComponent
      },
      {
        path: 'settings/usergroups',
        component: UserGroupsComponent
      },
      //{
      //  path: 'settings/general',
      //  loadChildren: './views/settings-view/settings.module#SettingsModule'
      //},
      {
        path: 'feedback',
        component: FeedbackViewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }