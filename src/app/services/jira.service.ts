import { Injectable } from '@angular/core';
import { AjaxService } from './ajax.service';
import { CacheService } from './cache.service';
import { MessageService } from './message.service';
import { SessionService } from './session.service';
import { ApiUrls } from '../_constants';
import * as moment from 'moment';

@Injectable()
export class JiraService {
  public CurrentUser: any

  constructor(private $jaHttp: AjaxService, private $jaCache: CacheService, private message: MessageService, private $session: SessionService) { }

  public searchTickets(jql: string, fields: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.$jaHttp.post(ApiUrls.search, { jql: jql, fields: fields, maxResults: 2000 })
        .then((result) => {
          var issues = result.issues;
          if (result.maxResults < result.total) {
            this.message.warning("Your filter returned " + result.total + " tickets but only first " + result.maxResults + " were fetched!");
          }

          if (fields.indexOf("worklog") > -1) {
            var prevCount = issues.length;
            var retryCount = 3;

            var cback = (remaining, isus) => {
              if (remaining === 0) { resolve(issues); }
              else if (prevCount > remaining || --retryCount >= 0) {
                prevCount = remaining;
                this.fillWorklogs(isus, cback);
              }
              else { reject(null); }
            };
            cback(false, issues);
            retryCount = 3;
          }
          else { resolve(issues); }
        });
    });
  }

  public getWorklogs(jiraKey: string) {
    return this.$jaHttp.get(ApiUrls.issueWorklog, jiraKey);
  }

  getCustomFields() {
    return this.$jaCache.session.getPromise("customFields").then((value) => {
      if (value) {
        return value;
      }

      return this.$jaHttp.get(ApiUrls.getCustomFields, { customHandle: true })
        .then((result) => { this.$jaCache.session.set("customFields", result, 10); return result; });
    });
  }

  getRapidViews() {
    var value = this.$jaCache.session.get("rapidViews");
    if (value) {
      return new Promise((resolve, reject) => resolve(value));
    }
    
    return this.$jaHttp.get(ApiUrls.rapidViews, { customHandle: true })
      .then((result) => { this.$jaCache.session.set("rapidViews", result.views, 10); return result.views; });
  }

  getRapidSprintList(rapidIds) {
    var reqArr = rapidIds.Select((rapidId) => {
      return this.$jaCache.session.getPromise("rapidSprintList" + rapidId).then((value) => {
        if (value) {
          return value;
        }

        return this.$jaHttp.get(ApiUrls.rapidSprintList, rapidId)
          .then((result) => {
            var sprints = result.sprints.ForEach((sp) => { sp.rapidId = rapidId; });
            this.$jaCache.session.set("rapidSprintList" + rapidId, sprints, 10); return sprints;
          });
      });
    });

    return Promise.all(reqArr).then((results) => { return results.Union(); });
  }

  getSprintList(projects) {
    if (Array.isArray(projects)) { projects = projects.join(); }
    return this.$jaCache.session.getPromise("sprintListAll" + projects).then((value) => {
      if (value) {
        return value;
      }

      return this.$jaHttp.get(ApiUrls.sprintListAll, projects)
        .then((result) => { this.$jaCache.session.set("sprintListAll" + projects, result.sprints, 10); return result.sprints; });
    });
  }

  getRapidSprintDetails(rapidViewId, sprintId) {
    return this.$jaHttp.get(ApiUrls.rapidSprintDetails, rapidViewId, sprintId);
  }

  getOpenTickets(refresh?: boolean): Promise<any> {
    if (!refresh) {
      var value = this.$jaCache.session.get("myOpenTickets");
      if (value) {
        return new Promise((resolve, reject) => { resolve(value); });
      }
    }

    return this.searchTickets("assignee=currentUser() AND resolution=Unresolved order by updated DESC",
      ["issuetype", "summary", "reporter", "priority", "status", "resolution", "created", "updated"])
      .then((result) => { this.$jaCache.session.set("myOpenTickets", result); return result; });
  }

  searchUsers(text: string) { return this.$jaHttp.get(ApiUrls.searchUser, text); }

  private fillWorklogs(issues, callback) {
    var issues = issues.Where((iss) => !iss.fields.worklog || !iss.fields.worklog.worklogs || iss.fields.worklog.worklogs.length < iss.fields.worklog.total);
    var pendCount = issues.length;
    var successCount = 0;
    if (pendCount > 3) { pendCount = 3; }

    console.log("FillStarted:- " + issues.length + " tickets found");

    for (var i = 0; i < pendCount; i++) {
      this.fillWL(issues[i]).then((res) => { if (res) successCount++; }).then(() => {
        if (--pendCount == 0) { callback(issues.length - successCount, issues); }
      });
    }
    if (issues.length === 0) { callback(issues.length); }
  }

  private fillWL(issue): Promise<any> {
    console.log("Started fetching worklog for " + issue.key);
    return this.getWorklogs(issue.key).then((res) => {
      console.log("Success fetching worklog for " + issue.key);
      issue.fields.worklog = res;
      return true;
    }, () => { console.log("Failed fetching worklog for " + issue.key); return false; });
  }

  getCurrentUser(): any {
    return this.$jaHttp.get(ApiUrls.mySelf).then(null, (e) => {
      if (e.status == 401) {
        this.message.warning("You must be authenticated in Jira to access this tool. Please authenticate in Jira and then retry.", "Unauthorized");
      }
      else if (e.error && e.error.message) { this.message.warning(e.error.message, "Server error"); }
      else { this.message.warning(e.status + ":- " + e.statusText, "Unknown error"); }
      return Promise.reject(e);
    });
  }
}
