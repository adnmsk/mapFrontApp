import {Component, ViewChild} from '@angular/core';
import {MapComponent} from './map/map.component';
import {StopPointListComponent} from './entity/transport/stoppoint/stoppointlist.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [MapComponent, StopPointListComponent,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule],
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
