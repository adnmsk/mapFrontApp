import { Component, OnInit, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import {isPlatformBrowser, NgForOf} from '@angular/common';
import {StopPoint} from './stoppoint';
import {StopPointService} from '../../../service/stoppoint.service';
import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-stop-point-list',
  templateUrl: './stoppointlist.component.html',
  styleUrls: ['./stoppointlist.component.css'],
  standalone: true, // Если это standalone-компонент
  imports: [CommonModule], // Добавляем CommonModule
  providers: []
})
export class StopPointListComponent implements OnInit {

  stopPoints: StopPoint[] = []; // Инициализируем пустым массивом

  constructor(
    private stopPointService: StopPointService,
    @Inject(PLATFORM_ID) private platformId: string
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStopPoints();
    }
  }

  private loadStopPoints(): void {
    this.stopPointService.getAllStopPoints().subscribe(
      data => {
        console.log('Загружены точки остановки:', data); // Логируем полученные данные
        this.stopPoints = data;
      },
      error => {
        console.error('Ошибка при загрузке точек остановки:', error); // Логируем ошибки
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
        id: Math.floor(Math.random() * 1000),
        name: `StopPoint_${Math.floor(Math.random() * 100)}`,
        description: 'Description for random stop point',
        creator: 'user',
        locales: [{
          language: 'en', name: 'Random Stop Point',
          locale: 'EN'
        }],
        active: true
      },
      number: Math.floor(Math.random() * 10),
      bearing: 1,
      point: {
        y: 51.5 + Math.random() * 0.1,
        x: -0.09 - Math.random() * 0.1
      }
    };

    this.stopPointService.createStopPoint(randomStopPoint).subscribe(() => {
      this.loadStopPoints(); // Перезагружаем список после создания новой точки
    });
  }


}
