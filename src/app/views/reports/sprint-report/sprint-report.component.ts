import { Component, OnInit } from '@angular/core';
import { JiraService, UtilsService } from '../../../services/index';
import * as $ from 'jquery'

@Component({
  selector: 'app-sprint-report',
  templateUrl: './sprint-report.component.html'
})
export class SprintReportComponent implements OnInit {
  rapidViews: any[]
  filteredRapidViews: any[]
  selectedRapidViews: any[]
  selectedRapidIds: number[]

  sprints: any[]
  filteredSprints: any[]
  selectedSprints: any[]
  selectedSprintIds: number[]

  sprintDetails: any[]
  rapidViewLoading: boolean
  isFullScreen: boolean
  isLoading: boolean

  constructor(private $jaDataSvc: JiraService, private $utils: UtilsService) {
    this.selectedRapidIds = [];
    this.selectedSprintIds = [];
    this.selectedSprints = [];
  }

  ngOnInit() {
    this.rapidViewLoading = true;
    return this.$jaDataSvc.getRapidViews().then((views) => {
      this.rapidViewLoading = false;
      this.rapidViews = views.OrderBy((d) => { return d.name; }).Select((d) => {
        return { name: d.name, id: d.id };
      });
    });
  }

  searchRapidView($event) {
    var query = ($event.query || '').toLowerCase();
    this.filteredRapidViews = this.rapidViews.Where(r => (r.name.toLowerCase().indexOf(query) >= 0 || r.id.toString().startsWith(query))
      && this.selectedRapidIds.indexOf(r.id) == -1);
  }

  rapidViewChanged() {
    this.selectedRapidIds = this.selectedRapidViews.Select(r => r.id);
    this.$jaDataSvc.getRapidSprintList(this.selectedRapidIds).then((sprints) => {
      this.sprints = sprints.OrderByDescending(s => s.id);
    });
    this.selectedSprints.RemoveAll(s => this.selectedRapidIds.indexOf(s.rapidId) == -1);
    this.sprintChanged();
  }

  searchSprints($event) {
    var query = ($event.query || '').toLowerCase();
    this.filteredSprints = this.sprints.Where(r => (r.name.toLowerCase().indexOf(query) >= 0 || r.id.toString().startsWith(query))
      && this.selectedSprintIds.indexOf(r.id) == -1);
  }

  sprintChanged() {
    this.selectedSprintIds = this.selectedSprints.Select(r => r.id);
  }

