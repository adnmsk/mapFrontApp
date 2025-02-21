// stop-edit-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Добавляем CommonModule
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Stop} from '../entity/transport/stop/stop';

@Component({
  selector: 'app-stop-edit-dialog',
  templateUrl: './stop-edit-dialog.component.html',
  styleUrls: ['./stop-edit-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule, // Добавляем CommonModule
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
})
export class StopEditDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StopEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { stop: Stop }
  ) {
    this.editForm = this.fb.group({
      name: [data.stop.persistent.name, Validators.required],
      abbreviation: [data.stop.abbreviation, Validators.required],
      address: [data.stop.address],
      depot: [data.stop.depot],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updatedStop = {
        ...this.data.stop,
        persistent: {
          ...this.data.stop.persistent,
          name: this.editForm.value.name,
        },
        abbreviation: this.editForm.value.abbreviation,
        address: this.editForm.value.address,
        depot: this.editForm.value.depot,
      };
      this.dialogRef.close(updatedStop);
    }
  }
}
