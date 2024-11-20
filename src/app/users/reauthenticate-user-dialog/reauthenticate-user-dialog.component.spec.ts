import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReauthenticateUserDialogComponent } from './reauthenticate-user-dialog.component';

describe('ReauthenticateUserDialogComponent', () => {
  let component: ReauthenticateUserDialogComponent;
  let fixture: ComponentFixture<ReauthenticateUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReauthenticateUserDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReauthenticateUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
