import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import { StopPoint } from '../entity/transport/stoppoint/stoppoint';
import L, {LatLngExpression} from 'leaflet';
import {StopPointService} from './stoppoint.service';

@Injectable({ providedIn: 'root' })
export class StopPointDataService {
  private stopPointsSource = new BehaviorSubject<StopPoint[]>([]);
  stopPoints$ = this.stopPointsSource.asObservable(); // Общедоступный поток данных

  private refreshMapSource = new Subject<void>();
  refreshMap$ = this.refreshMapSource.asObservable(); // Поток для обновления карты

  private createStopPointSource = new Subject<L.LatLngExpression>();
  createStopPoint$ = this.createStopPointSource.asObservable(); // Поток для создания точки

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
  refreshMap(): void {
    console.log("Refreshing Map");
    this.refreshMapSource.next(); // Уведомляем о необходимости обновить карту
  }

}
