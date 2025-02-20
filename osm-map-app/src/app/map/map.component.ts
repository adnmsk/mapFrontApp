import {
  Component,
  AfterViewInit,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import L, {
  Bounds,
  DivIcon,
  DivIconOptions,
  DivOverlay,
  DivOverlayOptions, IconOptions,
  ImageOverlayOptions, latLng, LatLng,
  LatLngBoundsExpression, LatLngExpression, LatLngLiteral, Layer, LayerOptions,
  LocateOptions,
  MixinType,
  PanOptions, PathOptions, PolylineOptions, popup, Popup, PopupEvent, Projection, Rectangle,
  SVGOverlay, Tooltip, TooltipOptions, ZoomPanOptions
} from 'leaflet';
import {StopPointDataService} from '../service/stop-point-data.service';
import {StopPointService} from '../service/stoppoint.service';
import {StopPoint} from '../entity/transport/stoppoint/stoppoint';
import {StopPointListComponent} from '../entity/transport/stoppoint/stoppointlist.component';
import {Subject, takeUntil} from 'rxjs';




@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  imports: [ ],
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {



  private map: L.Map | null = null;
  private stopPoints: any[] = []; // Массив StopPoint
  private destroy$ = new Subject<void>(); // Для отписки

  @ViewChild(StopPointListComponent) stopPointList!: StopPointListComponent; // Ссылка на StopPointListComponent


  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private stopPointDataService: StopPointDataService, // Инъектируем сервис
    private cdr: ChangeDetectorRef
  ) { }



  async ngAfterViewInit(): Promise<void> {
    console.log("StopPointList:", this.stopPointList); // Проверьте, что компонент доступен
    if (isPlatformBrowser(this.platformId)) { // Проверяем флаг
      this.cdr.detectChanges(); // Принудительно обновляем представление
      const leaflet = await this.importLeaflet();
      this.initializeMap(leaflet);
      this.loadMarkers();// Добавляем маркеры на карту
      this.subscribeToStopPoints(); // Подписываемся на изменения точек
      // Подписываемся на событие обновления карты
      this.stopPointDataService.refreshObject$.pipe(
        takeUntil(this.destroy$) // Отписываемся при уничтожении компонента
      ).subscribe(() => {
        this.loadMarkers(); // Обновляем маркеры
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Отписываемся от всех подписок
    this.destroy$.complete();
  }

  private async importLeaflet(): Promise<typeof L> {
    try {
      const leaflet = await import('leaflet');
      console.log('Leaflet imported successfully:', leaflet);
      return leaflet as typeof L;

    } catch (error) {
      console.error('Error importing Leaflet:', error);
      throw error;
    }
  }

  private initializeMap(leaflet: typeof L): void {
    console.log('initializeMap called');
    if (this.map && leaflet) {
      console.warn('Map is already initialized.');
      this.map.remove(); // Удаляем существующую карту
      return;
    }

    try {
      console.log('Initializing map...');
      this.map = leaflet.map('map').setView([51.505, -0.09], 13);

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('contextmenu', (event: L.LeafletMouseEvent) => {
        event.originalEvent.preventDefault(); // Отключаем стандартное контекстное меню
        const coords: LatLngExpression = [event.latlng.lat, event.latlng.lng];
        this.showContextMenu(event.containerPoint, coords);
        console.log('Context menu caught...');
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }


  private showContextMenu(position: L.Point, coords: LatLngExpression): void {

    if (!this.map) return;

    const lat = (coords as [number, number])[0];
    const lng = (coords as [number, number])[1];

    // Создаем HTML-код для попапа
    const popupContent = `
    <div style="padding: 10px; background-color: white; border: 1px solid #ccc;">
      <button style="padding: 5px 10px; cursor: pointer;" id="createPointButton">
        Создать новую точку
      </button>
    </div>
  `;

    // Создаем попап и добавляем его на карту
    const popup = L.popup()
      .setLatLng(this.map.containerPointToLatLng(position))
      .setContent(popupContent)
      .openOn(this.map);

    // Находим кнопку внутри попапа и добавляем обработчик события
    const button = document.getElementById('createPointButton');
    if (button) {
      button.onclick = () => {
        console.log("Нажата кнопка сохранить остановку");
        //this.stopPointDataService.requestCreateStopPoint([lat, lng]); // Используем сервис
        this.confirmCreatePoint(lat, lng);
        popup.close(); // Закрываем попап
      };

    }
  }
  // Глобальная функция для подтверждения создания точки
  confirmCreatePoint(lat: number, lng: number): void {
    const confirmed = confirm(`Вы уверены, что хотите создать новую точку?\nКоординаты: ${lat}, ${lng}`);
    if (confirmed) {
      console.log("Вызов метода сохранения")
      this.stopPointDataService.requestCreateStopPoint([lat, lng]); // Вызываем метод createStopPoint из StopPointListComponent
    }
  }


  private loadMarkers(): void {
    if (!this.map ) return; //
    const stopPoints = this.stopPointDataService.getStopPoints() || []; // Получаем список точек
    // Очищаем старые маркеры
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        this.map?.removeLayer(layer);
      }
    });
    // Добавляем новые маркеры
    stopPoints.forEach((stopPoint, index) => {
      const coords: LatLngExpression = [stopPoint.point.y, stopPoint.point.x];
      L.circleMarker(coords, {
        radius: 8,
        fillColor: 'green',
        color: 'darkgreen',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
        .addTo(this.map!)
        .bindPopup(`StopPoint ${stopPoint.number}: ${stopPoint.persistent.name}`)
        .openPopup();
    });
  }


  private subscribeToStopPoints(): void {
    this.stopPointDataService.stopPoints$.subscribe(() => {
      this.loadMarkers(); // Перерисовываем маркеры при изменении данных
    });
  }




}










