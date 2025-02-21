// edit-stop-point-dialog.component.ts
import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {StopPoint} from '../entity/transport/stoppoint/stoppoint';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-edit-stop-point-dialog',
  templateUrl: './edit-stop-point-dialog.component.html',
  imports: [
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    ReactiveFormsModule,
    MatButtonModule
  ],
  styleUrls: ['./edit-stop-point-dialog.component.css']
})
export class EditStopPointDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditStopPointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { stopPoint: StopPoint }
  ) {
    this.editForm = this.fb.group({
      name: [data.stopPoint.persistent.name],
      description: [data.stopPoint.persistent.description],
      bearing:[data.stopPoint.bearing, Validators.required],
      coordY:[data.stopPoint.point.y, Validators.required],
      coordX:[data.stopPoint.point.x, Validators.required],

    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updatedStopPoint = {
        ...this.data.stopPoint,
        persistent: {
          ...this.data.stopPoint.persistent,
          name: this.editForm.value.name,
          description: this.editForm.value.description,
        },
        point:{
          ...this.data.stopPoint.point,
          y:this.editForm.value.coordY,
          x:this.editForm.value.coordX,
        },
        bearing:this.editForm.value.bearing
      };
      this.dialogRef.close(updatedStopPoint); // Возвращаем обновленный объект
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}
