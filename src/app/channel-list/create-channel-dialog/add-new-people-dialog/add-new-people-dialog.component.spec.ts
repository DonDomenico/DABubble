import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewPeopleDialogComponent } from './add-new-people-dialog.component';

describe('AddNewPeopleDialogComponent', () => {
  let component: AddNewPeopleDialogComponent;
  let fixture: ComponentFixture<AddNewPeopleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewPeopleDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewPeopleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
