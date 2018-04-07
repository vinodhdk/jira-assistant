import { HostListener, ElementRef, AfterViewInit, EventEmitter, Output, OnChanges, SimpleChanges, Input } from "@angular/core";
import * as $ from 'jquery'

export class BaseGadget implements OnChanges {
  totalHeight: number
  contentHeight: number
  hideHeader: boolean
  @Input()
  isGadget: boolean
  isFullScreen: boolean
  bodyTag: any

  @Input()
  layout: number

  @Output()
  onAction: EventEmitter<any>

  widgetCtl: any
  widgetHdrCtl: any

  constructor(private el: ElementRef) {
    this.isGadget = true;
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
      this.contentHeight = this.totalHeight - ((this.widgetHdrCtl.outerHeight() || 44) + 3);
    }, 20);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.layout && changes.layout.currentValue) {
      this.onResize({});
    }
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    if (this.isFullScreen) { this.bodyTag.addClass('fs-layout'); }
    else { this.bodyTag.removeClass('fs-layout'); }
    this.onResize();
  }

  addWorklog(data: any) {
    this.onAction.emit({ action: 1, data: data });
  }

  addWorklogOn(ticketNo: string) {
    this.addWorklog({ ticketNo: ticketNo })
  }

  removeGadget() {
    this.onAction.emit({ action: 100 })
  }
}
