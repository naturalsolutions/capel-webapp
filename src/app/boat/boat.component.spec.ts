import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoatComponent } from './boat.component';

describe('BoatComponent', () => {
  let component: BoatComponent;
  let fixture: ComponentFixture<BoatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
