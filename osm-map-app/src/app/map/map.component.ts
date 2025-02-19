import {Component, AfterViewInit, Output, EventEmitter, Inject, PLATFORM_ID, ViewChild} from '@angular/core';
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
  PanOptions, PathOptions, PolylineOptions, Popup, PopupEvent, Projection, Rectangle,
  SVGOverlay, Tooltip, TooltipOptions, ZoomPanOptions
} from 'leaflet';
import {StopPointDataService} from '../service/stop-point-data.service';
import {StopPointService} from '../service/stoppoint.service';
import {StopPoint} from '../entity/transport/stoppoint/stoppoint';
import {StopPointListComponent} from '../entity/transport/stoppoint/stoppointlist.component';



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  @Output() createStopPoint = new EventEmitter<L.LatLngExpression>(); // Событие для создания точки
  private map: L.Map | null = null;
  private stopPoints: any[] = []; // Массив StopPoint

  @ViewChild(StopPointListComponent) stopPointList!: StopPointListComponent; // Ссылка на StopPointListComponent


  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private stopPointDataService: StopPointDataService, // Инъектируем сервис
  ) { }



  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) { // Проверяем флаг
      const leaflet = await this.importLeaflet();
      this.initializeMap(leaflet);
      await this.addMarkers();// Добавляем маркеры на карту

    }
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
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }


  private showContextMenu(position: L.Point, coords: LatLngExpression): void {
    if (!this.map) return;

    const lat = (coords as [number, number])[0];
    const lng = (coords as [number, number])[1];

    const popupContent = `
      <div style="padding: 10px; background-color: white; border: 1px solid #ccc;">
        <button style="padding: 5px 10px; cursor: pointer;" onclick="confirmCreatePoint(${lat}, ${lng})">
          Создать новую точку
        </button>
      </div>
    `;

    this.map.openPopup(popupContent, this.map.containerPointToLatLng(position));
  }



  // Глобальная функция для подтверждения создания точки
  confirmCreatePoint(lat: number, lng: number): void {
    const confirmed = confirm(`Вы уверены, что хотите создать новую точку?\nКоординаты: ${lat}, ${lng}`);
    if (confirmed && this.stopPointList) {
      this.stopPointList.createStopPoint([lat, lng]); // Вызываем метод createStopPoint из StopPointListComponent
    }
  }

  private loadMarkers(): void {
    const stopPoints = this.stopPointList.stopPoints; // Получаем список точек из StopPointListComponent
    if (!this.map || !this.stopPointList) return;
    if (this.map) {
      this.map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          // @ts-ignore
          this.map.removeLayer(layer); // Очищаем старые маркеры
        }
      });
    }

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
        // @ts-ignore
        .addTo(this.map)
        .bindPopup(`Точка остановки ${index + 1}: ${stopPoint.persistent.name}`)
        .openPopup();
    });
  }



  // @ts-ignore
  private async addMarkers(): Promise<typeof L> {
    console.log("Loaded to create marks", this.stopPoints.length)
    this.stopPoints.forEach((stopPoint: {
      point: { y: number[]; x: number };
      persistent: { name: any; id: any; description: any };
    }, index: number) => {
      const coords = [stopPoint.point.y, stopPoint.point.x];

      // @ts-ignore
      L.circleMarker(coords, {
        radius: 8,
        fillColor: 'green',
        color: 'darkgreen',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
        .addTo(this.map!)
        .bindPopup(`StopPoint ${index + 1}: ${stopPoint.persistent.name} ${stopPoint.persistent.description} ${stopPoint.persistent.id}`)
        .openPopup();
    });
  }



}







