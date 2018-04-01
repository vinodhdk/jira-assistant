import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateWiseWorklogComponent } from './date-wise-worklog.component';

describe('DateWiseWorklogComponent', () => {
  let component: DateWiseWorklogComponent;
  let fixture: ComponentFixture<DateWiseWorklogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateWiseWorklogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateWiseWorklogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
