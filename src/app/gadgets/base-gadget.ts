import { HostListener, ElementRef, AfterViewInit, EventEmitter, Output, OnChanges, SimpleChanges, Input } from "@angular/core";
import * as $ from 'jquery'

export class BaseGadget implements OnChanges {
  totalHeight: number
  contentHeight: number

  @Input()
  layout: number

  @Output()
  onAction: EventEmitter<any>

  widgetCtl: any
  widgetHdrCtl: any

  constructor(private el: ElementRef) {
    this.onAction = new EventEmitter<any>();
    this.widgetCtl = $(this.el.nativeElement).closest('.widget-cntr');
  }

  ngAfterViewInit() {
    this.widgetHdrCtl = this.widgetCtl.find('div.ui-panel-titlebar.ui-widget-header');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.totalHeight = this.widgetCtl.height();
      this.contentHeight = this.totalHeight - ((this.widgetHdrCtl.outerHeight() || 44) + 1);
    }, 20);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.layout && changes.layout.currentValue) {
      this.onResize({});
    }
  }

  addWorklog(data: any) {
    this.onAction.emit({ action: 1, data: data });
  }

  addWorklogOn(ticketNo: string) {
    this.addWorklog({ ticketNo: ticketNo })
  }
}
