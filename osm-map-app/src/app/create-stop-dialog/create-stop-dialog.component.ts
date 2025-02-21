// create-stop-dialog.component.ts
import { Component } from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import {StopService} from '../service/stop.service';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-create-stop-dialog',
  templateUrl: './create-stop-dialog.component.html',
  styleUrls: ['./create-stop-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule, // <-- MatError входит в этот модуль
    MatButtonModule,
    MatCheckbox,
    MatDialogActions,
    MatDialogContent,
    ReactiveFormsModule,
  ],
})
export class CreateStopDialogComponent {
  createForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private stopService: StopService,
    public dialogRef: MatDialogRef<CreateStopDialogComponent>
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      abbreviation: ['', [Validators.required, Validators.maxLength(8)]], // Используем массив валидаторов
      address: ['', [Validators.required, Validators.minLength(5)]],     // Используем массив валидаторов
      description: [''],
      depot: [false],
    });
  }

  onCreate(): void {
    console.log('Form Value:', this.createForm.value); // Лог значений формы
    console.log('Form Valid:', this.createForm.valid); // Лог валидности формы

    if (this.createForm.valid) {
      const newStop = {
        persistent: {
          name: this.createForm.value.name,
          creator: '8d6357f9-d95a-4f68-977d-3766d0efbc00',
          locales: [{ language: 'en', name: 'New Stop Point', locale: 'EN' }],
          active: true,
          description: this.createForm.value.description,
        },
        abbreviation: this.createForm.value.abbreviation,
        address: this.createForm.value.address,
        depot: this.createForm.value.depot,
        number: 1,
      };
      console.log("Вызываем метод сохранения остановки", newStop);

      this.stopService.createStop(newStop).subscribe({
        next: () => {
          this.dialogRef.close(true); // Закрыть диалог и вернуть true (успех)
        },
        error: (err) => {
          console.error('Ошибка при создании остановки:', err); // Логируем ошибку
        },
      });
    } else {
      console.warn('Форма невалидна. Проверьте обязательные поля.');
    }
  }


  onCancel(): void {
    this.dialogRef.close(false); // Закрыть диалог без сохранения
  }
}
