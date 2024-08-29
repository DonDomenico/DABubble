import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowProfileDialogComponent } from './show-profile-dialog.component';

describe('ShowProfileDialogComponent', () => {
  let component: ShowProfileDialogComponent;
  let fixture: ComponentFixture<ShowProfileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowProfileDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowProfileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
