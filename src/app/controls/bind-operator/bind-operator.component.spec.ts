import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BindOperatorComponent } from './bind-operator.component';

describe('BindOperatorComponent', () => {
  let component: BindOperatorComponent;
  let fixture: ComponentFixture<BindOperatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindOperatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindOperatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
