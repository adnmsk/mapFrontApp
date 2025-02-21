import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialog } from '@angular/material/dialog';
import {Observable, Subject, takeUntil, tap} from 'rxjs';
import {StopPoint} from '../stoppoint/stoppoint';
import {StopEditDialogComponent} from '../../../edit-stop-dialog/stop-edit-dialog.component';
import {Stop} from './stop';
import {StopService} from '../../../service/stop.service';
import {StopDataService} from '../../../service/stop-data.service';
import {StopPointService} from '../../../service/stoppoint.service';
import {CreateStopDialogComponent} from '../../../create-stop-dialog/create-stop-dialog.component';

@Component({
  selector: 'app-stop-list',
  templateUrl: './stoplist.component.html',
  styleUrls: ['./stoplist.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class StopListComponent implements OnInit, OnDestroy {
  stops: Stop[] = [];
  stopPoints: StopPoint[] = []; // Ассоциированные точки остановки
  selectedStop: Stop | null = null; // Выбранная остановка для отображения точек
  private destroy$ = new Subject<void>();

  constructor(
    private stopService: StopService,
    private stopDataService: StopDataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadStops().subscribe();

    // Подписка на обновление данных
    this.stopDataService.refreshObject$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadStops().subscribe();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Загрузка списка остановок
  loadStops(): Observable<Stop[]> {
    return this.stopService.getAllStops().pipe(
      tap((stops: Stop[]) => {
        this.stops = stops;
        this.stopDataService.setStops(stops);
      })
    );
  }

  // Открытие диалога создания остановки
  openCreateStopDialog(): void {
    const dialogRef = this.dialog.open(CreateStopDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadStops().subscribe(); // Обновить список остановок
      }
    });
  }

  // Открытие диалога редактирования
  openEditDialog(stop: Stop): void {
    const dialogRef = this.dialog.open(StopEditDialogComponent, {
      width: '500px',
      data: { stop },
    });

    dialogRef.afterClosed().subscribe((updatedStop: Stop) => {
      if (updatedStop) {
        this.stopService.updateStop(updatedStop).subscribe(() => {
          this.loadStops().subscribe();
        });
      }
    });
  }

  // Удаление остановки
  deleteStop(id: number): void {
    if (confirm('Вы уверены, что хотите удалить эту остановку?')) {
      this.stopService.deleteStop(id).subscribe(() => {
        this.loadStops().subscribe();
      });
    }
  }

  // Показать ассоциированные точки остановки
  showStopPoints(stop: Stop): void {
    this.selectedStop = stop;
    this.stopService.fetchStopPoints(stop.persistent.id!).subscribe((stopPoints: StopPoint[]) => {
      this.stopPoints = stopPoints;
    });
  }

  // Закрыть модальное окно с точками остановки
  closeStopPointsModal(): void {
    this.selectedStop = null;
    this.stopPoints = [];
  }

  // Проверка, привязана ли точка к выбранной остановке
  isAssociated(stopPoint: StopPoint): boolean {
    return this.stopPoints.some((sp) => sp.persistent.id === stopPoint.persistent.id);
  }

  // Привязать точку к остановке
  linkToStop(stopPoint: StopPoint): void {
    this.stopService
      .linkToStop(stopPoint.persistent.id!, this.selectedStop!.persistent.id!)
      .subscribe(() => {
        this.showStopPoints(this.selectedStop!); // Обновляем список точек
      });
  }

  // Отвязать точку от остановки
  unlinkFromStop(stopPoint: StopPoint): void {
    this.stopService
      .excludeFromStop(stopPoint.persistent.id!, this.selectedStop!.persistent.id!)
      .subscribe(() => {
        this.showStopPoints(this.selectedStop!); // Обновляем список точек
      });
  }
}
