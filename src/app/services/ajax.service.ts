import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiUrls } from '../_constants';
import { SessionService } from './session.service';
import * as $ from 'jquery'

@Injectable()
export class AjaxService {
  _basePath: string
  httpOptions: any

  constructor(private $ajax: HttpClient, private $session: SessionService) {
    var headerObj = { 'Content-Type': 'application/json' };

    // Jira has issue with user agent of firefox
    if (typeof window['InstallTrigger'] !== 'undefined') {
      headerObj['User-Agent'] = 'Chrome';
    }

    this.httpOptions = {
      headers: new HttpHeaders(headerObj)
    };

    //// Jira has issue with user agent of firefox
    //if (typeof window['InstallTrigger'] !== 'undefined') {
    //  $.ajaxSetup({
    //    beforeSend: function (request) {
    //      console.log("chrome setting user agent");
    //      request.setRequestHeader("User-Agent", "Chrome");
    //    }
    //  });
    //}
  }

  prepareUrl(url: ApiUrls, params: any[]): string {
    this._basePath = this.$session.rootUrl
    if (!this._basePath.endsWith('/')) { this._basePath += '/'; }

    var urlStr = url.toString();

    if (params && params.length > 0) { urlStr = urlStr.format(params); }

    if (urlStr.startsWith('~/')) { return this._basePath + urlStr.substring(2); }

    return urlStr;
  }

  public get(url: ApiUrls, ...params: any[]): Promise<any> {
    //return new Promise((resolve, reject) => {
    //  $.get(this.prepareUrl(url, params))
    //    .done((data) => {
    //      resolve(data);
    //    })
    //    .fail((err) => {
    //      reject(err);
    //    });
    //});
    return this.$ajax.get(this.prepareUrl(url, params), this.httpOptions).toPromise();
  }

  public post(url: ApiUrls, data: any, ...params: any[]): Promise<any> {
    return this.$ajax.post(this.prepareUrl(url, params), data, this.httpOptions).toPromise();
  }

  public put(url: ApiUrls, data: any, ...params: any[]): Promise<any> {
    return this.$ajax.put(this.prepareUrl(url, params), data, this.httpOptions).toPromise();
  }

  public delete(url: ApiUrls, ...params: any[]): Promise<any> {
    return this.$ajax.delete(this.prepareUrl(url, params), this.httpOptions).toPromise();
  }
}
