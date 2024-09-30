import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateChannelDialogComponent } from './update-channel-dialog.component';

describe('UpdateChannelDialogComponent', () => {
  let component: UpdateChannelDialogComponent;
  let fixture: ComponentFixture<UpdateChannelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateChannelDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateChannelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
