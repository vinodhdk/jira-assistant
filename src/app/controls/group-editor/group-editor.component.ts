import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { JiraService, FacadeService } from 'app/services';

@Component({
  selector: 'app-group-editor',
  templateUrl: './group-editor.component.html'
})
export class GroupEditorComponent implements OnInit {
  @ViewChild('userSuggestion')
  userSuggestion: any
  newGroupName: string

  @Input()
  groups: any[]
  selectedGroup: any

  @Output()
  onDone = new EventEmitter<boolean>();

  saveInProg: boolean

  selectedUsers: any[]
  userList: any[]
  isPlugged: boolean
  mode_groupAdd: boolean

  constructor(private $jira: JiraService, private $facade: FacadeService) {
    this.selectedGroup = { name: 'Loading...', users: [] };
  }

  ngOnInit() {
    setTimeout(() => {
      if (!this.groups) {
        this.$facade.getUserGroups().then(grps => {
          this.setDefaultGroup(grps);
        });
      }
      else {
        this.selectedGroup = this.groups[0];
        this.isPlugged = true;
      }
    }, 400);
  }

  private setDefaultGroup(grps: any[]) {
    this.groups = grps && grps.length > 0 ? grps.Select() : [{ name: 'Default group: No name set', users: [] }];
    this.selectedGroup = this.groups[0];
  }

  searchUsers($event) {
    return this.$jira.searchUsers($event.query).then(u => {
      this.userList = u;
      this.userSuggestion.show();
    });
  }

  addNewGroup(groupName: string): boolean {
    groupName = groupName.trim();

    if (this.groups.Any(g => g.name.toLowerCase() === groupName.toLowerCase())) {
      // ToDo: Show error message
      return false;
    }
    else {
      this.selectedGroup = this.groups.Add({ name: groupName, users: [] });
      this.groups = this.groups.Select();
      return true;
    }
  }

  updateGroupName(groupName: string): boolean {
    groupName = groupName.trim();
    if (this.groups.Any(g => g.name.toLowerCase() === groupName.toLowerCase() && g != this.selectedGroup)) {
      // ToDo: Show error message
      return false;
    }
    else {
      this.selectedGroup.name = groupName;
      this.groups = this.groups.Select();
      return true;
    }
  }

  deleteGroup() {
    this.groups.Remove(this.selectedGroup);
    this.setDefaultGroup(this.groups);
  }

  addUsers(): void {
    this.selectedGroup.users.AddRange(this.selectedUsers);
    this.clearUsers();
  }

  removeUser(user): void {
    this.selectedGroup.users.Remove(user);
  }

  clearUsers(): void {
    this.selectedUsers = [];
  }

  saveGroups(): void {
    this.saveInProg = true;
    this.$facade.saveUserGroups(this.groups).then(u => this.saveInProg = false);
  }

  done(): void { this.onDone.emit(true); }
}
