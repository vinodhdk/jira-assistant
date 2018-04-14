import { Component, OnInit, Input } from '@angular/core';
import * as $ from 'jquery'

@Component({
  selector: '[jaExport]',
  templateUrl: './export.component.html'
})
export class ExportComponent implements OnInit {

  @Input()
  element: any

  @Input()
  fileName: string


  constructor() { }

  ngOnInit() {
  }

  exportToCsv() {
    if (this.element.exportCSV) { this.element.exportFilename = this.fileName; this.element.exportCSV(); }
    else {
      var el = (this.element.el || this.element).nativeElement || this.element;
      var el = $(el);
      if (!el.is('table')) { el = el.find('table:first-child'); }
      this.exportTable(el, this.fileName || 'download');
    }
  }

  /**
  * Export the table.
  * 
  * @constructor
  *
  * @param {string} id
  *   The id of the table to be exported.
  * @param {string} fileName
  *   The name of the file to be exported.
  */
  exportTable(id, fileName) {
    var colInfo: any = [];

    var content = null;
    if (typeof id === "string") {
      content = genData($("#" + id + " thead tr:not([no-export]):visible"), colInfo)
        + genData($("#" + id + " tbody:visible tr:not([no-export]):visible"), colInfo);
    }
    else {
      content = genData(id.find("thead tr:not([no-export]):visible"), colInfo)
        + genData(id.find("tbody:visible tr:not([no-export]):visible"), colInfo);
    }

    this.exportCsv(content, fileName);
    function getVal(td: any) {
      var defaultOpts = { encode: true, trim: true };
      var opts = td.attr("export-option");
      if (opts && opts.length > 10)
        opts = $.extend(defaultOpts, eval("(" + opts + ")"));
      else
        opts = defaultOpts;
      var child = td.find("[export-data]:first");
      var val = (td.attr("export-data") || child.attr("export-data") || child.text() || td.text()).replace(/\r?\n|\r/g, " ");
      if (opts.trim) val = val.trim();
      if (val.indexOf('"') >= 0) val = val.replace(/"/g, '""');
      if (opts.encode && val.indexOf(',') >= 0) val = '"' + val + '"';
      return val;
    }
    function genData(node: any, colInfo: any) {
      var header: any[] = [];
      node.each((i, r) => {
        $(r).children("th,td").each((j, c) => {
          c = $(c);
          var rowarr: any = header[i];
          if (!rowarr) { rowarr = header[i] = []; }

          while (rowarr[j] != null) {
            j++;
          }

          var info = colInfo[j];
          if (!info || !info.noExport) colInfo[j] = { noExport: c.is("[no-export]") || (c.is(":hidden") && !c.is("[force-export]")) };

          rowarr[j] = getVal(c);
          var colspan = parseInt(c.attr("colspan"));
          while (colspan > 1) {
            rowarr[j + colspan - 1] = "";
            colspan--;
          }
          var rowspan = parseInt(c.attr("rowspan"));
          while (rowspan > 1) {
            var nRow = header[i + rowspan - 1];
            if (!nRow) nRow = header[i + rowspan - 1] = [];
            nRow[j] = "";
            rowspan--;
          }
        });
      });

      var content = "";
      for (var r = 0; r < header.length; r++) {
        var rowC = "";
        var rowD = header[r];
        for (var c = 0; c < rowD.length; c++) {
          if (colInfo[c].noExport) continue;
          rowC += "," + (rowD[c] || "");
        }
        content += rowC.substring(1).replace(/\r?\n|\r/g, " ") + "\r\n";
      }
      return content;
    }
  }

  /**
  * Export the given content to CSV file.
  * 
  * @constructor
  *
  * @param {string} content
  *   The content to be exported.
  * @param {string} fileName
  *   The name of the file to be exported.
  * @param {string} mimeType
  *   (optional) The mime type of the file to be exported.
  */
  exportCsv(content: string, fileName: string, mimeType?: string) {
    var a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';
    var ind = fileName.toLowerCase().lastIndexOf(".csv");
    if (ind == -1 || ind == fileName.length - 4) fileName += ".csv";
    if (navigator.msSaveBlob) { // IE10
      return navigator.msSaveBlob(new Blob([content], { type: mimeType }), fileName);
    } else if ('download' in a) { //html5 A[download]
      a.href = 'data:' + mimeType + ',' + encodeURIComponent(content);
      a.setAttribute('download', fileName);
      document.body.appendChild(a);
      setTimeout(function () {
        a.click();
        document.body.removeChild(a);
      }, 66);
      return true;
    }
    else { //do iframe dataURL download (old ch+FF):
      var f = document.createElement('iframe');
      document.body.appendChild(f);
      f.src = 'data:' + mimeType + ',' + encodeURIComponent(content);
      setTimeout(function () { document.body.removeChild(f); }, 333);
      return true;
    }
  }
}
