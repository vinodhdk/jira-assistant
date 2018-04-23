import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqViewComponent } from './faq-view.component';

describe('FaqViewComponent', () => {
  let component: FaqViewComponent;
  let fixture: ComponentFixture<FaqViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
