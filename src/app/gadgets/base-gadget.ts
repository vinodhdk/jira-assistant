import { HostListener, ElementRef, AfterViewInit, EventEmitter, Output, OnChanges, SimpleChanges, Input } from "@angular/core";
import * as $ from 'jquery'

export class BaseGadget implements OnChanges {
  //title: string
  //iconClass: string
  totalHeight: number
  contentHeight: number
  @Input()
  hideHeader: boolean
  @Input()
  isGadget: boolean
  isFullScreen: boolean
  bodyTag: any
  columnResizeMode: string

  @Input()
  settings: any

  @Input()
  layout: number

  @Output()
  onAction: EventEmitter<GadgetAction>

  widgetCtl: any
  widgetHdrCtl: any

  constructor(private el: ElementRef, public title: string, public iconClass: string) {
    this.isGadget = true;
    this.settings = {};
    this.onAction = new EventEmitter<any>();
    this.bodyTag = $('body');
    this.widgetCtl = $(this.el.nativeElement).closest('.widget-cntr');
    this.ngAfterViewInit();
  }

  ngAfterViewInit() {
    this.widgetHdrCtl = this.widgetCtl.find('div.ui-panel-titlebar.ui-widget-header');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: any) {
    setTimeout(() => {
      this.totalHeight = this.isFullScreen ? window.innerHeight : this.widgetCtl.height();
      this.contentHeight = this.totalHeight + (this.hideHeader ? 0 : -((this.widgetHdrCtl.outerHeight() || 44) + 3));
    }, 20);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.layout && changes.layout.currentValue) {
      this.onResize();
    }
    if (!this.settings) {
      this.settings = {};
    }
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    if (this.isFullScreen) { this.bodyTag.addClass('fs-layout'); }
    else { this.bodyTag.removeClass('fs-layout'); }
    this.columnResizeMode = this.isFullScreen ? 'fit' : 'expand';
    this.onResize();
  }

  performAction(type: GadgetActionType, data?: any) {
    this.onAction.emit({ type: type, data: data });
  }

  addWorklog(data: any) {
    this.performAction(GadgetActionType.AddWorklog, data);
  }

  addWorklogOn(ticketNo: string) {
    this.addWorklog({ ticketNo: ticketNo })
  }

  editWorklog(worklogId: number) {
    this.performAction(GadgetActionType.AddWorklog, { id: worklogId });
  }

  removeGadget() {
    this.performAction(GadgetActionType.RemoveGadget);
  }

  saveSettings() {
    this.performAction(GadgetActionType.SettingsChanged, this.settings);
  }

  executeEvent(action: GadgetAction) {
    if (action.type == GadgetActionType.RemoveGadget) {
      this.onResize();
    }
  }
}

export interface GadgetAction {
  type: GadgetActionType
  data?: any
}

export enum GadgetActionType {
  None = 0,
  AddWorklog = 1,
  WorklogModified = 2,
  DeletedWorklog = 3,
  TicketBookmarked = 10,
  SettingsChanged = 20,
  RemoveGadget = 100
}
