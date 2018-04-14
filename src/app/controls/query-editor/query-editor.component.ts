import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery'
import { FacadeService } from '../../services/facade.service';
import { JiraService } from '../../services/jira.service';
import { AnalyticsService } from '../../services/analytics.service';
import { MessageService } from '../../services/message.service';
import { getDateRange } from '../../_constants';

@Component({
  selector: '[jaQueryEditor]',
  templateUrl: './query-editor.component.html'
})
export class QueryEditorComponent implements OnInit {

  @Input('query')
  ngModel: any

  @Output()
  viewReport: EventEmitter<any>

  @Output('onSave')
  jaSave: EventEmitter<any>

  jiraFields: any[]

  filterFields: any[]
  displayFields: any[]
  selectedFilterField: any
  selectedDisplayField: any
  newQueryName: string

  isFullScreen: boolean
  //reportRequest: any
  //savedQueries: any[]
  queryList: any[] // For dropdown
  selQueryId: number

  showSaveDialog: boolean
  copyQuery: boolean

  private groupIgnore: string[]

  constructor(private $jaFacade: FacadeService, private $jaDataSvc: JiraService, private $jaAnalytics: AnalyticsService, private message: MessageService) {
    this.viewReport = new EventEmitter<any>();
    this.jaSave = new EventEmitter<any>();
    this.groupIgnore = ['issuekey', 'summary', 'description'];
    this.initModel();
  }

  initModel(clear?: boolean) {
    if (!this.ngModel || clear) {
      this.ngModel = { fields: {}, filterFields: [], outputFields: [] };
    }
    else if (!this.ngModel.fields) {
      this.ngModel.fields = {};
    }

    this.ngModel.filterFields = this.ngModel.filterFields || [];
    this.ngModel.outputFields = this.ngModel.outputFields || [];
  }

  ngOnInit() {
    this.$jaDataSvc.getCustomFields().then(data => this.processJson(data));
    this.fillQueriesList();
    //this.$jaFacade.getSavedQuery(value).then( (result)=> {
    //  this.reportRequest = result;
    //});
  }

  fillQueriesList() {
    return this.$jaFacade.getSavedFilters().then((result) => {
      //this.savedQueries = result;
      this.queryList = result.Select(q => { return { value: q.id, label: q.queryName } });
      //this.selQueryId = this.reportRequest.id //ToDo:|| queryList.selectpicker('val');
    });
  }

  //this.sortOpt = {
  //  update: function (e, ui) {
  //    var sortable = ui.item.sortable;
  //    var item = sortable.model;
  //    var targItem = this.ngModel.outputFields[sortable.dropindex] || this.ngModel.outputFields[sortable.dropindex - 1];
  //    if (targItem) {
  //      item.groupBy = targItem.groupBy;
  //    }
  //    //ui.item.sortable.cancel();
  //  }
  //};

