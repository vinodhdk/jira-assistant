import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ApiUrls } from '../_constants';
import { SessionService } from './session.service';

@Injectable()
export class AjaxService {
  _basePath: string

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
      //, 'User-Agent': 'Chrome'
    })
  };

  constructor(private $ajax: HttpClient, private $session: SessionService) {
  }

  prepareUrl(url: ApiUrls, params: any[]): string {
    this._basePath = this.$session.rootUrl
    if (!this._basePath.endsWith('/')) { this._basePath += '/'; }

    var urlStr = url.toString();

    if (params && params.length > 0) { urlStr = urlStr.format(params); }

    if (urlStr.startsWith('~/')) { return this._basePath + urlStr.substring(2); }

    return urlStr;
  } // ToDo: need to fix this method

  public get(url: ApiUrls, ...params: any[]): Promise<any> {
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