  generateReport() {
    var selectedItems = this.selectedSprints;
    if (selectedItems.length == 0) { return; }

    this.isLoading = true;
    var arr = selectedItems.Select((sprint) => {
      if (sprint.report) { return Promise.resolve(sprint.report); }
      return this.$jaDataSvc.getRapidSprintDetails(sprint.rapidId, sprint.id).then(det => sprint.report = det);
    });

    Promise.all(arr).then((result: any[]) => {
      this.isLoading = false;
      this.sprintDetails = result;

      var getCountWithSP = (issues) => { return issues.Count((issue) => { return issue.currentEstimateStatistic.statFieldValue.value; }) }

      result.ForEach((sprint) => {
        let added = 0, removed: any = 0, addedWithSP = 0;
        var jiraKeysList = sprint.contents.issueKeysAddedDuringSprint;
        var keys = Object.keys(jiraKeysList);

        keys.ForEach((key) => {
          if (jiraKeysList[key] === true) {
            added += 1;
          }
          else { removed += 1; }
        });

        var addedSP = 0, addedSPOld = 0;

        var processAdded = (issue) => {
          issue.addedLater = jiraKeysList[issue.key] === true;
          issue.removedLater = jiraKeysList[issue.key] === false;

          issue.currentSP = issue.currentEstimateStatistic.statFieldValue.value || 0;
          issue.oldSP = issue.estimateStatistic.statFieldValue.value || 0;

          if (issue.addedLater) {
            addedSP += issue.currentSP;
            addedSPOld += issue.oldSP;
          }

          if (issue.oldSP == issue.currentSP) {
            delete issue.oldSP;
            if (!issue.currentSP) {
              delete issue.currentSP;
            }
          }

          if (issue.currentSP && issue.addedLater) { addedWithSP += 1; }
        };

        sprint.contents.completedIssues.ForEach(processAdded);
        sprint.contents.puntedIssues.ForEach(processAdded);
        sprint.contents.issuesNotCompletedInCurrentSprint.ForEach(processAdded);

        sprint.addedSP = addedSP || '';
        sprint.addedSPOld = addedSPOld && addedSPOld != addedSP ? addedSPOld : null;

        let completedModified = sprint.contents.completedIssuesInitialEstimateSum.value;
        let completed = sprint.contents.completedIssuesEstimateSum.value;
        sprint.completedSP = completed || '';
        sprint.completedSPOld = completedModified && completedModified != completed ? completedModified : null;
        sprint.completedWithSP = getCountWithSP(sprint.contents.completedIssues);
        sprint.CompletedTotal = sprint.contents.completedIssues.length;

        let incompletedModified = sprint.contents.issuesNotCompletedInitialEstimateSum.value;
        let incompleted = sprint.contents.issuesNotCompletedEstimateSum.value || '';
        sprint.incompletedSP = incompleted;
        sprint.incompletedSPOld = incompletedModified && incompletedModified != incompleted ? incompletedModified : null;
        sprint.incompletedWithSP = getCountWithSP(sprint.contents.issuesNotCompletedInCurrentSprint);
        sprint.incompletedTotal = sprint.contents.issuesNotCompletedInCurrentSprint.length;

        let removedModified = sprint.contents.puntedIssuesInitialEstimateSum.value;
        removed = sprint.contents.puntedIssuesEstimateSum.value || ''; // ToDo: Need to check
        sprint.removedSP = removed;
        sprint.removedSPOld = removedModified && removedModified != removed ? removedModified : null;
        sprint.removedWithSP = getCountWithSP(sprint.contents.puntedIssues);
        sprint.removedTotal = sprint.contents.puntedIssues.length;

        sprint.addedIssues = added;
        sprint.addedWithSP = addedWithSP;
        sprint.removedIssues = removed;

        sprint.totalIssuesSPOld = (sprint.completedSPOld || 0) + (sprint.incompletedSPOld || 0);
        sprint.totalIssuesSP = (sprint.completedSP || 0) + (sprint.incompletedSP || 0);

        sprint.totalIssuesCount = sprint.CompletedTotal + sprint.incompletedTotal;
        sprint.totalIssuesWithSP = sprint.completedWithSP + sprint.incompletedWithSP;

        if (sprint.totalIssuesSPOld == sprint.totalIssuesSP) {
          delete sprint.totalIssuesSPOld;
          if (!sprint.totalIssuesSP) {
            delete sprint.totalIssuesSP;
          }
        }

        //(completed + not completed  + removed) - added
        // Issue with sprint 21 & 22

        sprint.estimateIssuesSPOld = ((sprint.completedSPOld || 0) + (sprint.incompletedSPOld || 0) + (sprint.removedSPOld || 0)) - (sprint.addedSPOld || 0);
        sprint.estimateIssuesSP = ((sprint.completedSP || 0) + (sprint.incompletedSP || 0) + (sprint.removedSP || 0)) - (sprint.addedSP || 0);

        sprint.estimateIssuesCount = (sprint.CompletedTotal + sprint.incompletedTotal + sprint.removedTotal) - sprint.addedIssues;
        sprint.estimateIssuesWithSP = (sprint.completedWithSP + sprint.incompletedWithSP + sprint.removedWithSP) - sprint.addedWithSP;

        if (sprint.estimateIssuesSPOld == sprint.estimateIssuesSP) {
          delete sprint.estimateIssuesSPOld;
          if (!sprint.estimateIssuesSP) {
            delete sprint.estimateIssuesSP;
          }
        }

        sprint.expanded = result.length === 1;
        var link = $(sprint.lastUserToClose)
          .attr('target', '_blank');
        link = link.attr('href', this.$utils.mapJiraUrl(link.attr('href')));
        sprint.lastUserToClose = $("<div/>").append(link).html();
      });
    });
  }

}
