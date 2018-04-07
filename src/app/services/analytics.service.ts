import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class AnalyticsService {
  constructor(private router: Router) {
    window['_gaq'] = window['_gaq'] || [];
  }

  trackEvent(event, page?:string) {
    if (!page) { page = this.router.url }
    //_gaq.push(['_trackPageView', $location.url()]);
    //console.log("_trackEvent", page, event);
    window['_gaq'].push(['_trackEvent', page, event]);

    //ga('send', 'pageview', $location.path());
  }

  trackPageView(page) {
    if (!page) { page = this.router.url }
    if (page === "/") { page = "/dashboard"; }
    window['_gaq'].push(['_trackPageview', "index.html" + page]);
  }
}
