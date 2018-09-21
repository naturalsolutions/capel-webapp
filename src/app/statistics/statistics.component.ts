import {Component, OnInit, ViewEncapsulation, Inject, NgZone} from '@angular/core';
import { DiveService } from '../services/dive.service';
import { NgRedux } from '@angular-redux/store';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UserService } from '../services/user.service';
import * as _ from 'lodash';
import * as L from 'leaflet';
import {countries} from '../app-assets/countries/fr';
import {DiveHeartDialog} from '../dive/dive.component';
import {SessionActionsService} from '../store/session/session-actions.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatisticsComponent implements OnInit {
  user: any = {};
  grpCaption = 'Statistiques du nombre de plongées par an';
  displayBoats: any = {
    boats: [],
    delta: 0
  };
  map: L.Map;
  leafletOptions = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 9,
    center: L.latLng(42.976520698105546, 6.284179687500001),
    dragging: true,
    scrollWheelZoom: false
  };
  icon = L.icon({
    iconUrl: 'assets/icon-marker.png',
    iconSize: [25, 51], // size of the icon
    iconAnchor: [19, 51], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -51] // point from which the popup should open relative to the iconAnchor
  });
  iconUserPublic = L.icon({
    iconUrl: 'assets/icon-marker-user.png',
    iconSize: [25, 51], // size of the icon
    iconAnchor: [17, 50],
    popupAnchor: [0, -50]
  });
  iconUserPrivate = L.icon({
    iconUrl: 'assets/icon-marker-user-private.png',
    iconSize: [25, 51], // size of the icon
    iconAnchor: [17, 50],
    popupAnchor: [0, -50]
  });

  dives: any[];
  savedDives: any[];
  nbrDivesMonths: any = 0;
  nbrHoursInWater: any = 0;
  nbrDives: any = 0;
  options: any;
  sites: any[] = [];
  userDiveSites: any[] = [];
  countries = countries;

  constructor(
    private diveService: DiveService,
    private ngRedux: NgRedux<any>,
    private dialog: MatDialog,
    private userService: UserService,
    private zone:NgZone,
    private sessionActionsService: SessionActionsService,
    private sanitizer: DomSanitizer
  ) {

    this.diveService.getDives().then(data => {
      data = data.filter( item => {
       if (!item.shop)
         return item;
      })
      this.savedDives = data;
      this.dives = data;
      this.dumpChar();
    }, error => {
      console.log(error);
    });
  }

  setStatistics(event) {
    console.log(event.value);
    this.grpCaption = 'Statistiques du nombre de plongées pour le site ' + event.value.name
    if (event.value === 'tous') {
      this.dives = this.savedDives;
    } else {
    this.dives =  this.savedDives.filter(dive => {
      if (dive.dive_site.id == event.value.id)
        return dive;
    });
    }
    this.dumpChar();
  }

  setStatisticsByDate(event) {
    this.grpCaption = 'Statistiques du nombre de plongées en ' + event.value
    console.log(event.value);
    if (event.value === 'tous') {
      this.dives = this.savedDives;
    } else {
      this.dives = this.savedDives.filter(dive => {
        if (new Date(dive.divingDate).getFullYear() === event.value) {
          return dive;
        }
      });
    }
    this.dumpChar();
  }

  dumpChar() {
    this.getExploredSite();
    this.nbrDives = this.dives.length;
    this.getNbrHoursInWaterAndNbrMonth();
    let dataChart = [
      this.getNbrDive(0),
      this.getNbrDive(1),
      this.getNbrDive(3),
      this.getNbrDive(4),
      this.getNbrDive(5),
      this.getNbrDive(6),
      this.getNbrDive(7),
      this.getNbrDive(8),
      this.getNbrDive(9),
      this.getNbrDive(10),
      this.getNbrDive(11)
    ];
    this.options = {
      chart: {
        type: 'areaspline'
      },
      title: {
        text: this.grpCaption + ', Total: '+ this.dives.length
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 150,
        y: 100,
        floating: true,
        borderWidth: 1
      },
      xAxis: {
        categories: [
          'Janvier',
          'Fevrier',
          'Mars',
          'Avril',
          'Mai',
          'Juin',
          'Juillet',
          'Aout',
          'Septembre',
          'Octobre',
          'Novembre',
          'Decembre'
        ]
      },
      yAxis: {
        title: {
          text: 'Capel'
        }
      },
      tooltip: {
        shared: true,
        valueSuffix: ' plongées'
      },
      credits: {
        enabled: false
      },
      series: [{
        showInLegend: false,
        name: this.dives.length,
        data: dataChart
      }]
    };
  }

  ngOnInit() {
    this.fetch();
    this.diveService.getUserSites().then(data => {
      this.userDiveSites = data;
      let icon = this.icon;
      for(let userDiveSite of this.userDiveSites){
        icon = this.icon;
        if (userDiveSite.privacy === 'public') icon = this.iconUserPublic;
        if (userDiveSite.privacy === 'private') icon = this.iconUserPrivate;
        const marker = L.marker([userDiveSite.latitude, userDiveSite.longitude], {
          title: userDiveSite.name,
          icon: icon,
          radius: 20
        }).addTo(this.map);
        marker.bindPopup(userDiveSite.name).openPopup();
      }
    }, error => {
      console.log(error);
    });
    /*
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
    */
  }

  onZoneClick(e) {

      this.zone.run(() => {
        this.dialog.open(DiveHeartDialog, {
          width: '600px',
        });
      });
  }
  onMapReady(map: L.Map) {
    this.map = map;
    const legend = new (L.Control.extend({
      options: { position: 'topright' }
    }));

    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'legend');
      const labels = ['assets/icon-marker.png', 'assets/icon-marker-user.png', 'assets/icon-marker-user-private.png'];
      const grades =["Site de plongée référencé", "Site de plongée public", "Site de plongée privé"];
      div.innerHTML = '<div><b>Légende</b></div>';
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += (" <img src="+ labels[i] +" height='30' width='20'>  ") + grades[i] +'<br><br>';
      }
      return div;
    };
    legend.addTo(map);
  }

  fetch() {
    this.userService.getProfile()
      .then(data => {
        this.feed(data);
      }, error => {
        console.log(error);
      });
  }

  feed(data) {
    this.user = data;
    this.displayBoats.boats = _.take(data.boats, 2);
    this.displayBoats.delta = data.boats.length - this.displayBoats.boats.length;
  }
  getImageSanitiser(img: any){
    return this.sanitizer.bypassSecurityTrustResourceUrl(img);
  }
  getNbrDive(month) {
    let nbr = 0;
    for (const dive of this.dives) {
      if ((new Date(dive.divingDate).getMonth() + 1) === month)
        nbr++;
    }
    return nbr;

  }
  checkPoint(e) {

    this.diveService.getCheckedPointHearts(e.latlng).then(hearts => {
      let checker = 0;
      if ( hearts.length ) {
        this.zone.run(() => {
          let dialogRef = this.dialog.open(DiveHeartDialog, {
            width: '600px',
            data: {
              site: e.latlng
            }
          });

        });
      }
    });
  }
  getNbrHoursInWaterAndNbrMonth() {
    this.nbrDivesMonths = 0;
    this.nbrHoursInWater = 0;
    let oldDive: any;
    for (const dive of this.dives) {
      this.calculateTimeInwater(dive.times[0][0].split(':'), dive.times[0][1].split(':'))
      if (!oldDive) {
        this.nbrDivesMonths++;
        oldDive = dive;
      } else {

        if ((new Date(dive.divingDate).getMonth() + 1) === (new Date(oldDive.divingDate).getMonth() + 1)) {
          oldDive = dive;
        } else {
          this.nbrDivesMonths++;
          oldDive = dive;
        }
      }
    }
  }

  getExploredSite() {
    this.sites = []
    for (const dive of this.dives) {
      let exists = false;
      for (let site of this.sites)
        if (site.id === dive.dive_site.id)
          exists = true;
      if (!exists)
        this.sites.push(dive.dive_site);
    }

  }
  roundToInt(flr:any){
    return Math.round(flr);
  }
  calculateTimeInwater(startTime, endTime) {
    this.nbrHoursInWater += Math.abs(
      (
        ((Number(endTime[0]) * 60) + Number(endTime[1])) -
        ((Number(startTime[0]) * 60) + Number(startTime[1]))
      )
      / 60
    );
  }

  openProfileForm(): void {
    this.dialog.open(ProfileFormDialogComponent, {
      width: '480px',
      data: { user: this.user }
    }).afterClosed()
      .subscribe(result => {
        this.feed(result);
      });
  }

}

@Component({
  selector: 'app-profile-form-dialog-component',
  template: `<mat-dialog-content><app-profile-form [method]="patch" (saved)="onSaved($event)"></app-profile-form></mat-dialog-content>`
})
export class ProfileFormDialogComponent {
  patch;
  constructor(
    public dialogRef: MatDialogRef<ProfileFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onSaved(e) {
    this.dialogRef.close(e);
  }
}
