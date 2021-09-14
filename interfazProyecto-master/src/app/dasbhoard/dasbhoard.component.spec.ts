import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasbhoardComponent } from './dasbhoard.component';

describe('DasbhoardComponent', () => {
  let component: DasbhoardComponent;
  let fixture: ComponentFixture<DasbhoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DasbhoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DasbhoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
