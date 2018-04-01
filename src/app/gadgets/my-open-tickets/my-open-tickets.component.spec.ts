import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOpenTicketsComponent } from './my-open-tickets.component';

describe('MyOpenTicketsComponent', () => {
  let component: MyOpenTicketsComponent;
  let fixture: ComponentFixture<MyOpenTicketsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyOpenTicketsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyOpenTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
