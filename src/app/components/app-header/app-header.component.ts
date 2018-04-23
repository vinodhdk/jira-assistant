import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery'
import { CHROME_WS_URL, FF_STORE_URL } from '../../_constants';
import { AppBrowserService } from '../../services/app-browser.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html'
})
export class AppHeaderComponent {
  showVideoHelp: boolean
  ratingUrl: SafeResourceUrl
  storeUrl: SafeResourceUrl
  gMailShare: SafeResourceUrl
  gPlusShare: SafeResourceUrl
  linkedInShare: SafeResourceUrl
  fackbookShare: SafeResourceUrl
  twitterShare: SafeResourceUrl
  skinClass: string
  selectedSkin: string
  useLightTheme: boolean
  searchText: string

  constructor(private $location: Router, sanit: DomSanitizer, $jaBrowserExtn: AppBrowserService, private $cache: CacheService) {
    this.selectedSkin = this.$cache.get('skin', true) || 'skin-blue';
    this.skinClass = this.selectedSkin.replace('-light', '');
    this.useLightTheme = this.selectedSkin.indexOf('-light') > -1;

    this.ratingUrl = sanit.bypassSecurityTrustResourceUrl($jaBrowserExtn.getStoreUrl(true));
    this.storeUrl = sanit.bypassSecurityTrustResourceUrl($jaBrowserExtn.getStoreUrl());
    var subj = encodeURIComponent('Check out "Jira Assistant" in web store');
    var body = encodeURIComponent('Check out "Jira Assistant" extension / add-on for your browser from below url:'
      + '\n\n' + 'Chrome users: ' + CHROME_WS_URL + "?utm_source%3Dgmail#"
      + '\n\n' + 'Firefox users: ' + FF_STORE_URL
      //+ '\n\n' + 'Edge users: <<Not available yet>>'
      //+ '\n\n' + 'Safari users: <<Not available yet>>'
      + '\n\n\n\n' + 'This would help you to track your worklog and generate reports from Jira easily with lots of customizations. '
      + 'Also has lot more features like Google Calendar integration, Jira comment & meeting + worklog notifications, Worklog and custom report generations, etc..'
    );
    var storeUrl = encodeURIComponent($jaBrowserExtn.getStoreUrl());

    this.gMailShare = sanit.bypassSecurityTrustResourceUrl("https://mail.google.com/mail/u/0/?view=cm&tf=1&fs=1&su=" + subj + "&body=" + body);
    this.gPlusShare = sanit.bypassSecurityTrustResourceUrl("https://plus.google.com/share?app=110&url=" + storeUrl);
    this.linkedInShare = sanit.bypassSecurityTrustResourceUrl("https://www.linkedin.com/shareArticle?mini=true&url=" + storeUrl + "&title=" + subj + "&summary=" + body + "&source=");
    this.fackbookShare = sanit.bypassSecurityTrustResourceUrl("https://www.facebook.com/sharer/sharer.php?u=" + storeUrl);
    this.twitterShare = sanit.bypassSecurityTrustResourceUrl("https://twitter.com/home?status=" + storeUrl);
  }

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

  setSkin(skin, fromChk: boolean = false) {
    var passedSkin = skin;
    if (this.useLightTheme != fromChk) { skin += '-light'; }
    if (this.selectedSkin == skin) { return; }
    var body = $('body');
    body.removeClass(this.selectedSkin);
    this.skinClass = passedSkin;
    this.selectedSkin = skin;
    this.$cache.set('skin', skin, false, true);
    body.addClass(this.selectedSkin);
    $('#divSkins .selected').removeClass('selected');
    $('#divSkins .' + this.selectedSkin).addClass('selected');
  }

  search(event) {
    this.searchText = (this.searchText || "").trim();
    if (!this.searchText) { return; }

    this.$location.navigateByUrl("/faq/" + this.searchText).then(res => { if (res) { this.searchText = ""; } });
  }
}
