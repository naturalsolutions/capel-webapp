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
import { lg_colors, colors} from '../app-assets/colors';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatisticsComponent implements OnInit {
  user: any = {};
  grpCaption = 'Statistiques du nombre de plongées';
  displayBoats: any = {
    boats: [],
    delta: 0
  };
  map: L.Map;
  leafletOptions = {
    layers: [
      L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
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
  optionsHistoSites: any;
  optionsMoy: any;
  sites: any[] = [];
  savedSites: any[] = [];
  userDiveSites: any[] = [];
  savedDiveSites: any[] = [];
  countries = countries;
  divehearts;
  months = [
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
    'Décembre',
  ]
  fl_heart: any = 'tous';
  fl_month: any = 'tous';
  fl_year: any = 'tous';
  fl_site: any = 'tous';
  constructor(
    private diveService: DiveService,
    private ngRedux: NgRedux<any>,
    private dialog: MatDialog,
    private userService: UserService,
    private zone:NgZone,
    private sessionActionsService: SessionActionsService,
    private sanitizer: DomSanitizer
  ) {
    let dialogm = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    this.diveService.getDives().then(data => {
      console.log(data);
      dialogm.close()
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
    this.dives = this.savedDives;
    this.grpCaption = 'Nombre de plongées  pour  ';
    this.grpCaption += ' Site: '+ (this.fl_site !== 'tous'?this.fl_site.name : 'Tous');
    this.grpCaption += ', Coeur Marin: '+ (this.fl_heart !== 'tous'?this.fl_heart.name: 'Tous ');
    this.grpCaption += ', Année: '+ (this.fl_year !== 'tous'?this.fl_year: 'Toutes');
    this.grpCaption += ', Mois : '+ (this.fl_year !== 'tous'?this.fl_month: 'Tous');
    this.dives =  this.savedDives.filter(dive => {
      if (
        (this.fl_site !== 'tous' ? this.fl_site.id === dive.dive_site.id : true)
        &&
        (this.fl_heart !== 'tous' ? this.fl_heart.id === dive.dive_site.heart_id : true)
        &&
        (this.fl_year !== 'tous' ? new Date(dive.divingDate).getFullYear() === this.fl_year : true)
        &&
        (this.fl_month !== 'tous' ? new Date(dive.divingDate).getMonth() === this.fl_month : true)
      )
        return dive;
    });

    this.dumpChar();
    this.userDiveSites =  this.savedDiveSites;
    if (this.fl_heart !== 'tous') {
      console.log(this.fl_heart);
      this.userDiveSites = this.userDiveSites.filter(site => {
        if (site.heart_id === this.fl_heart.id) {
          return site;
        }
      });
    }
  }
  /*
  setStatisticsByDate(event) {
    this.grpCaption = 'Nombre de plongées en ' + event.value
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
  */

  dumpChar() {
    this.getExploredSite();
    this.nbrDives = this.dives.length;
    this.getNbrHoursInWaterAndNbrMonth();
    let dataChart = [
      this.getNbrDive(0),
      this.getNbrDive(1),
      this.getNbrDive(2),
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
        categories: this.months
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
    let categories = [];
    let data = [];
    for(let site of this.sites){
      categories.push(site.name);
      let i = 0;
      for(let dive of this.dives){
        if(dive.dive_site.id == site.id){
          i++;
        }
      }
      data.push(i);
    }
    this.optionsHistoSites = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'histogramme de nombre de plongée par site'
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        categories: categories,
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f} plongées</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0,
          borderWidth: 0,
          groupPadding: 0,
          shadow: false
        }
      },
      series: [{
        name: 'Sites de plongée',
        data: data

      }]
    };
    this.optionsMoy = {
      title: {
        text: 'Moyen des plongées'
      },

      xAxis: {
      },
      series: [{
        type: 'pie',
        name: 'Plongées',
        allowPointSelect: true,
        keys: ['name', 'y', 'selected', 'sliced'],
        data: [
          ['Par Site', this.dives.length / this.sites.length],
          ['Par Année', this.dives.length / 1],
          ['Par Mois', this.dives.length / this.nbrDivesMonths]
        ],
        showInLegend: true
      }]
    }
  }

  ngOnInit() {
    this.fetch();
    this.diveService.getUserSites().then(data => {
      this.userDiveSites = data;
      this.savedDiveSites = data;
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
    this.diveService.getDiveHearts().then(data => {
      this.divehearts = data;
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
          style:  {
            "color": colors[heart.name],
            "weight": 5,
            "opacity": 0.65
          },
          onEachFeature(feature, layer) {
            var popupContent = '';
            if (feature.properties && feature.properties.popupContent) {
              popupContent += "<b>"+feature.properties.popupContent+"</b>";
              popupContent += "</br> Cœurs marins du Parc national de "+heart.name+", plongée soumise à la signature d'un règlement</br>";
              popupContent += "<a target='_blank' href='/site/reglementation.html'";
              popupContent += "mat-raised-button mat-dialog-close color='primary'>";
              popupContent += "Voir les dispositions </a>";
            }
            layer.bindPopup(popupContent);
          }
        }).addTo(this.map);

      }
    });
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
      for (var key in lg_colors)
        div.innerHTML +=  '<i class="legend-icon" style="background-color: '+lg_colors[key]+';"></i>' + key + '<br><br>';
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
      if ((new Date(dive.divingDate).getMonth()) === month)
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
    this.savedSites = this.sites;
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
