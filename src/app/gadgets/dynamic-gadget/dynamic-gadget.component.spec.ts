import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicGadgetComponent } from './dynamic-gadget.component';

describe('DynamicGadgetComponent', () => {
  let component: DynamicGadgetComponent;
  let fixture: ComponentFixture<DynamicGadgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicGadgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicGadgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
