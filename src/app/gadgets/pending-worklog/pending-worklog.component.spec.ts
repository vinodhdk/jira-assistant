import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingWorklogComponent } from './pending-worklog.component';

describe('PendingWorklogComponent', () => {
  let component: PendingWorklogComponent;
  let fixture: ComponentFixture<PendingWorklogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingWorklogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingWorklogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
