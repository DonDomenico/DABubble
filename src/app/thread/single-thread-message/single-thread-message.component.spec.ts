import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleThreadMessageComponent } from './single-thread-message.component';

describe('SingleThreadMessageComponent', () => {
  let component: SingleThreadMessageComponent;
  let fixture: ComponentFixture<SingleThreadMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleThreadMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SingleThreadMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
