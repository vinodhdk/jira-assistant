import { Injectable } from '@angular/core';
import { ISessionUser } from '../common/interfaces';

@Injectable()
export class SessionService {
  jiraUser: any;
  userId: number;
  rootUrl: string;
  CurrentUser: ISessionUser;
  pageSettings: any;
  siteVersionNumber:string

  constructor() { }

}
