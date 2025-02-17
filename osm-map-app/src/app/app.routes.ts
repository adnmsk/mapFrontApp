
import { Route } from '@angular/router';
import {MapComponent} from './map/map.component';
import {StopPointListComponent} from './entity/transport/stoppoint/stoppointlist.component';




export const routes: Route[] = [
  { path: 'map', component: MapComponent },
  { path: 'stop-points', component: StopPointListComponent },
  { path: '', redirectTo: '/stop-points', pathMatch: 'full' }
];
