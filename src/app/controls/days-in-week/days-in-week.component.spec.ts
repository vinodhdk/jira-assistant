import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysInWeekComponent } from './days-in-week.component';

describe('DaysInWeekComponent', () => {
  let component: DaysInWeekComponent;
  let fixture: ComponentFixture<DaysInWeekComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaysInWeekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaysInWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