  private generateJql() {
    var query = [];
    var fields = this.ngModel.filterFields;

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var val: string = field.value;

      var clause = field.clauseName;
      var val2 = field.value2;

      if (val2) { val2 = '"' + val2.trim() + '"'; }
      if (clause.indexOf(' ') > -1) { clause = '"' + clause + '"'; }

      if (Array.isArray(field.valueArr) && field.valueArr.length > 0) {
        val = field.valueArr.Select((v) => { if (v) { return '"' + v.trim() + '"'; } }).join(',');
      }
      else if (field.quickDate) {
        var range: Date[] = getDateRange(field.quickDate);
        val = range[0].format('yyyy-MM-dd');
        val2 = range[1].format('yyyy-MM-dd');
      }
      else if (typeof val === "string") {
        val = '"' + val.trim() + '"';
      }

      if (val) {
        query.Add(field.operator.format([clause, val, val2]));
      }
    }
    return query.join(' AND ');
  }


  removeField(arr, field) { arr.Remove(field); }

  isSaveEnabled() {
    return this.ngModel.jql && this.ngModel.jql.trim().length > 10
      && this.ngModel.outputFields && this.ngModel.outputFields.length >= 1;
  }

  saveQuery(queryName?: string, copy?: boolean) {
    var oldQryName = this.ngModel.queryName;
    if (queryName) {
      var oldQryId = this.ngModel.id;
      this.ngModel.queryName = queryName;
      if (copy) {
        delete this.ngModel.id;
      }

      this.$jaFacade.saveQuery(this.ngModel).then((result) => {
        this.ngModel.id = result;
        this.selQueryId = this.ngModel.id;
        this.showSaveDialog = false;
        this.jaSave.emit();
        this.fillQueriesList();
        this.message.success("Query saved successfully!");
        this.$jaAnalytics.trackEvent("Query Saved");
      }, (err) => {
        this.ngModel.id = oldQryId;
        this.selQueryId = this.ngModel.id;
        if (err && err.message) { this.message.error(err.message); }
      });
    }
    else {
      this.newQueryName = oldQryName;
      this.showSaveDialog = true;
    }
  }

  groupField(row, $index: number) {
    var grpBy = !row.groupBy;
    var list = this.ngModel.outputFields;
    if (grpBy) {
      for (var i = 0; i < $index; i++) {
        list[i].groupBy = grpBy;
      }
    }
    else {
      for (var i = $index + 1; i < list.length; i++) {
        list[i].groupBy = grpBy;
      }
    }
  }

  private getField(field, filter) {
    var obj: any = { id: field.id, name: field.name, custom: field.custom };
    if (filter) {
      obj.clauseName = field.clauseNames[0];
    }
    var schema = field.schema || {};
    var type = schema.type || "(Unsupported)";
    var system = schema.system;
    var items = schema.items;
    if (field.id === "issuekey") { obj.type = "string"; return obj; }
    switch (type) {
      case "user":
        obj.knownObj = true;
      case "string": case "date": case "datetime":
      case "(Unsupported)":
        obj.type = type;
        break;

      case "number":
        switch (system) {
          case "timeoriginalestimate": case "aggregatetimespent":
          case "aggregatetimeoriginalestimate": case "workratio":
          case "timespent": case "timeestimate": case "aggregatetimeestimate":
            obj.type = "seconds";
            break;
          default: obj.type = type; break;
        }
        break;

      case "issuetype": case "priority": case "project":
      case "progress": case "comments-page": case "resolution": case "securitylevel":
      case "status": case "timetracking": case "votes": case "watches":
        obj.knownObj = true;
        obj.type = system;
        break;

      case "array":
        obj.isArray = true;
        if (!field.custom) {
          switch (system) {
            case "versions": case "fixVersions": case "attachment": case "components":
            case "issuelinks": case "subtasks":
              obj.knownObj = true;
              obj.type = items || system;
              break;
            case "worklog":
              obj.type = items || system;
              obj.isArray = false;
              break;
            case "labels":
              obj.type = items || system;
              break;
            default: obj.type = JSON.stringify(field); break;
          }
        }
        else {
          switch (items) {
            case "user":
              obj.knownObj = true;
            case "string": case "date": case "datetime": case "numeric":
            case "option":
              obj.type = items;
              break;

            default: obj.type = JSON.stringify(field); break;
          }
        }
        break;

      default: obj.type = JSON.stringify(field); break;
    }
    //"schema":{"type":"array","items":"version","system":"versions"}
    return obj;
  }

  filterAdded(event) {
    if (!event || !event.value) return;
    var field = this.jiraFields.First((f) => f.id == event.value);
    this.ngModel.filterFields.Add(this.getField(field, true));
    this.selectedFilterField = '';
  }

  displayFieldAdded(event) {
    if (!event || !event.value) return;
    var field = this.jiraFields.First((f) => f.id == event.value);
    this.ngModel.outputFields.Add(this.getField(field, false));
    this.selectedDisplayField = null;
  }

  private processJson(data) {
    this.jiraFields = data;
    var favoriteFilters = ['key', 'assignee', 'created', 'creator', 'issue type', 'labels', 'project', 'reporter', 'resolution', 'resolved', 'status', 'summary', 'updated', 'sprint'];
    var basicFields = [], customFields = [];
    data.ForEach(f => {
      f.label = f.name + (f.name.toLowerCase() != f.id.toLowerCase() ? ' (' + f.id + ')' : '')
      f.value = f.id;

      if (f.custom) { customFields.Add(f); }
      else { basicFields.Add(f); }
    });

    basicFields = basicFields.OrderBy((f) => f.name);
    customFields = customFields.OrderBy((f) => f.name);

    this.filterFields = [
      {
        label: 'Basic Fields',
        items: basicFields.Where((f) => f.clauseNames && f.clauseNames.length > 0)
      },
      {
        label: 'Custom Fields',
        items: customFields.Where((f) => f.clauseNames && f.clauseNames.length > 0)
      }
    ];

    this.displayFields = [{
      label: 'Basic Fields',
      items: basicFields
    }, { label: 'Custom Fields', items: customFields }]; // false
  }

  columnReordered(event) {
    var item = event.value;
    var drpIdx = event.dropIndex;
    var targItem = this.ngModel.outputFields[drpIdx + 1] || this.ngModel.outputFields[drpIdx - 1];
    if (targItem) {
      item.groupBy = targItem.groupBy;
    }
  }

  //private getOptionTags(data, group, forFilter) {
  //  if (forFilter) { data = data.Where((f) => { return f.clauseNames && f.clauseNames.length > 0; }); }
  //  var html = data.OrderBy((f) => { return f.name; })//.Where( (f) =>{ return f.searchable; })
  //    .Select((f) => { return '<option value="' + f.id + '"' + (f.name.toLowerCase() != f.id.toLowerCase() ? ' data-subtext="(' + f.id + ')"' : '') + '>' + f.name + '</option>'; }).join('');
  //  if (group)
  //    return '<optgroup label="' + group + '">' + html + '</optgroup>';
  //  else
  //    return html;
  //}

  updateJql() {
    if (this.ngModel.filterFields && this.ngModel.filterFields.length > 0) {
      this.ngModel.jql = this.generateJql();
    }
  }

  tabChanged(event) {
    if (event.index == 1) { this.updateJql(); }
  }

  queryChanged() {
    this.$jaFacade.getSavedQuery(this.selQueryId).then(q => this.ngModel = q);
  }

  deleteQuery() {
    this.$jaFacade.deleteSavedQuery(this.selQueryId).then(q => {
      this.message.success('Selected query deleted successfully!');
      this.selQueryId = null;
      this.initModel(true);
      this.fillQueriesList();
    });
  }
}
