import { Component, OnInit } from '@angular/core';
import {DiveService} from '../services/dive.service';
import * as L from 'leaflet';
@Component({
  selector: 'app-dives',
  templateUrl: './dives.component.html',
  styleUrls: ['./dives.component.scss']
})
export class DivesComponent implements OnInit {
  dives = [];
  panelOpenState: boolean = false;
  map: L.Map;
  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 12,
    center: L.latLng(43, 6.3833),
    dragging: true
  };
  constructor(private diveService: DiveService) { }

  ngOnInit() {
    this.diveService.getDives().then(data => {
      console.log(data);
      this.dives = data;
    }, error => {
      console.log(error);
    })
  }
  formatDate(date: any) {
    const dt = new Date(date);
    return dt.getMonth() + '/' + dt.getDay() + '/' + dt.getFullYear();
  }


}
