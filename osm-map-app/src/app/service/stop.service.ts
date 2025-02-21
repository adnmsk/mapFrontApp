import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stop } from '../entity/transport/stop/stop';
import {StopPoint} from '../entity/transport/stoppoint/stoppoint';

@Injectable({
  providedIn: 'root'
})
export class StopService {
  private apiUrl = 'http://localhost:8080/stop'; // Укажите URL вашего API

  constructor(private http: HttpClient) {}

  // Получить все остановки
  getAllStops(): Observable<Stop[]> {
    return this.http.get<Stop[]>(`${this.apiUrl}/find-all`);
  }

  // Получить одну остановку по ID
  getStop(id: number): Observable<Stop> {
    return this.http.get<Stop>(`${this.apiUrl}/${id}`);
  }

  // Создать новую остановку
  createStop(stop: Stop): Observable<Stop> {
    return this.http.post<Stop>(`${this.apiUrl}/create`, stop);
  }

  // Обновить существующую остановку
  updateStop(stop: Stop): Observable<Stop> {
    return this.http.put<Stop>(`${this.apiUrl}/edit`, stop);
  }

  // Удалить остановку по ID
  deleteStop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Привязать StopPoint к Stop
  linkToStop(stopPointId: number, stopId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/link-to-stop/${stopPointId}/${stopId}`, {});
  }

  // Отвязать StopPoint от Stop
  excludeFromStop(stopPointId: number, stopId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/exclude-from-stop/${stopPointId}/${stopId}`, {});
  }

  // Получить ассоциированные StopPoint по ID Stop
  fetchStopPoints(stopId: number): Observable<StopPoint[]> {
    return this.http.get<StopPoint[]>(`${this.apiUrl}/fetch-stop-points/${stopId}`);
  }
}
