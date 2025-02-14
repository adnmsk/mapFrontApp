import {Component, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MapComponent} from './map/map.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'osm-map-app';

  @ViewChild(MapComponent) mapComponent!: MapComponent; // Ссылка на MapComponent

  addRandomPoint(): void {
    if (this.mapComponent) {
      this.mapComponent.addRandomPoint(); // Вызываем метод дочернего компонента
    }
  }
}
