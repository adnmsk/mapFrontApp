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
import {catchError, forkJoin, of, Subject, takeUntil, tap} from 'rxjs';
import {StopService} from '../service/stop.service';
import {StopDataService} from '../service/stop-data.service';




@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  imports: [ ],
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {



  private map: L.Map | null = null;
  private stopPoints: any[] = []; // Массив StopPoint
  private stopPolygons: L.Polygon[] = []; // Массив полигонов для Stop
  protected showStops = true; // Флаг для отображения Stop
  protected showStopPoints = true; // Флаг для отображения StopPoint
  private destroy$ = new Subject<void>(); // Для отписки

  @ViewChild(StopPointListComponent, { static: false }) stopPointList!: StopPointListComponent;


  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private stopPointDataService: StopPointDataService, // Инъектируем сервис
    private stopService: StopService,
    private stopDataService: StopDataService,
    private cdr: ChangeDetectorRef
  ) { }



  async ngAfterViewInit(): Promise<void> {
    console.log("StopPointList:", this.stopPointList); // Проверьте, что компонент доступен
    if (isPlatformBrowser(this.platformId)) { // Проверяем флаг
      this.cdr.detectChanges(); // Принудительно обновляем представление
      const leaflet = await this.importLeaflet();
      this.initializeMap(leaflet);
      this.loadMarkers(); // Добавляем маркеры на карту
      this.loadPolygons(); // Добавляем полигоны на карту
      this.subscribeToStopPoints(); // Подписываемся на изменения точек
      // Подписываемся на событие обновления карты
      this.stopPointDataService.refreshObject$.pipe(
        takeUntil(this.destroy$) // Отписываемся при уничтожении компонента
      ).subscribe(() => {
        this.loadMarkers(); // Обновляем маркеры
      });
      this.stopDataService.refreshObject$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.loadPolygons(); // Обновляем полигоны
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
      this.map = leaflet.map('map', {
        preferCanvas: true, // Использование канваса для улучшения производительности
        zoomAnimation: false, // Отключение анимации зума
        fadeAnimation: false, // Отключение анимации появления тайлов
        markerZoomAnimation: false // Отключение анимации маркеров при зуме
      }).setView([51.505, -0.09], 12);

      // Добавление слоя тайлов
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        detectRetina: true, // Оптимизация для Retina-дисплеев
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Обработчик контекстного меню
      this.map.on('contextmenu', (event: L.LeafletMouseEvent) => {
        event.originalEvent.preventDefault(); // Отключаем стандартное контекстное меню
        const coords: LatLngExpression = [event.latlng.lat, event.latlng.lng];
        this.showContextMenu(event.containerPoint, coords);
        console.log('Context menu caught...');
      });

      // Принудительная перерисовка карты при изменении размера или после загрузки
      window.addEventListener('resize', () => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });

      // Дополнительная оптимизация: принудительная перерисовка карты при движении
      this.map.on('moveend', () => {
        if (this.map) {
          this.map.invalidateSize(false); // Перерисовка без анимации
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private clearMarkers(): void {
    if (!this.map) return;

    // Удаляем все маркеры с карты
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        this.map?.removeLayer(layer);
      }
    });
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
    if (!this.map || !this.showStopPoints) return; // Добавлена проверка на showStopPoints

    const stopPoints = this.stopPointDataService.getStopPoints() || []; // Получаем список точек

    // Очищаем старые маркеры

    this.clearMarkers();

    // Добавляем новые маркеры
    stopPoints.forEach((stopPoint, index) => {
      const coords: LatLngExpression = [stopPoint.point.y, stopPoint.point.x];

      // Создаем кастомную иконку для круглого маркера
      const circleIcon = L.divIcon({
        className: 'circle-marker', // Класс для стилизации
        iconSize: [16, 16], // Размер иконки
        html: `<div style="background-color: green; width: 16px; height: 16px; border-radius: 50%; border: 2px solid darkgreen;"></div>`
      });

      // Создаем маркер с кастомной иконкой
      const marker = L.marker(coords, {
        icon: circleIcon,
        draggable: true // Делаем маркер перетаскиваемым
      }).addTo(this.map!)
        .bindPopup(`StopPoint ${stopPoint.number}: ${stopPoint.persistent.name}`)
        .openPopup();

      // Обработчик события начала перетаскивания
      marker.on('dragstart', () => {
        console.log("Map dragging stopped");
        this.map?.dragging.disable(); // Отключаем перетаскивание карты
      });

      // Обработчик события окончания перетаскивания
      marker.on('dragend', (event) => {
        const newCoords = event.target.getLatLng(); // Новые координаты маркера
        const oldCoords: LatLngExpression = [stopPoint.point.y, stopPoint.point.x];

        // Проверяем, изменились ли координаты
        if (newCoords.lat !== oldCoords[0] || newCoords.lng !== oldCoords[1]) {
          const confirmed = confirm(`Вы уверены, что хотите изменить координаты точки?\nНовые координаты: ${newCoords.lat}, ${newCoords.lng}`);

          if (confirmed) {
            // Обновляем координаты точки
            stopPoint.point.y = newCoords.lat;
            stopPoint.point.x = newCoords.lng;

            // Используем сервис для редактирования точки
            this.stopPointDataService.requestEditStopPoint(stopPoint);
          } else {
            // Возвращаем маркер на исходное место, если пользователь отменил изменение
            event.target.setLatLng(oldCoords);
          }
        }

        this.map?.dragging.enable(); // Включаем перетаскивание карты обратно
      });

      // Обработчик события ПКМ на маркере
      marker.on('contextmenu', (event) => {
        event.originalEvent.preventDefault(); // Отключаем стандартное контекстное меню

        // Создаем HTML-код для попапа
        const popupContent = `
        <div style="padding: 10px; background-color: white; border: 1px solid #ccc;">
          <button style="padding: 5px 10px; cursor: pointer; margin-right: 5px;" id="editPointButton">
            Редактировать
          </button>
          <button style="padding: 5px 10px; cursor: pointer;" id="deletePointButton">
            Удалить
          </button>
        </div>
      `;

        // Создаем попап и добавляем его на карту
        const popup = L.popup()
          .setLatLng(event.latlng)
          .setContent(popupContent)
          .openOn(this.map!);

        // Обработчик для кнопки "Редактировать"
        const editButton = document.getElementById('editPointButton');
        if (editButton) {
          editButton.onclick = () => {
            popup.close(); // Закрываем попап
            this.stopPointDataService.openEditDialog(stopPoint); // Открываем модальное окно для редактирования
          };
        }

        // Обработчик для кнопки "Удалить"
        const deleteButton = document.getElementById('deletePointButton');
        if (deleteButton) {
          deleteButton.onclick = () => {
            popup.close(); // Закрываем попап
            this.stopPointDataService.requestDeleteStopPoint(stopPoint.persistent.id!); // Удаляем точку
          };
        }
      });
    });
  }


  private subscribeToStopPoints(): void {
    this.stopPointDataService.stopPoints$.subscribe(() => {
      this.loadMarkers(); // Перерисовываем маркеры при изменении данных
    });
  }

  private loadPolygons(): void {
    if (!this.map || !this.showStops) return; // Не добавляем полигоны, если showStops равно false

    const stops = this.stopDataService.getStops(); // Получаем список остановок

    // Очищаем старые полигоны
    this.stopPolygons.forEach(polygon => this.map?.removeLayer(polygon));
    this.stopPolygons = [];

    // Создаем массив запросов для получения полигонов
    const requests = stops
      .filter(stop => stop.persistent.id !== undefined) // Фильтруем остановки с определенным ID
      .map(stop =>
        this.stopService.getPolygon(stop.persistent.id!).pipe(
          tap(polygonCoords => {
            console.log(`Запрос для Stop ID ${stop.persistent.id} успешен. Получено точек: ${polygonCoords.length}`);
          }),
          catchError(error => {
            console.error(`Ошибка при запросе полигона для Stop ID ${stop.persistent.id}:`, error);
            return of(null); // Возвращаем null в случае ошибки
          })
        )
      );

    // Выполняем все запросы параллельно
    forkJoin(requests).subscribe(results => {
      results.forEach((polygonCoords, index) => {
        const stop = stops[index];

        // Если координаты не получены (ошибка или пустой ответ), пропускаем отрисовку
        if (!polygonCoords || polygonCoords.length === 0) {
          console.warn(`Для Stop ID ${stop.persistent.id} полигон не будет отрисован (нет данных или ошибка).`);
          return;
        }

        // Преобразуем координаты в формат, подходящий для Leaflet
        const latLngs = polygonCoords.map((coord: number[]) => [coord[1], coord[0]] as LatLngExpression);

        // Создаем полигон и добавляем его на карту
        const polygon = L.polygon(latLngs, {
          color: 'orange',
          fillColor: '#ffa500',
          fillOpacity: 0.5
        }).addTo(this.map!);

        // Сохраняем полигон в массив для дальнейшего управления
        this.stopPolygons.push(polygon);

        console.log(`Полигон для Stop ID ${stop.persistent.id} успешно отрисован.`);
      });
    });
  }

  public toggleStopsVisibility(visible: boolean): void {
    this.showStops = visible;

    if (!visible) {
      // Если флаг false, удаляем все полигоны
      this.stopPolygons.forEach(polygon => this.map?.removeLayer(polygon));
      this.stopPolygons = [];
    } else {
      // Если флаг true, загружаем полигоны
      this.loadPolygons();
    }
  }

  public toggleStopPointsVisibility(visible: boolean): void {
    this.showStopPoints = visible;

    if (!visible) {
      // Если флаг false, удаляем все маркеры
      this.clearMarkers();
    } else {
      // Если флаг true, загружаем маркеры
      this.loadMarkers();
    }
  }

  // Добавьте методы для управления видимостью через UI
  toggleStops(): void {
    this.toggleStopsVisibility(!this.showStops);
  }

  toggleStopPoints(): void {
    this.toggleStopPointsVisibility(!this.showStopPoints);
  }




}










