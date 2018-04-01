import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { IUser, ISavedFilter, IWorklog } from '../common/interfaces';

@Injectable()
export class DatabaseService extends Dexie {
  users: Dexie.Table<IUser, number>;
  savedFilters: Dexie.Table<ISavedFilter, number>;
  //settings: Dexie.Table<ISettings, number>;
  worklogs: Dexie.Table<IWorklog, number>;

  constructor() {
    super("JiraAssist");

    this.version(1).stores({
      users: '++id,jiraUrl,userId',
      savedFilters: '++id,queryName,createdBy',
      settings: '[name+userId],name,userId',
      worklogs: '++id,createdBy,isUploaded,dateStarted,worklogId,ticketNo',
      events: '++id,createdBy,name,ticketNo,startTime,isEnabled,source,sourceId'
    });


    // Open the database
    this.open().catch((error) => {
      console.error(error);
    });

    // Database is being initialized for the first time
    this.users.get(1).then((user) => {
      if (!user) {
        this.transaction('rw', this.users, () => {
          this.users.add({ jiraUrl: 'SystemUser', userId: 'SystemUser' });
        }).catch((e) => { console.error("Unable to initialize the database:-" + e.stack); });
      }
    });

    window.addEventListener('unhandledrejection', (err) => { console.error("DB Error caught in listener: ", err); });
    //database.on("error", (err) => { console.error("DB Error caught in handler: ", err); });
  }
}
