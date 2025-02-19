import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StopPoint } from './stoppoint';
import { StopPointService } from '../../../service/stoppoint.service';
import {StopPointDataService} from '../../../service/stop-point-data.service';
import L, {latLng} from 'leaflet';


@Component({
  selector: 'app-stop-point-list',
  templateUrl: './stoppointlist.component.html',
  styleUrls: ['./stoppointlist.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class StopPointListComponent implements OnInit {
  stopPoints: StopPoint[] = [];

  constructor(
    private stopPointService: StopPointService,
    private stopPointDataService: StopPointDataService
  ) {}

  ngOnInit(): void {
    this.loadStopPoints();


  }



  loadStopPoints(): void {
    this.stopPointService.getAllStopPoints().subscribe(data => {
      this.stopPoints = data;
      console.log(data);
      this.stopPointDataService.setStopPoints(data);
    });
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
        this.loadStopPoints(); // Обновляем список точек после создания
      },
      error => {
        console.error('Ошибка при создании точки:', error);
      }
    );
  }

  editStopPoint(stopPoint: StopPoint): void {
    console.log('Редактирование:', stopPoint);
    // Здесь можно добавить логику редактирования
  }

  deleteStopPoint(id: number): void {
    if (confirm('Вы уверены, что хотите удалить эту точку остановки?')) {
      this.stopPointService.deleteStopPoint(id).subscribe(() => {
        this.stopPoints = this.stopPoints.filter(sp => sp.persistent.id !== id); // Обновляем список
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
      number: Math.floor(Math.random() * 10),
      bearing: Math.floor(Math.random() * 360),
      point: {
        y: 51.5 + Math.random() * 0.1, // Случайная широта
        x: -0.09 - Math.random() * 0.1 // Случайная долгота
      }
    };

    this.stopPointService.createStopPoint(randomStopPoint).subscribe(
      () => {
        this.loadStopPoints(); // Обновляем список точек после создания
      },
      error => {
        console.error('Ошибка при создании случайной точки:', error);
      }
    );
  }

}
