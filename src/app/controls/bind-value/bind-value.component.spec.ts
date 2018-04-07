import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BindValueComponent } from './bind-value.component';

describe('BindValueComponent', () => {
  let component: BindValueComponent;
  let fixture: ComponentFixture<BindValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
