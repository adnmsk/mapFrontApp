import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StopPoint } from '../entity/transport/stoppoint/stoppoint';
import L, {LatLngExpression} from 'leaflet';
import {StopPointService} from './stoppoint.service';

@Injectable({
  providedIn: 'root'
})
export class StopPointDataService {
  private stopPointsSource = new BehaviorSubject<StopPoint[]>([]);
  stopPoints$ = this.stopPointsSource.asObservable(); // Общедоступный поток данных

  constructor(private stopPointService: StopPointService) {}

  setStopPoints(stopPoints: StopPoint[]): void {
    this.stopPointsSource.next(stopPoints); // Обновляем данные
  }

  getStopPoints(): StopPoint[] {
    console.log("StopPoints List loaded", this.stopPointsSource.pipe());
    return this.stopPointsSource.getValue();// Получаем текущие данные
  }




}
