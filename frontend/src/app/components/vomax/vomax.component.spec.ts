import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VomaxComponent } from './vomax.component';

describe('VomaxComponent', () => {
  let component: VomaxComponent;
  let fixture: ComponentFixture<VomaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VomaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VomaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
