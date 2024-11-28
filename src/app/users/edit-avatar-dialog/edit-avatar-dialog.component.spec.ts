import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAvatarDialogComponent } from './edit-avatar-dialog.component';

describe('EditAvatarDialogComponent', () => {
  let component: EditAvatarDialogComponent;
  let fixture: ComponentFixture<EditAvatarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAvatarDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditAvatarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
