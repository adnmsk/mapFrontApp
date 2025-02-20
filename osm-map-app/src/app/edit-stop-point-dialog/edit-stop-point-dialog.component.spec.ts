import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStopPointDialogComponent } from './edit-stop-point-dialog.component';

describe('EditStopPointDialogComponent', () => {
  let component: EditStopPointDialogComponent;
  let fixture: ComponentFixture<EditStopPointDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStopPointDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStopPointDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
