import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStopDialogComponent } from './create-stop-dialog.component';

describe('CreateStopDialogComponent', () => {
  let component: CreateStopDialogComponent;
  let fixture: ComponentFixture<CreateStopDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateStopDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateStopDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
