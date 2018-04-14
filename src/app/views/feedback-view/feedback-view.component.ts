import { Component, AfterViewInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppBrowserService } from '../../services/app-browser.service';

@Component({
  selector: 'app-feedback-view',
  templateUrl: './feedback-view.component.html'
})
export class FeedbackViewComponent implements AfterViewInit {
  feedbackUrl: SafeResourceUrl
  constructor($session: SessionService, sanit: DomSanitizer, $jaBrowserExtn: AppBrowserService) {
    var cUser = $session.CurrentUser;
    $jaBrowserExtn.getAppVersion().then((version) => {
      var siteVersionNumber = (version || '*0.34') + " (BETA UI)";
      this.feedbackUrl = sanit.bypassSecurityTrustResourceUrl(cUser.feedbackUrl.format([cUser.displayName, cUser.emailAddress, siteVersionNumber, navigator.userAgent]));
    });
  }

  ngAfterViewInit() {
  }

  resizeIframe(obj) {
    setTimeout(function () {
      obj.style.height = 0;
      obj.style.height = (obj.contentWindow.document.body.scrollHeight + 30) + 'px';
    }, 2000);
  }
}
