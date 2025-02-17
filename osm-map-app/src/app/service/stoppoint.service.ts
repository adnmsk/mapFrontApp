import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StopPoint } from '../entity/transport/stoppoint/stoppoint';

@Injectable({
  providedIn: 'root'
})
export class StopPointService {
  private apiUrl = 'http://localhost:8080/stop-point'; // URL вашего Java-бэкенда

  constructor(private http: HttpClient) {}

  getAllStopPoints(): Observable<StopPoint[]> {
    console.log('Выполняется запрос к эндпоинту:', `${this.apiUrl}/find-all`);
    return this.http.get<StopPoint[]>(`${this.apiUrl}/find-all`);
  }

  getStopPoint(id: number): Observable<StopPoint> {
    console.log('Выполняется запрос к эндпоинту:', `${this.apiUrl}/${id}`);
    return this.http.get<StopPoint>(`${this.apiUrl}/${id}`);
  }

  createStopPoint(stopPoint: StopPoint): Observable<StopPoint> {
    console.log('Выполняется запрос к эндпоинту:', this.apiUrl, 'с данными:', stopPoint);
    return this.http.post<StopPoint>(this.apiUrl, stopPoint);
  }

  updateStopPoint(stopPoint: StopPoint): Observable<StopPoint> {
    const url = `${this.apiUrl}/${stopPoint.persistent.id}`;
    console.log('Выполняется запрос к эндпоинту:', url, 'с данными:', stopPoint);
    return this.http.put<StopPoint>(url, stopPoint);
  }

  deleteStopPoint(id: number): Observable<void> {
    console.log('Выполняется запрос к эндпоинту:', `${this.apiUrl}/${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
