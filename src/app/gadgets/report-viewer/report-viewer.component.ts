import { Component, OnChanges, Input, ElementRef, Pipe } from '@angular/core';
import { BaseGadget } from '../base-gadget';
import { JiraService } from '../../services/jira.service';
import { AnalyticsService } from '../../services/analytics.service';
import * as $ from 'jquery'
import { DataTransformService } from '../../services/data-transform.service';
import { FacadeService } from '../../services/facade.service';

@Component({
  selector: '[jaReportViewer]',
  templateUrl: './report-viewer.component.html'
})
export class ReportViewerComponent extends BaseGadget implements OnChanges {
  @Input('queryModel')
  queryModel: any

  @Input()
  queryId: number

  isLoading: boolean

  private dataFields: any[]
  private headerFields: any[]
  private displayFields: any[]
  private groupList: any[]
  private subFields: any[]
  private fieldOpts: any
  hasReportData: boolean
  reportHtml: string

  constructor(el: ElementRef, private $facade: FacadeService, private $jaDataSvc: JiraService, private $jaAnalytics: AnalyticsService, private dataTransform: DataTransformService) {
    super(el, 'Query report viewer', 'fa-clock-o')
    this.queryModel = {};
  }

  ngOnChanges(change) {
    if ((change.queryModel && change.queryModel.currentValue)
      || (change.queryId && change.queryId.currentValue)) {
      this.title = this.queryModel.queryName;
      this.refreshReport();
    }
    else {
      this.queryModel = {};
    }
  }

  refreshReport() {
    if (this.queryId > 0) {
      this.$facade.getSavedQuery(this.queryId).then(qm => {
        this.queryModel = qm;
        this.fillReport();
      });
    }
    else if (this.queryModel) {
      this.fillReport();
    }
  }

  fillReport() {
    var model = this.queryModel;

    if (!model.jql || !model.outputFields || !model.outputFields.length) {
      return;
    }
    this.isLoading = true;
    //this.showReport = true;
    this.dataFields = model.outputFields.Select((f) => f.id);

    this.$jaDataSvc.searchTickets(model.jql, this.dataFields)
      .then((issues) => {
        this.headerFields = model.outputFields.Select((f) => {
          var txt = f.name;
          if (f.functions && f.functions.header) {
            txt = f.functions.header.replace('{0}', txt);
          }
          return { text: txt, rowspan: 2 };
        });
        this.processIssues(issues);
        this.displayFields = this.headerFields;
        var subHeads = [];
        this.headerFields.Where((f) => { return f.subCols && f.subCols.length > 0; })
          .ForEach((f) => {
            subHeads.AddRange(f.subCols);
            subHeads.Add({ text: "Total" });
            f.colspan = f.subCols.length + 1;
            f.rowspan = 1;
          });
        this.subFields = subHeads;
        this.groupList = model.outputFields.Where((f) => { return f.groupBy; });
        var groupedData = this.groupList.length > 0 ? this.groupData(issues, Array.from(this.groupList)) : issues;
        this.dataFields = model.outputFields.Where((f) => { return !f.groupBy; });
        this.reportHtml = this.genHtmlRow(groupedData);
        //var tbody = $("#tbody").html(this.genHtmlRow(groupedData));
        this.hasReportData = groupedData.length > 0;
        //setTimeout( () =>{ tbody.closest("table").bootstrapTable({ height: 400 }) }, 1000);
        this.onResize({});
      }).then(() => {
        this.isLoading = false;
        this.$jaAnalytics.trackEvent("Generated report");
      });
  }

  private genHtmlRow(arr: any, prepn?: any) {
    prepn = prepn || "";
    var html = "";

    for (var i = 0; i < arr.length; i++) {
      var obj = arr[i];
      if (obj.subGroups) {
        html += this.genHtmlRow(obj.subGroups,
          (i === 0 ? prepn : "") + this.getGroupedTD(obj.name, obj.issueCount)
        );
      }
      else {
        var issues = obj.issues || [obj];
        for (var j = 0; j < issues.length; j++) {
          html += "<tr>";

          if (i === 0 && j === 0) {
            html += prepn;
          }

          if (j === 0 && obj.issues) {
            html += this.getGroupedTD(obj.name, issues.length);
          }
          var issue = issues[j];
          var issFields = issue.fields;

          for (var z = 0; z < this.dataFields.length; z++) {
            var df = this.dataFields[z];
            if (df.functions && df.functions.useArray) {
              if (j === 0) {
                if (df.id === "issuekey") {
                  html += this.getAggregateTD(issues.Select((iss) => { return iss.key; }, true), df.functions);
                }
                else {
                  html += this.getAggregateTD(issues.Select((iss) => { return iss.fields[df.id]; }, true), df.functions);
                }
              }
            }
            else {
              if (df.id === "worklog") {
                var hdrLst = this.fieldOpts.worklogUsers;
                var wls = issFields.worklogs_proc;
                var totalTimeSpent = 0;
                for (var hi = 0; hi < hdrLst.length; hi++) {
                  if (wls) {
                    var wl = wls[hdrLst[hi].id];
                    if (wl) {
                      totalTimeSpent += wl.timespent;
                      html += this.getTD(wl.timespent, df.functions);
                      continue;
                    }
                  }
                  else {
                    html += this.getTD("#Error");
                    continue;
                  }
                  html += this.getTD();
                }
                if (totalTimeSpent) {
                  html += this.getTD(totalTimeSpent, df.functions);
                } else {
                  html += this.getTD();
                }
              } else {
                html += this.getTD(df.id !== "issuekey" ? issFields[df.id] : issue.key, df.functions);
              }
            }
          }

          html += "</tr>";
        }
      }
    }

    return html;
  }

