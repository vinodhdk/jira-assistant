import { Component, ViewChildren, QueryList, ContentChildren, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatabaseService, SessionService } from '../../services/index';
import { IDashboard, IUser, IWidget } from '../../common/interfaces';
import { updateDashboard } from '../../_nav';
import { DASHBOARD_ICONS } from '../../_constants';
import { FacadeService } from '../../services/facade.service';
import { BaseGadget, GadgetAction, GadgetActionType } from '../../gadgets/base-gadget';
import { CacheService } from '../../services/cache.service';


@Component({
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent {
  dashboardIndex: number
  currentBoard: IDashboard
  showLayoutPopup: boolean
  selectedLayout: number
  showWorklogPopup: boolean
  showGadgetsPopup: boolean
  worklogItem: any
  contextMenu: any[]//MenuItem
  dashboardIcons: string[]
  isEditMode: boolean
  newName: string
  newIcon: any
  savedQueries: any[]
  isQuickView: boolean
  @ViewChildren('myGadget') gadgetsList: QueryList<BaseGadget>;

  constructor(private route: ActivatedRoute, private $db: DatabaseService, private $session: SessionService,
    private $jaFacade: FacadeService, private router: Router, private $cache: CacheService) {
    this.dashboardIcons = DASHBOARD_ICONS;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.isQuickView = parseInt(params['isQuickView'] || 0) == 1;
      this.loadDashboard(parseInt(params['index'] || 0))
    });
  }

  loadDashboard(index: number) {
    var dashboards = this.$session.CurrentUser.dashboards;
    if (index >= dashboards.length) { index = 0; }

    this.dashboardIndex = index;
    this.currentBoard = dashboards[index];

    var quickViewLink = {
      label: "Set as quick view", icon: this.currentBoard.isQuickView ? "fa-check-square" : "fa-square",
      disabled: this.currentBoard.isQuickView, command: () => this.setAsQuickView(quickViewLink)
    };

    this.contextMenu = [
      { label: "Create dashboard", icon: "fa-plus", command: () => this.createDashboard() },
      { label: "Delete dashboard", icon: "fa-trash-o", command: () => this.deleteDashboard(), disabled: this.dashboardIndex == 0 },
      {
        label: "Edit layout", icon: "fa-columns", command: () => {
          this.showLayoutPopup = true;
          this.selectedLayout = this.currentBoard.layout;
        }
      },
      quickViewLink
    ];
  }

  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createDashboard() {
    this.$db.users.get(this.$session.userId).then(u => {
      if (!u.dashboards) { u.dashboards = [this.currentBoard]; }
      var iconIdx = this.rand(0, this.dashboardIcons.length - 1);
      u.dashboards.Add({ icon: this.dashboardIcons[iconIdx], layout: 1, name: 'New Dashboard ' + (u.dashboards.length + 1), widgets: [], isQuickView: false });
      return this.saveUserDashboards(u);
    });
  }

  deleteDashboard() {
    this.$db.users.get(this.$session.userId).then(u => {
      u.dashboards.RemoveAt(this.dashboardIndex);
      if (this.currentBoard.isQuickView) { u.dashboards[0].isQuickView = true; }
      return this.saveUserDashboards(u).then(uid => {
        this.router.navigate(['/dashboard']);
      });
    });
  }

  setAsQuickView(quickViewLink: any) {
    quickViewLink.disabled = true;
    quickViewLink.disabled = 'fa-check-square';
    this.currentBoard.isQuickView = true;
    this.$db.users.get(this.$session.userId).then(u => {
      if (!u.dashboards) { u.dashboards = [this.currentBoard]; }
      else { u.dashboards.ForEach((dboard, i) => dboard.isQuickView = i === this.dashboardIndex); }
      var quickMenu = this.$cache.get("menuAction", true);
      if (quickMenu) {
        quickMenu = JSON.parse(quickMenu);
        if (quickMenu.action == 3) {
          if (this.dashboardIndex == 0) { delete quickMenu.index; }
          else { quickMenu.index = this.dashboardIndex; }
        }
        this.$cache.set("menuAction", quickMenu, false, true);
      }
      return this.saveUserDashboards(u);
    });
  }

  saveDashboardInfo(avoidMenuUpdate?: boolean) {
    this.$db.users.get(this.$session.userId).then(u => {

      if (!u.dashboards) { u.dashboards = [this.currentBoard]; }
      else { u.dashboards[this.dashboardIndex] = this.currentBoard; }

      return this.saveUserDashboards(u, avoidMenuUpdate);
    });
  }

  saveUserDashboards(u: IUser, avoidMenuUpdate?: boolean): Promise<number> {
    return this.$db.users.put(u).then(uid => {
      this.$session.CurrentUser.dashboards = u.dashboards
      if (!avoidMenuUpdate) {
        updateDashboard(u.dashboards);
      }
      return uid;
    });
  }

  showGadgets() {
    this.$jaFacade.getSavedFilters()
      .then((result) => { this.savedQueries = result; })
    this.showGadgetsPopup = true;
  }

  hasGadget(gadgetName: string) {
    return this.currentBoard.widgets.Any(g => g.name === gadgetName);
  }

  addGadget(gadgetName: string, settings?: any) {
    this.currentBoard.widgets.Add({ name: gadgetName, settings: settings || {} });
  }

  removeGadget(gadgetName: string) {
    this.currentBoard.widgets.RemoveAll(g => g.name === gadgetName);
  }

  widgetAction($event: GadgetAction, gadget?: IWidget, widgetIndex?: number) {
    switch ($event.type) {
      case GadgetActionType.AddWorklog: this.worklogItem = $event.data; this.showWorklogPopup = true; break;
      //case 2: this.worklogIdToEdit = $event.worklogId; this.showWorklogPopup = true; break;
      case GadgetActionType.RemoveGadget:
        this.currentBoard.widgets.RemoveAt(widgetIndex);
        this.saveDashboardInfo(true);
        this.emitToChildren($event, widgetIndex);
        break;
      case GadgetActionType.SettingsChanged:
        gadget.settings = $event.data;
        this.saveDashboardInfo(true);
        break;
      default:
        this.emitToChildren($event, widgetIndex);
        break;
    }
  }

  private emitToChildren($event: GadgetAction, widgetIndex?: number) {
    this.gadgetsList.forEach((item, index, arr) => {
      item.executeEvent($event);
    });
  }

  gadgetReordered($event) {
    this.saveDashboardInfo(true);
  }

  getGadgetName(idx): string {
    if (this.gadgetsList && this.gadgetsList.length > 0) {
      var gadget: BaseGadget = this.gadgetsList.toArray()[idx];
      return gadget ? gadget.title : '';
    }
  }

  getGadgetIcon(idx): string {
    if (this.gadgetsList && this.gadgetsList.length > 0) {
      var gadget: BaseGadget = this.gadgetsList.toArray()[idx];
      return gadget ? gadget.iconClass : '';
    }
  }
}
