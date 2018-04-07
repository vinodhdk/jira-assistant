import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import * as Moment from 'moment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//NoopAnimationsModule
import { AppComponent } from './app.component';

import { PRIME_MODULES, JA_CONTROLS, JA_PIPES, JA_VIEWS, JA_GADGETS, JA_DIRECTIVES } from './imports'


// Import services
import {
  AjaxService, AnalyticsService, AppBrowserService, CacheService, CalendarService, DatabaseService, FacadeService,
  JiraService, MessageService, SessionService, UtilsService, DataTransformService
} from './services';

const JA_SERVICES = [
  AjaxService, AnalyticsService, AppBrowserService, CacheService, CalendarService, DatabaseService, FacadeService,
  JiraService, MessageService, SessionService, UtilsService, DataTransformService,

  {
    // Provider for APP_INITIALIZER
    provide: APP_INITIALIZER,
    useFactory: authFactory,
    deps: [FacadeService],
    multi: true
  }
]

export function authFactory($fasade: FacadeService): Function {
  return () => $fasade.authenticate();
}


// Import containers
import {
  FullLayoutComponent,
  SimpleLayoutComponent
} from './containers';

const APP_CONTAINERS = [
  FullLayoutComponent,
  SimpleLayoutComponent
]


// Import components
import {
  AppAsideComponent,
  AppBreadcrumbsComponent,
  AppFooterComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppSidebarFooterComponent,
  AppSidebarFormComponent,
  AppSidebarHeaderComponent,
  AppSidebarMinimizerComponent,
  APP_SIDEBAR_NAV
} from './components';

const APP_COMPONENTS = [
  AppAsideComponent,
  AppBreadcrumbsComponent,
  AppFooterComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppSidebarFooterComponent,
  AppSidebarFormComponent,
  AppSidebarHeaderComponent,
  AppSidebarMinimizerComponent,
  APP_SIDEBAR_NAV,
  AppComponent
]

// Import directives
import {
  AsideToggleDirective,
  NAV_DROPDOWN_DIRECTIVES,
  ReplaceDirective,
  SIDEBAR_TOGGLE_DIRECTIVES
} from './directives';

const APP_DIRECTIVES = [
  AsideToggleDirective,
  NAV_DROPDOWN_DIRECTIVES,
  ReplaceDirective,
  SIDEBAR_TOGGLE_DIRECTIVES
]

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { MessageService as PrimeMessageService } from 'primeng/components/common/messageservice';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ...PRIME_MODULES
  ],
  declarations: [
    ...APP_CONTAINERS,
    ...APP_COMPONENTS,
    ...APP_DIRECTIVES,
    ...JA_DIRECTIVES,
    ...JA_PIPES,
    ...JA_VIEWS,
    ...JA_GADGETS,
    ...JA_CONTROLS
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    PrimeMessageService,
    ...JA_SERVICES,
    ...JA_PIPES
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
