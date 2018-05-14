import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivesComponentComponent } from './dives.component';

describe('DivesComponentComponent', () => {
  let component: DivesComponentComponent;
  let fixture: ComponentFixture<DivesComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivesComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
