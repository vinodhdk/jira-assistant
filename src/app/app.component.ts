import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import * as $ from 'jquery'
import { CacheService } from './services/cache.service';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private el: ElementRef, private $cache: CacheService) { }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });

    var skinName = this.$cache.get('skin', true) || 'skin-blue';
    var isSideBarToggled = this.$cache.get('SideBarToggled');
    var isSideBarHidden = this.$cache.get('SideBarHidden');

    var body = $(this.el.nativeElement);
    body.addClass(skinName);

    if (isSideBarHidden) { body.addClass('sidebar-hidden brand-minimized'); }
    else if (isSideBarToggled) { body.addClass('sidebar-minimized brand-minimized'); }
  }
}
