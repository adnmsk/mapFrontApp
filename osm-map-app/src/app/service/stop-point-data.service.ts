import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StopPoint } from '../entity/transport/stoppoint/stoppoint';

@Injectable({
  providedIn: 'root'
})
export class StopPointDataService {
  private stopPointsSource = new BehaviorSubject<StopPoint[]>([]);
  stopPoints$ = this.stopPointsSource.asObservable(); // Общедоступный поток данных

  setStopPoints(stopPoints: StopPoint[]): void {
    this.stopPointsSource.next(stopPoints); // Обновляем данные
  }

  getStopPoints(): StopPoint[] {
    console.log("StopPoints List loaded", this.stopPointsSource.getValue());
    return this.stopPointsSource.value;// Получаем текущие данные
  }
}
