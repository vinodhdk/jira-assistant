
export interface IUser {
  id?: number
  jiraUrl: string
  userId: string
  favTicketList?: string[]
  team?: any
  autoUpload?: boolean
  dateFormat?: string
  maxHours?: number
  taskLogEnabled?: boolean
  timeFormat?: string
  workingDays?: Array<number>
  uploadLogBy?: any
  googleIntegration?: any
  notifyWL?: boolean
  meetingTicket?: string
  pruneInterval?: number
  trackBrowser?: boolean
  startOfDay?: any
  endOfDay?: any
  highlightVariance?: boolean
  launchAction?: any
  dataStore?: any
  autoLaunch?: number
  notifyBefore?: number
  checkUpdates?: number
  settings?: any
  groups?: IUserGroup[]
  dashboards?: IDashboard[]
}

export interface ISessionUser {
  jiraUrl: string
  jiraUser: any
  profileUrl: string
  ticketViewUrl: string
  displayName: string
  emailAddress: string

  userId: number
  name: string
  dateFormat: string
  timeFormat: string
  workingDays: Array<number>
  startOfDay: any
  endOfDay: any
  notifyWL: boolean
  maxHours: number
  meetingTicket?: string
  team: any[]
  settings?: any
  gIntegration?: any
  hasGoogleCreds?: boolean
  pruneInterval?: number
  feedbackUrl: string
  groups?: IUserGroup[]
  dashboards: IDashboard[]
}

export interface IUserGroup { name: string, users: any[] }
export interface IWidget { name: string, settings?: any }
export interface IDashboard { name: string, icon: string, isQuickView: boolean, layout: number, widgets: IWidget[] }

export interface ISavedFilter {
  id?: number
  queryName: string
  createdBy: number
  isEnabled: boolean
  dateCreated: Date
  filterFields: any[]
  outputFields: any[]
}

//export interface ISettings {
//  name?: string
//  userId?: number
//}

export interface IWorklog {
  id?: number
  createdBy: number
  isUploaded: boolean
  dateStarted: Date
  worklogId?: number
  ticketNo: string
  timeSpent?: any
  overrideTimeSpent?: any
  parentId?: any
  description: string
}

export interface IValueLabel {
  value: string
  label: string
}