  private getTD(obj?: any, funcInfo?: any) {
    if (obj == null)
      return '<td>&nbsp;</td>';
    return '<td>' + this.execute(obj, funcInfo) + '</td>';
  }

  private getAggregateTD(arr, funcInfo) {
    return '<td class="bold" rowspan="' + arr.length + '">' + this.execute(arr, funcInfo) + '</td>';
  }

  private getGroupedTD(text, len) {
    text += " (" + len + ")";
    var rotate = len > 4 || (text.length / len) < 2.5;
    return '<td class="' + (rotate ? 'rotateM90' : 'bold') + '" rowspan="' + len + '">&nbsp;<div>' + text + '</div></td>';
  }

  private groupData(issues, groups) {
    if (!groups || !groups.length) { return issues; }
    var group = groups[0];
    var field = group.id;
    var isCustom = group.custom;
    var func = group.functions;
    groups.RemoveAt(0);
    var isAggGrp = func.useArray;

    var selectFunc = (grp) => {
      var val: any = { name: grp.key };
      var values = grp.values;

      if (groups.length > 0) {
        val.subGroups = this.groupData(values, Array.from(groups));
        val.issueCount = val.subGroups.Sum((tm) => { return tm.issueCount; });
      }
      else {
        val.issues = values;
        val.issueCount = val.issues.length;
      }
      return val;
    };

    if (isAggGrp) {
      var data = issues.Select(field === "issuekey" ? (iss) => { return iss.key; } : (iss) => { return iss.fields[field]; }, true);
      return [selectFunc({ key: this.execute(data, func), values: issues })];
    }
    else {
      return issues.GroupBy((issue) => {
        var fieldVal = issue.fields[field];
        if (!fieldVal) return fieldVal;
        return this.execute(fieldVal, func);
      }).Select((grp) => selectFunc(grp));
    }
  }

  private execute(obj, funcInfo) {
    if (!obj || !funcInfo || !funcInfo.name) { return obj; }
    var value = "#Error";
    try {
      var func: Function = this.dataTransform[funcInfo.name];
      if (!func || !func.apply) return "#Error: Func not found";
      var params = [obj].AddRange(funcInfo.params);
      value = func.apply(this, params);
    }
    catch (err) { console.error(err); }
    return value !== null ? value : "";
  }

  private processIssues(issues) {
    var wlIndex = this.dataFields.indexOf('worklog');
    if (wlIndex === -1) { return; }
    var subCols = [];
    var tmpUserIds = []; // Object to temporarily store the user id for faster searching
    this.fieldOpts = {};
    for (var iss = 0; iss < issues.length; iss++) {
      var issue = issues[iss];
      var fields = issue.fields;
      if (fields.worklog && fields.worklog.worklogs.length > 0) {
        var worklogs = fields.worklog.worklogs;
        var grp = worklogs.GroupBy((w) => {
          return { id: w.author.name, text: w.author.displayName };
        });
        var obj = {};
        for (var g = 0; g < grp.length; g++) {
          var gr = grp[g];
          var keyId = gr.key.id;
          if (tmpUserIds.indexOf(keyId) === -1) { subCols.Add(gr.key); tmpUserIds.Add(keyId); } // Store it in header if it is not available in temp list
          obj[keyId] = { timespent: gr.values.Sum((v) => { return v.timeSpentSeconds; }) };
        }
        fields.worklogs_proc = obj;
      }
      else if (fields.worklog && fields.worklog.worklogs && fields.worklog.worklogs.length == 0) {
        fields.worklogs_proc = {};
      }
    }

    var headObj = this.headerFields[wlIndex];
    headObj.subCols = subCols.OrderBy((c) => { return c.text; }); // Object for storing the user details to show in header
    this.fieldOpts.worklogUsers = headObj.subCols;
  }
}
