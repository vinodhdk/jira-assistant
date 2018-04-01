import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayWiseWorklogComponent } from './day-wise-worklog.component';

describe('DayWiseWorklogComponent', () => {
  let component: DayWiseWorklogComponent;
  let fixture: ComponentFixture<DayWiseWorklogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayWiseWorklogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayWiseWorklogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
