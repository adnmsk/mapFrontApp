import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map!: L.Map; // Используем non-null assertion
  private markers: L.LatLng[] = []; // Массив для хранения координат маркеров

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([55.751244, 37.618423], 13); // Москва

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Добавляем обработчик кликов для добавления маркеров и линий
    this.map.on('click', (e) => this.addMarkerAndLine(e));
  }

  private addMarkerAndLine(e: L.LeafletMouseEvent): void {
    const latlng = e.latlng;

    // Создаём новый маркер
    const marker = L.marker(latlng).addTo(this.map);

    // Добавляем координаты в массив
    this.markers.push(latlng);

    // Если маркеров больше одного, рисуем линию
    if (this.markers.length > 1) {
      L.polyline(this.markers, { color: 'red' }).addTo(this.map);
    }
  }
}
