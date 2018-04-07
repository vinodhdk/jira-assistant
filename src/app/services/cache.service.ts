import { Injectable } from '@angular/core';
import { AppBrowserService } from './app-browser.service';
import * as moment from 'moment'
import { UtilsService } from './utils.service';

@Injectable()
export class CacheService {

  private storage: any;
  private varStorage: any = {};
  private reISO: RegExp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;

  constructor(private $jaBrowserExtn: AppBrowserService, private $utils: UtilsService) {
    this.storage = $jaBrowserExtn.getStorage();
  }

  public session: any = {
    set: (key, value) => {
      if (!key) { return; }
      if (value) {
        this.varStorage[key] = value;
      }
      else {
        delete this.varStorage[key];
      }
      return value;
    },
    get: (key: string) => {
      return this.varStorage[key];
    },
    getPromise: (key: string) => new Promise((resolve, reject) => resolve(this.session.get(key))),
    clear: () => { this.varStorage = {}; }
  }

  public lob: any = {
    set: (key, value, expires) => {
      if (!key) { return; }
      if (value) {
        value = { value: value };
        if (expires) {
          if (typeof (expires) === "number" && expires > 0) {
            value.expires = moment().add(expires, 'days').toDate();
          }
          else if (expires instanceof Date) {
            value.expires = expires;
          }
          else if (moment.isMoment(expires)) {
            value.expires = expires.toDate();
          }
        }
        if (this.storage.set) {
          var obj = {};
          obj[key] = value;
          this.storage.set(obj);
        }
        else { this.storage[key] = value; }
      }
      else {
        this.storage.remove(key);
      }
      return value;
    },
    get: (key) => {
      return new Promise((resolve, reject) => {
        var process = (data) => {
          if (data && (data = data[key])) {
            if (data.expires) {
              var exp = moment(data.expires);
              if (exp.diff(moment()) > 0) {
                data.value = null;
              }
            }

            data = data.value;
          }
          resolve(data);
        };
        if (this.storage.get) {
          this.storage.get(key, process);
        }
        else { process(this.storage[key]); }
      });
    },
    remove: (key) => { this.lob.set(key, null); },
    clear: () => { this.storage.clear(); }
  }

  set(key: string, value: any, expires?: any) {
    if (!key) { return; }
    if (value) {
      value = { value: value };
      if (expires) {
        if (typeof expires === "number" && expires > 0) {
          value.expires = moment().add(expires, 'days').toDate();
        }
        else if (expires instanceof Date) {
          value.expires = expires;
        }
        else if (moment.isMoment(expires)) {
          value.expires = expires.toDate();
        }
      }
      localStorage.setItem(key, this.stringify(value));
    }
    else {
      localStorage.removeItem(key);
    }
    return value;
  }

  get(key: string, raw?: boolean) {
    var data: any = localStorage.getItem(key);
    if (raw) { return data; }
    if (data) {
      data = this.parse(data);
      if (data.expires) {
        var exp = moment(data.expires);
        if (exp.diff(moment()) > 0) {
          data.value = null;
        }
      }

      data = data.value;
    }
    return data;
  }

  remove(key) { this.set(key, null, null); }

  clear() { localStorage.clear(); }

  parse(value) {
    return JSON.parse(value, (key, val: any) => {
      if (val && typeof val === "string" && val.startsWith("/Date(")) {
        return this.$utils.convertDate(val);
      }
      return val;
    });
  }

  stringify(value) {
    return JSON.stringify(value, (key, val) => {
      if (val && val instanceof Date) {
        return "/Date(" + val.getTime() + ")/";
      }
      else if (val && typeof val === "string") {
        var a = this.reISO.test(val); //reISO.exec(val);
        if (a) {
          return '/Date(' + new Date(val).getTime() + ')/';//Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6])
          //this[key] = val;
          //return val;
        }
      }
      return val;
    })
  }
}
