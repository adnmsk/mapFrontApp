import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  private map: L.Map | null = null; // Ссылка на карту (тип будет определен после импорта Leaflet)
  private points: L.LatLngExpression[] = [ // Массив точек
    [51.5, -0.09], // Точка 1
    [51.51, -0.1], // Точка 2
    [51.52, -0.11] // Точка 3
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      const L = await this.importLeaflet(); // Динамический импорт Leaflet
      this.initializeMap(L);
      this.addMarkers(L);
      this.addPolyline(L);
    }
  }

  // Динамический импорт Leaflet
  private async importLeaflet(): Promise<typeof L> {
    return (await import('leaflet')) as typeof L;
  }

  // Инициализация карты

  // @ts-ignore
  private initializeMap(L: typeof L): void {
    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map!);
  }

  // Добавление маркеров на карту
  // @ts-ignore
  private addMarkers(L: typeof L): void {
    this.points.forEach((point, index) => {
      L.marker(point)
        .addTo(this.map!)
        .bindPopup(`Точка ${index + 1}`)
        .openPopup();
    });
  }

  // Добавление линии, соединяющей точки
  // @ts-ignore
  private addPolyline(L: typeof L): void {
    if (this.map) {
      this.map.eachLayer(layer => {
        if (layer instanceof L.Polyline) {
          if (this.map != null) {
            this.map.removeLayer(layer); // Удаляем старую линию перед отрисовкой новой
          }
        }
      });
      L.polyline(this.points, { color: 'blue' }).addTo(this.map!);
    }
  }

  // Метод для добавления новой точки
  public async addPoint(lat: number, lng: number): Promise<void> {
    if (this.map && isPlatformBrowser(this.platformId)) {
      const L = await this.importLeaflet(); // Динамически импортируем Leaflet

      const point = [lat, lng] as L.LatLngExpression;
      L.circleMarker(point, { // Используем circleMarker для новых точек
        radius: 8,
        fillColor: 'blue',
        color: 'darkblue',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
        .addTo(this.map)
        .bindPopup(`Новая точка: ${lat}, ${lng}`)
        .openPopup();
      this.points.push(point);
      this.addPolyline(await this.importLeaflet());
    }
  }



  // Метод для добавления случайной точки
  public async addRandomPoint(): Promise<void> {
    if (this.map && isPlatformBrowser(this.platformId)) {
      const L = await this.importLeaflet(); // Динамически импортируем Leaflet

      const lat = 51.5 + Math.random() * 0.1; // Случайная широта
      const lng = -0.09 - Math.random() * 0.1; // Случайная долгота
      await this.addPoint(lat, lng); // Добавляем точку
    }
  }


}
