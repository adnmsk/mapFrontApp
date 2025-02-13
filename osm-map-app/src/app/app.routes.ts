import { Routes } from '@angular/router';
import { Route } from '@angular/router';
import {MapComponent} from './map/map.component';


export const routes: Route[] = [
  { path: 'map', component: MapComponent },
  { path: '', redirectTo: '/map', pathMatch: 'full' }
];
