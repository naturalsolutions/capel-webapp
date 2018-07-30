import { Component, OnInit, OnDestroy, Input, Inject, ViewEncapsulation } from '@angular/core';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material'
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import * as L from 'leaflet';

import { config } from '../settings';
import { NgRedux } from '@angular-redux/store';
import {DiveService} from '../services/dive.service';


@Component({
  selector: 'app-profile',
  templateUrl: './permit.component.html',
  styleUrls: ['./permit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PermitComponent implements OnInit {
  map;
  leafletOptions = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 8,
    center: L.latLng(43, 6.3833),
    dragging: true,
    scrollWheelZoom: false
  };
  iconUser = L.icon({
    iconUrl: 'assets/icon-marker-user.png',
    iconSize: [49, 50], // size of the icon
    iconAnchor: [17, 50],
    popupAnchor: [0, -50]
  });
  userDiveSites: any[] = [];
  constructor(
    public dialog: MatDialog,
    private diveService: DiveService
  ) {
  }

  ngOnInit() {
    this.diveService.getUserSites().then(data => {
      this.userDiveSites = data;
      for(let userDiveSite of this.userDiveSites){
        const marker = L.marker([userDiveSite.latitude, userDiveSite.longitude], {
          title: userDiveSite.name,
          icon: this.iconUser,
          radius: 20
        }).addTo(this.map);
        marker.bindPopup(userDiveSite.name).openPopup();
      }
    }, error => {
      console.log(error);
    });
    this.diveService.getDiveHearts().then(data => {

      for (let heart of data) {
        heart.geom_poly = JSON.parse(heart.geom_poly);
        let geojsonFeature = {
          'type': 'Feature',
          'properties': {
            'name': 'Coors Field',
            'amenity': 'Baseball Stadium',
            'popupContent': heart.name
          },
          'geometry': heart.geom_poly
        };
        new L.geoJSON(geojsonFeature, {
          style: function (feature) {
            return feature.properties.style;
          },
          onEachFeature(feature, layer) {
            var popupContent = '';
            if (feature.properties && feature.properties.popupContent) {
              popupContent += "<b>"+feature.properties.popupContent+"</b>";
              popupContent += "</br> Vous êtes en cœur de parc, la plongée est soumise à la signature d'un règlement </br>";
              popupContent += "<a target='_blank' href='http://www.portcros-parcnational.fr/fr/le-parc-national-de-port-cros/se-renseigner-sur-les-reglementations'";
              popupContent += "mat-raised-button mat-dialog-close color='primary'>";
              popupContent += "Voir les dispositions réglementaires </a>";
            }
            layer.bindPopup(popupContent);
          }
        }).addTo(this.map);

      }
    });
  }

  onMapReady(map: L.Map) {
    L.marker([50.6311634, 3.0599573]).addTo(map);
    this.map = map;
    /* map.on('click', (e) => {
      console.log(e.latlng);
      this.diveForm.controls['latlng'].setValue(e.latlng);
    }); */
  }

  showRule() {
    let dialogRef = this.dialog.open(RuleDialog, {
      panelClass: 'rule'
    });
  }
}

@Component({
  selector: 'rule-dialog',
  template: `
    <h2 mat-dialog-title class="text-center"><small class="d-block">Réglement 2018 de la plongée sous-marine</small> dans les coeurs marins du parc national de Port-Cros</h2>
    <mat-dialog-content>
      <iframe src="./assets/reglement_pnpc_coeurs_marins_2018.pdf"></iframe>
    </mat-dialog-content>
    <mat-dialog-actions class="justify-content-end">
      <div class="col">
        <mat-checkbox class="d-block" (change)="onCheckBoxChange($event, 'a')">Je m'engage à respecter la réglementation marine en coeur de Parc</mat-checkbox>
        <mat-checkbox class="d-block" (change)="onCheckBoxChange($event, 'b')">Je m'engage à respecter les conditions du règlement de plongée</mat-checkbox>
        <mat-checkbox class="d-block" (change)="onCheckBoxChange($event, 'c')">je m'engage ainsi à renseigner mes données de plongée</mat-checkbox>
      </div>
      <div>
        <a mat-raised-button mat-dialog-close class="btn btn-secondary" [disabled]="!hasCheckAll" href="{{ config.serverURL }}/api/users/{{ user.id }}/permit.pdf">
          Télécharger l'autorisation
        </a>
      </div>
    </mat-dialog-actions>`
})
export class RuleDialog {

  user: any;
  config: any;
  hasCheckAll:boolean;
  cbs:any = {
    a: false,
    b: false,
    c: false
  };

  constructor(
    public dialogRef: MatDialogRef<RuleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ngRedux: NgRedux<any>) {
    this.config = config;
  }

  ngOnInit() {
    this.user = _.get(this.ngRedux.getState().session, 'profile');
  }

  onCheckBoxChange(e, value) {
    this.cbs[value] = e.checked;
    for (const key in this.cbs) {
      if (!this.cbs[key]) {
        this.hasCheckAll = false;
        return;
      }
    }
    this.hasCheckAll = true;
  }
}
