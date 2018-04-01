import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketWiseWorklogComponent } from './ticket-wise-worklog.component';

describe('TicketWiseWorklogComponent', () => {
  let component: TicketWiseWorklogComponent;
  let fixture: ComponentFixture<TicketWiseWorklogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketWiseWorklogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketWiseWorklogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
