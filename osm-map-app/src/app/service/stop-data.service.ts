import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Stop } from '../entity/transport/stop/stop';
import { StopService } from './stop.service';

@Injectable({ providedIn: 'root' })
export class StopDataService {
  private stopsSource = new BehaviorSubject<Stop[]>([]);
  stops$ = this.stopsSource.asObservable(); // Общедоступный поток данных

  private refreshObjectSource = new Subject<void>();
  refreshObject$ = this.refreshObjectSource.asObservable(); // Поток для обновления данных

  private createStopSource = new Subject<Stop>();
  createStop$ = this.createStopSource.asObservable(); // Поток для создания остановки

  private editStopSource = new Subject<Stop>();
  editStop$ = this.editStopSource.asObservable(); // Поток для редактирования остановки

  private openEditDialogSource = new Subject<Stop>();
  openEditDialog$ = this.openEditDialogSource.asObservable(); // Поток для открытия модального окна

  private deleteStopSource = new Subject<number>();
  deleteStop$ = this.deleteStopSource.asObservable(); // Поток для удаления остановки

  constructor(private stopService: StopService) {}

  // Установить список остановок
  setStops(stops: Stop[]): void {
    this.stopsSource.next(stops);
  }

  // Получить текущий список остановок
  getStops(): Stop[] {
    return this.stopsSource.getValue();
  }

  // Запросить обновление данных
  refreshObjects(): void {
    this.refreshObjectSource.next();
  }

  // Запросить создание остановки
  requestCreateStop(stop: Stop): void {
    this.createStopSource.next(stop);
  }

  // Запросить редактирование остановки
  requestEditStop(stop: Stop): void {
    this.editStopSource.next(stop);
  }

  // Запросить открытие модального окна редактирования
  openEditDialog(stop: Stop): void {
    this.openEditDialogSource.next(stop);
  }

  // Запросить удаление остановки
  requestDeleteStop(id: number): void {
    this.deleteStopSource.next(id);
  }
}
