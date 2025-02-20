import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StopPoint } from './stoppoint';
import { StopPointService } from '../../../service/stoppoint.service';
import {StopPointDataService} from '../../../service/stop-point-data.service';
import L, {latLng} from 'leaflet';
import {Observable, Subject, takeUntil, tap} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {EditStopPointDialogComponent} from '../../../edit-stop-point-dialog/edit-stop-point-dialog.component';


@Component({
  selector: 'app-stop-point-list',
  templateUrl: './stoppointlist.component.html',
  styleUrls: ['./stoppointlist.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class StopPointListComponent implements OnInit {
  stopPoints: StopPoint[] = [];
  private destroy$ = new Subject<void>(); // Для отписки

  constructor(
    private stopPointService: StopPointService,
    private stopPointDataService: StopPointDataService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadStopPoints().subscribe();

    // Подписываемся на событие создания точки
    this.stopPointDataService.createStopPoint$.pipe(
      takeUntil(this.destroy$) // Отписываемся при уничтожении компонента
    ).subscribe(coords => {
      this.createStopPoint(coords); // Создаем точку
    });

    // Подписываемся на событие редактирования точки с формы
    this.stopPointDataService.editStopPoint$.pipe(
      takeUntil(this.destroy$) // Отписываемся при уничтожении компонента
    ).subscribe(stopPoint => {
      this.editStopPoint(stopPoint, false); // Редактируем точку без показа модального окна
    });

    // Подписываемся на событие открытия модального окна редактирования
    this.stopPointDataService.openEditDialog$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(stopPoint => {
      this.editStopPoint(stopPoint, true); // Открываем модальное окно для редактирования
    });


    // Подписываемся на событие удаления точки
    this.stopPointDataService.deleteStopPoint$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(id => {
      this.deleteStopPoint(id); // Удаляем точку
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next(); // Отписываемся от всех подписок
    this.destroy$.complete();
  }



  loadStopPoints(): Observable<StopPoint[]> {
    return this.stopPointService.getAllStopPoints().pipe(
      tap((data: StopPoint[]) => {
        this.stopPoints = data;
        this.stopPointDataService.setStopPoints(data); // Обновляем данные в сервисе
      })
    );
  }

  public createStopPoint(coords: L.LatLngExpression): void {
    const latLng = L.latLng(coords); // Преобразуем в L.LatLng

    const newStopPoint: StopPoint = {
      persistent: {
        name: 'New Stop Point',
        description: 'Description for new stop point created in FE',
        creator: '8d6357f9-d95a-4f68-977d-3766d0efbc00',
        locales: [{ language: 'en', name: 'New Stop Point', locale: "EN" }],
        active: true
      },
      number: 1,
      bearing: 1,
      point: {
        y: latLng.lat, // Широта (y)
        x: latLng.lng // Долгота (x)
      }
    };

    this.stopPointService.createStopPoint(newStopPoint).subscribe(
      () => {
        this.loadStopPoints().subscribe(); // Обновляем список точек после создания
      },
      error => {
        console.error('Ошибка при создании точки:', error);
      }
    );
  }

  editStopPoint(stopPoint: StopPoint, showDialog: boolean = true): void {
    console.log('Редактирование:', stopPoint);

    if (showDialog) {
      // Показываем модальное окно для редактирования
      const dialogRef = this.dialog.open(EditStopPointDialogComponent, {
        width: '500px',
        data: { stopPoint } // Передаем текущий объект StopPoint в модальное окно
      });

      dialogRef.afterClosed().subscribe((updatedStopPoint: StopPoint) => {
        if (updatedStopPoint) { // Если объект был обновлен и возвращен
          this.updateStopPoint(updatedStopPoint); // Обновляем точку
        }
      });
    } else {
      // Обновляем точку без показа модального окна
      this.updateStopPoint(stopPoint);
    }
  }

  private updateStopPoint(stopPoint: StopPoint): void {
    this.stopPointService.updateStopPoint(stopPoint).subscribe({
      next: (response) => {
        console.log('Точка остановки успешно обновлена:', response);
        this.loadStopPoints().subscribe(); // Обновляем список точек
      },
      error: (error) => {
        console.error('Ошибка при обновлении точки остановки:', error);
      }
    });
  }


  deleteStopPoint(id: number): void {
    if (confirm('Вы уверены, что хотите удалить эту точку остановки?')) {
      this.stopPointService.deleteStopPoint(id).subscribe(() => {
        this.stopPoints = this.stopPoints.filter(sp => sp.persistent.id !== id); // Обновляем список
        this.stopPointDataService.setStopPoints(this.stopPoints); // Обновляем данные в сервисе
      });
    }
  }

  addRandomStopPoint(): void {
    const randomStopPoint: StopPoint = {
      persistent: {
        name: `StopPoint_${Math.floor(Math.random() * 100)}`,
        description: 'Description for random stop point',
        creator: '8d6357f9-d95a-4f68-977d-3766d0efbc00',
        locales: [{ language: 'en', name: 'Random Stop Point', locale:"EN" }],
        active: true
      },
      number: 1,
      bearing:1,
      point: {
        y: 51.5 + Math.random() * 0.1, // Случайная широта
        x: -0.09 - Math.random() * 0.1 // Случайная долгота
      }
    };

    this.stopPointService.createStopPoint(randomStopPoint).subscribe(
      () => {
        this.loadStopPoints().subscribe(); // Обновляем список точек после создания
      },
      error => {
        console.error('Ошибка при создании случайной точки:', error);
      }
    );
  }

}
