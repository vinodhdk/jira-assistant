import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { UtilsService } from './utils.service';

@Injectable()
export class DataTransformService {

  constructor(private $session: SessionService, private $utils: UtilsService) {
  }

  avg(arr: Array<any>, prop?: string): any {
    if (!arr) { return null; }
    if (prop) {
      return arr.Avg((v) => v[prop]);
    }
    else {
      return arr.Avg();
    }
  }


  bytes(bytes: any, precision?: number): any {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') { precision = 1; }
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  }

  convertSecs(d, opts?: any): any {
    if (!opts) { opts = {}; }
    if (!d) {
      return opts.showZeroSecs ? 0 : "";
    }
    else if (Array.isArray(d)) {
      d = d.Sum();
    }
    d = Number(d);
    if (opts.format) { return this.formatSecs(d, opts.showZeroSecs); }
    else { return parseFloat(((d / 3600).toFixed(4))); }
  }

  count(arr: Array<any>, prop?: string): any {
    if (!arr) { return null; }
    if (prop) {
      return arr.Count((v) => v[prop]);
    }
    else {
      return arr.Count();
    }
  }

  cut(value: string, max?: any, wordwise?: boolean, tail?: string): any {
    if (!value || max == -1) return value;

    max = parseInt(max || 20, 10);
    if (!max) return value;
    if (value.length <= max) return value;

    value = value.substr(0, max);
    if (wordwise) {
      var lastspace = value.lastIndexOf(' ');
      if (lastspace != -1) {
        //Also remove . and , so it gives a cleaner result.
        if (value.charAt(lastspace - 1) == '.' || value.charAt(lastspace - 1) == ',') {
          lastspace = lastspace - 1;
        }
        value = value.substr(0, lastspace);
      }
    }

    return value + (tail || '...');//$('<span>&hellip;</span>').text() // ToDo: need to find alternate approach
  }

  formatDateTime(value: any, format?: string, utc?: boolean): string {
    if (!value) return value;
    if (!format) format = this.$session.CurrentUser.dateFormat + " " + this.$session.CurrentUser.timeFormat;
    var date = this.$utils.convertDate(value);
    if (date && date instanceof Date) {
      if (utc === true) { date = date.toUTCDate(); }
      return date.format(format);
    }
    return date;
  }

  formatDate(value: any, format?: string, utc?: boolean): any {
    if (!format) { format = this.$session.CurrentUser.dateFormat; }
    return this.formatDateTime(value, format, utc);
  }

  formatSecs(d, showZeroSecs?: boolean, simple?: boolean): any {
    if (d === 0) {
      return showZeroSecs ? "0s" : "";
    }
    if (d && Array.isArray(d)) {
      d = d.Sum();
    }

    d = Number(d);
    var prefix = "";
    if (d < 0) { prefix = "-"; d = Math.abs(d); }
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    if (simple) {
      return prefix + (h > 0 ? h.pad(2) : "00") + ':' + (m > 0 ? m.pad(2) : "00");
    }
    else {
      return prefix + ((h > 0 ? h + "h " : "") + (m > 0 ? m + "m " : "") + (s > 0 ? s + "s" : "")).trim();
    }
  }

  formatTime(value: any, format?: string, utc?: boolean): any {
    return this.formatDateTime(value, format || this.$session.CurrentUser.timeFormat, utc);
  }

  formatTs(d: any, simple?: boolean): any {
    return this.formatSecs(this.$utils.getTotalSecs(d), false, simple);
  }

  formatUser(obj: any, fields: string): any {
    if (!obj) { return null; }
    switch (fields) {
      case "EM": return obj.emailAddress;
      case "LG": return obj.name;
      case "NE": return obj.displayName + '(' + obj.emailAddress + ')';
      case "NL": return obj.displayName + '(' + obj.name + ')';
      default: return obj.displayName;
    }
  }


  getProperty(object: any, prop: string, fromCsv?: boolean): any {

    if (!object) { return object; }

    if (fromCsv && typeof object === "string") { object = this.convertCustObj(object); }

    if (!prop) return object;

    return object[prop];
  }

  private convertCustObj(obj: any) {
    if (Array.isArray(obj)) {
      var arr = [];
      for (var i = 0; i < obj.length; i++) {
        arr[i] = this.convertCustObj(obj[i]);
      }
      return arr;
    }
    else {
      if (typeof obj === "string") {
        obj = obj.replace(/(^.*\[|\].*$)/g, '');
        var vals = obj.split(',');
        obj = {};
        for (var i = 0; i < vals.length; i++) {
          var val = vals[i].split('=');
          var data = val[1];
          if (data !== "<null>")
            obj[val[0]] = data;
        }
        return obj;
      }
      else return obj;
    }
  }
}
