import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery'

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html'
})
export class AppHeaderComponent {
  showVideoHelp: boolean
  constructor(private $location: Router) { }

  showVideo() {
    var url = "https://www.youtube.com/embed/f2aBSXzbYuA?rel=0&autoplay=1&showinfo=0&cc_load_policy=1&start=";

    var route = this.$location.url;

    var startAt = 0;
    var endAt = 0;
    switch (route) {
      case "/": default: startAt = 74; break;
      case "/calendar": startAt = 290; break;
      case "/reports/userdaywise": startAt = 538; break;
      case "/reports/customgrouped": startAt = 713; break;
      case "/settings": startAt = 1069; break;
      case "/feedback": startAt = 1147; break;
    }
    url += startAt + "&end=" + endAt;

    $('#ifVideoHelp').attr('src', url);
    this.showVideoHelp = true;
  }

  onHelpClosed() {
    this.showVideoHelp = false;
    $('#ifVideoHelp').attr('src', '#');
  }
}
