import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { JiraService, FacadeService } from 'app/services';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-group-editor',
  templateUrl: './group-editor.component.html'
})
export class GroupEditorComponent implements OnInit {
  private groupsList: any[]

  @Input() get groups() { return this.groupsList; }

  @Output() onDone = new EventEmitter<boolean>();
  @Output() groupsChange = new EventEmitter<any[]>();

  set groups(val: any[]) {
    this.groupsList = val;
    this.groupsChange.emit(val);
  }

  newName: string
  saveInProg: boolean
  userList: any[]
  @Input() isPlugged: boolean
  mode_groupAdd: boolean

  constructor(private $jira: JiraService, private $facade: FacadeService, private message: MessageService) {
  }

  ngOnInit() {
    if (!this.groups) {
      this.$facade.getUserGroups().then(grps => this.setDefaultGroup(grps));
    }
    else {
      this.isPlugged = true;
    }
  }

  private setDefaultGroup(grps: any[]) {
    this.groups = grps && grps.length > 0 ? grps.Select() : [{ name: 'Default group: No name set', users: [] }];
  }

  addUsersToGroup(group) {
    var existingUsers = group.users.Select(u => u.name.toLowerCase());
    group.selectedUsers.RemoveAll(u => existingUsers.indexOf(u.name.toLowerCase()) > -1);
    group.users.AddRange(group.selectedUsers);
    group.selectedUsers = [];
  }

  searchUsers($event) {
    return this.$jira.searchUsers($event.query).then(u => {
      this.userList = u;
      //this.userSuggestion.show();
    });
  }

  addNewGroup(groupName: string) {
    groupName = groupName.trim();

    if (this.groups.Any(g => g.name.toLowerCase() === groupName.toLowerCase())) {
      this.message.warning("The group with the name '" + groupName + "' already exists!", "Group already exists");
    }
    else {
      this.groups.Add({ name: groupName, users: [] });
      this.mode_groupAdd = false;
    }
  }

  updateGroupName(group: any, groupName: string) {
    groupName = groupName.trim();
    if (this.groups.Any(g => g.name.toLowerCase() === groupName.toLowerCase() && g != group)) {
      this.message.warning("The group with the name '" + groupName + "' already exists!", "Group already exists");
    }
    else {
      group.name = groupName;
      delete group.editMode;
    }
  }

  deleteGroup(group) {
    this.groups.Remove(group);
  }

  removeUser(group: any, user: any): void {
    group.users.Remove(user);
  }

  saveGroups(): void {
    this.saveInProg = true;
    this.groups.ForEach(g => delete g.editMode);
    this.$facade.saveUserGroups(this.groups).then(u => {
      this.saveInProg = false;
      this.message.success("Changes saved successfully!", "Group saved");
    });
  }

  done(): void { this.onDone.emit(true); }
}
