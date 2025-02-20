import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import { StopPoint } from '../entity/transport/stoppoint/stoppoint';
import L, {LatLngExpression} from 'leaflet';
import {StopPointService} from './stoppoint.service';

@Injectable({ providedIn: 'root' })
export class StopPointDataService {
  private stopPointsSource = new BehaviorSubject<StopPoint[]>([]);
  stopPoints$ = this.stopPointsSource.asObservable(); // Общедоступный поток данных

  private refreshObjectSource = new Subject<void>();
  refreshObject$ = this.refreshObjectSource.asObservable(); // Поток для обновления карты

  private createStopPointSource = new Subject<L.LatLngExpression>();
  createStopPoint$ = this.createStopPointSource.asObservable(); // Поток для создания точки

  private editStopPointSource = new Subject<StopPoint>();
  editStopPoint$ = this.editStopPointSource.asObservable(); // Поток для редактирования точки из формы

  private openEditDialogSource = new Subject<StopPoint>();
  openEditDialog$ = this.openEditDialogSource.asObservable(); // Поток для открытия модального окна

  private deleteStopPointSource = new Subject<number>();
  deleteStopPoint$ = this.deleteStopPointSource.asObservable(); // Поток для удаления точки

  constructor(private stopPointService: StopPointService) {}

  setStopPoints(stopPoints: StopPoint[]): void {
    this.stopPointsSource.next(stopPoints); // Обновляем данные
  }

  getStopPoints(): StopPoint[] {
    console.log("StopPoints List loaded", this.stopPointsSource.pipe());
    return this.stopPointsSource.getValue(); // Получаем текущие данные
  }

  // Метод для создания новой точки
  requestCreateStopPoint(coords: L.LatLngExpression): void {
    this.createStopPointSource.next(coords); // Отправляем координаты новой точки
  }

// Метод для обновления карты
  refreshObjects(): void {
    console.log("Refreshing List of objects");
    this.refreshObjectSource.next(); // Уведомляем о необходимости обновить карту
  }

  // Метод для редактирования точки
  requestEditStopPoint(stopPoint: StopPoint): void {
    this.editStopPointSource.next(stopPoint); // Отправляем точку для редактирования
  }

  // Метод для открытия модального окна редактирования
  openEditDialog(stopPoint: StopPoint): void {
    this.openEditDialogSource.next(stopPoint); // Отправляем точку для открытия модального окна
  }

  // Метод для удаления точки
  requestDeleteStopPoint(id: number): void {
    this.deleteStopPointSource.next(id); // Отправляем ID точки для удаления
  }

}
