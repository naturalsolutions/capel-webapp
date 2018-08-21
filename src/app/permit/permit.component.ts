import { Component, OnInit, OnDestroy, Input, Inject, ViewEncapsulation } from '@angular/core';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA, MatSnackBar
} from '@angular/material';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import * as L from 'leaflet';

import { config } from '../settings';
import { NgRedux } from '@angular-redux/store';
import {DiveService} from '../services/dive.service';
import {PermitService} from '../services/permit.service';


@Component({
  selector: 'app-profile',
  templateUrl: './permit.component.html',
  styleUrls: ['./permit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PermitComponent implements OnInit {
  map;
  permit;
  leafletOptions = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 9,
    center: L.latLng(42.976520698105546, 6.284179687500001),
    dragging: true,
    scrollWheelZoom: false
  };
  iconUserPublic = L.icon({
    iconUrl: 'assets/icon-marker-user.png',
    iconSize: [49, 50], // size of the icon
    iconAnchor: [17, 50],
    popupAnchor: [0, -50]
  });
  iconUserPrivate = L.icon({
    iconUrl: 'assets/icon-marker-user-private.png',
    iconSize: [49, 50], // size of the icon
    iconAnchor: [17, 50],
    popupAnchor: [0, -50]
  });
  date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  userDiveSites: any[] = [];
  constructor(
    public dialog: MatDialog,
    private diveService: DiveService,
    private permitService: PermitService,
    private ngRedux: NgRedux<any>,
    private snackBar: MatSnackBar
  ) {
    this.permitService.get().then(data => {
      console.log(data);
      this.permit = data;
    });
  }
  getFormatedDate(date_p){
    return new Date(date_p).toLocaleDateString('fr-FR', this.date_options);
  }
  ngOnInit() {
    this.diveService.getUserSites().then(data => {
      this.userDiveSites = data;
      for(let userDiveSite of this.userDiveSites){
        const marker = L.marker([userDiveSite.latitude, userDiveSite.longitude], {
          title: userDiveSite.name,
          icon: userDiveSite.privacy === 'private'? this.iconUserPrivate: this.iconUserPublic,
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
              popupContent += "<a target='_blank' href='http://149.202.44.29/site/reglementation.html'";
              popupContent += "mat-raised-button mat-dialog-close color='primary'>";
              popupContent += "Voir les dispositions </a>";
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
    const legend = new (L.Control.extend({
      options: { position: 'topright' }
    }));
    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'legend');
      const labels = ['assets/icon-marker-user.png','assets/icon-marker.png', 'assets/icon-marker-user-private.png'];
      const grades =["Site de plongée personnel", "Site de plongée public", "Site de plongée privé"];
      div.innerHTML = '<div><b>Légende</b></div>';
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += (" <img src="+ labels[i] +" height='30' width='20'>  ") + grades[i] +'<br><br>';
      }
      div.innerHTML += "<div style='width: 20px;height: 20px;background-color: blue;float:left'></div>   Coeur Marin"
      return div;
    };
    legend.addTo(map);
  }

  showRule() {
    let profile = this.ngRedux.getState().session.profile
    if (profile.offenses.length > 0)
      if (new Date().getTime() >= new Date(profile.offenses[0].start_at).getTime()
        &&
        new Date().getTime() <= new Date(profile.offenses[0].end_at).getTime())
      {
        this.snackBar.open('Vous ne pouvez pas signer une autorisation', 'OK', {
          duration: 3000
        });
        return;
      }
    if (this.permit) {
      window.location.href = config.serverURL
      +"/api/users/" + _.get(this.ngRedux.getState().session, 'profile').id + "/permit.pdf";
    }else {
      let dialogRef = this.dialog.open(RuleDialog, {
        panelClass: 'rule'
      });
    }
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
export class RuleDialog implements OnInit{
  permits: any[]
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
    private ngRedux: NgRedux<any>
  ) {
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
