import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseProfileImageComponent } from './choose-profile-image.component';

describe('ChooseProfileImageComponent', () => {
  let component: ChooseProfileImageComponent;
  let fixture: ComponentFixture<ChooseProfileImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseProfileImageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseProfileImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
