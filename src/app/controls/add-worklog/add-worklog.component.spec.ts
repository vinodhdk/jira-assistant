import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorklogComponent } from './add-worklog.component';

describe('AddWorklogComponent', () => {
  let component: AddWorklogComponent;
  let fixture: ComponentFixture<AddWorklogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddWorklogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWorklogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
