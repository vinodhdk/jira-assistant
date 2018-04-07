import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BindFunctionComponent } from './bind-function.component';

describe('BindFunctionComponent', () => {
  let component: BindFunctionComponent;
  let fixture: ComponentFixture<BindFunctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindFunctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
