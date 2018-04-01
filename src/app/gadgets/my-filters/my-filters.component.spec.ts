import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFiltersComponent } from './my-filters.component';

describe('MyFiltersComponent', () => {
  let component: MyFiltersComponent;
  let fixture: ComponentFixture<MyFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
