import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingLoadComponent } from './training-load.component';

describe('TrainingLoadComponent', () => {
  let component: TrainingLoadComponent;
  let fixture: ComponentFixture<TrainingLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrainingLoadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
