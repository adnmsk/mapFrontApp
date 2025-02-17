import {Component, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MapComponent} from './map/map.component';
import {StopPointListComponent} from './entity/transport/stoppoint/stoppointlist.component';

@Component({
  selector: 'app-root',
  imports: [ MapComponent, StopPointListComponent],
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
