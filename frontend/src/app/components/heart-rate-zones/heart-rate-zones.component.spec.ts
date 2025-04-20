import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeartRateZonesComponent } from './heart-rate-zones.component';

describe('HeartRateZonesComponent', () => {
  let component: HeartRateZonesComponent;
  let fixture: ComponentFixture<HeartRateZonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeartRateZonesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeartRateZonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
