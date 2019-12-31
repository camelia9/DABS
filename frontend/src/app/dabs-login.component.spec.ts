import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DabsLoginComponent } from './dabs-login.component';

describe('DabsLoginComponent', () => {
  let component: DabsLoginComponent;
  let fixture: ComponentFixture<DabsLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DabsLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DabsLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
