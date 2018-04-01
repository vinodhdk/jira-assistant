import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDaywiseReportComponent } from './user-daywise-report.component';

describe('UserDaywiseReportComponent', () => {
  let component: UserDaywiseReportComponent;
  let fixture: ComponentFixture<UserDaywiseReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDaywiseReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDaywiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
