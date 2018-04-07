import * as moment from 'moment'

export enum ApiUrls {
  authentication = "~/rest/auth/1/session",
  getAllProjects = "~/rest/api/2/project",
  search = "~/rest/api/2/search",
  getIssue = "~/rest/api/2/issue/",
  issueWorklog = "~/rest/api/2/issue/{0}/worklog",
  individualWorklog = "~/rest/api/2/issue/{0}/worklog/{1}",
  searchUser = "~/rest/api/2/user/search?maxResults=10&startAt=0&username={0}",
  getCustomFields = "~/rest/api/2/field",
  getUserDetails = "~/rest/api/2/user?username=",
  mySelf = "~/rest/api/2/myself",
  usersForPicker = "~/rest/api/2/user/picker?maxResults=10&showAvatar=true&query=",
  rapidSprintList = "~/rest/greenhopper/1.0/sprintquery/{0}",
  rapidSprintDetails = "~/rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId={0}&sprintId={1}",
  sprintListAll = "~/rest/greenhopper/1.0/integration/teamcalendars/sprint/list?jql=project+in+({0})",
  sprintListOpen = "~/rest/greenhopper/1.0/integration/teamcalendars/sprint/list?jql=project+in+({0})+and+Sprint+not+in+closedSprints()",
  rapidViews = "~/rest/greenhopper/1.0/rapidview",

  googleLogoutUrl = "https://accounts.google.com/o/oauth2/revoke?token={0}"
};

export const dateFormats = [
  "dd-MMM-yyyy", "dd/MMM/yyyy",
  "dd-MM-yyyy", "dd/MM/yyyy",
  "MM-dd-yyyy", "MM/dd/yyyy",
  "yyyy-MM-dd", "yyyy/MM/dd",
  "MMM dd, yyyy", "ddd, MMM dd, yyyy"
];

export const timeFormats = [" HH:mm:ss", " hh:mm:ss tt", " HH.mm.ss", " hh.mm.ss tt"];

export const CHROME_WS_URL = "https://chrome.google.com/webstore/detail/jira-assistant/momjbjbjpbcbnepbgkkiaofkgimihbii";
export const FF_STORE_URL = "https://addons.mozilla.org/en-US/firefox/addon/jira-assistant/"

export const DASHBOARD_ICONS = [
  'fa fa-tachometer'
  , 'fa fa-info-circle'
  , 'fa fa-language'
  , 'fa fa-asterisk'
  , 'fa fa-gift'
  , 'fa fa-fire'
  , 'fa fa-eye'
  , 'fa fa-low-vision'
  , 'fa fa-cube'
  , 'fa fa-cubes'
  , 'fa fa-plane'
  , 'fa fa-calendar'
  , 'fa fa-tree'
  , 'fa fa-random'
  , 'fa fa-deviantart'
  , 'fa fa-database'
  , 'fa fa-folder'
  , 'fa fa-folder-open'
  , 'fa fa-bar-chart'
  , 'fa fa-life-ring'
  , 'fa fa-key'
  , 'fa fa-bookmark-o'
  , 'fa fa-futbol-o'
  , 'fa fa-certificate'
  , 'fa fa-calculator'
  , 'fa fa-tasks'
  , 'fa fa-globe'
  , 'fa fa-area-chart'
  , 'fa fa-pie-chart'
  , 'fa fa-line-chart'
  , 'fa fa-columns'
  , 'fa fa-sitemap'
  , 'fa fa-dashboard'
  , 'fa fa-desktop'
  , 'fa fa-laptop'
  , 'fa fa-flag'
  , 'fa fa-home'
  , 'fa fa-hashtag'
  , 'fa fa-info'
  , 'fa fa-tag'
  , 'fa fa-trophy'
  , 'fa fa-list-alt'
  , 'fa fa-th'
  , 'fa fa-th-list'
  , 'fa fa-th-large'
];

export const OPERATORS: IOperators[] = [
  { value: '{0} = {1}', label: 'Equals value' },
  { value: '{0} != {1}', label: 'Not equals value' },
  { value: '{0} > {1}', label: 'greater than', types: ['number', 'date', 'datetime', 'seconds'] },
  { value: '{0} >= {1}', label: 'greater than or equals', types: ['number', 'date', 'datetime', 'seconds'] },
  { value: '{0} < {1}', label: 'lesser than', types: ['number', 'date', 'datetime', 'seconds'] },
  { value: '{0} <= {1}', label: 'lesser than or equals', types: ['number', 'date', 'datetime', 'seconds'] },
  { value: '({0} >= {1} AND {0} <= {2})', label: 'between', types: ['number', 'date', 'datetime', 'seconds'], type: 'range' },
  { value: '({0} < {1} AND {0} > {2})', label: 'not between', types: ['number', 'date', 'datetime', 'seconds'], type: 'range' },
  { value: '{0} in ({1})', label: 'Contains any of', type: 'multiple' },
  { value: '{0} not in ({1})', label: 'Does not contain', type: 'multiple' }
];

interface IOperators {
  value: string
  label: string
  type?: string
  types?: string[]
}

export function getDateRange(rangeOf?: number): any[] {
  var ranges = [
    [moment().startOf('month').toDate(), moment().endOf('month').toDate()],
    [moment().subtract(1, 'months').toDate(), moment().toDate()],
    [moment().subtract(1, 'months').startOf('month').toDate(), moment().subtract(1, 'months').endOf('month').toDate()],
    [moment().startOf('week').toDate(), moment().endOf('week').toDate()],
    [moment().subtract(6, 'days').toDate(), moment().toDate()],
    [moment().subtract(1, 'weeks').startOf('week').toDate(), moment().subtract(1, 'weeks').endOf('week').toDate()]
  ];

  if (rangeOf) { return ranges[rangeOf - 1]; }
  else { return ranges }
}
