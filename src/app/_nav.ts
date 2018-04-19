/// <reference path="common/linq.extensions.ts" />
import { IDashboard } from "./common/interfaces";

export var navigation: any[] = [

  {
    title: true,
    name: 'Dashboards'
  },
  {
    name: 'Default',
    id: 'D-0',
    url: '/dashboard/0',
    icon: 'fa fa-tachometer',
    badge: {
      variant: 'info',
      text: 'NEW'
    },
    isDashboard: true
  },
  {
    title: true,
    name: 'Reports'
  },
  {
    name: 'User - Daywise',
    id: 'R-UD',
    url: '/reports/userdaywise',
    icon: 'fa fa-users'
  },
  {
    name: 'Sprint Report',
    id: 'R-SP',
    url: '/reports/sprint',
    icon: 'fa fa-history',
    badge: {
      variant: 'info',
      text: 'NEW'
    }
  },
  {
    name: 'Custom Report',
    id: 'R-CG',
    url: '/reports/customgrouped',
    icon: 'fa fa-table'
  },
  {
    title: true,
    name: 'Other'
  },
  {
    name: 'Calendar / Worklogs',
    id: 'CAL',
    url: '/calendar',
    icon: 'fa fa-calendar'
  },
  {
    title: true,
    name: 'Settings'
  },
  {
    name: 'General',
    id: 'S-GE',
    url: '/settings/general',
    icon: 'fa fa-cog'
  },
  {
    name: 'User groups',
    id: 'S-UG',
    url: '/settings/usergroups',
    icon: 'fa fa-users',
    badge: {
      variant: 'info',
      text: 'NEW'
    },
  }
];

export function updateDashboard(dashboards: IDashboard[]) {
  var toRemove = navigation.Where(m => m.isDashboard).ForEach(item => {
    delete item.name;
    item.url = '';
    delete item.icon;
    delete item.badge;
  });

  //navigation.RemoveAll(toRemove);

  dashboards.ForEach((d: IDashboard, i: number) => {
    var item = navigation.InsertAt(i + 1, {
      name: d.name,
      id: 'D-' + i,
      url: '/dashboard' + (i ? '/' + i : ''),
      icon: d.icon,
      //badge: {
      //  variant: 'info',
      //  text: 'NEW'
      //},
      isDashboard: true
    })
    if (i === 0) {
      item.routeUrl = item.url + '/0';
    }
  })
}
