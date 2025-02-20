import {Component, ViewChild} from '@angular/core';
import {MapComponent} from './map/map.component';
import {StopPointListComponent} from './entity/transport/stoppoint/stoppointlist.component';

@Component({
  selector: 'app-root',
  imports: [MapComponent, StopPointListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'osm-map-app';

  @ViewChild(StopPointListComponent) stopPointListComponent: StopPointListComponent | undefined;

  addRandomPoint(): void {
    if (this.stopPointListComponent) {
      this.stopPointListComponent.addRandomStopPoint(); // Вызываем метод дочернего компонента
    }
  }



}
