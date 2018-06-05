import {Component, OnInit, ViewEncapsulation, Inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import * as _ from 'lodash';
import * as L from 'leaflet';

import {UserService} from '../services/user.service';
import {BoatService} from '../services/boat.service';
import {DiveService} from '../services/dive.service';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';

import {NgRedux} from '@angular-redux/store';
let divesite_id;

@Component({
  selector: 'app-dive',
  templateUrl: './dive.component.html',
  styleUrls: ['./dive.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},

    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ]
})
export class DiveComponent implements OnInit {

  hasSubmit: boolean;
  diveForm: FormGroup;
  times: FormArray = new FormArray([]);
  divetypes: FormArray = new FormArray([]);
  boats: any[] = [];
  initDiveType: any[] = [];
  users: any[] = [];
  diveSites: any[] = [];
  map: L.Map;
  leafletOptions = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
    ],
    zoom: 9,
    center: L.latLng(43, 6.3833),
    dragging: true,
    scrollWheelZoom: false
  };

  // Marker cluster stuff
  markerClusterGroup: L.MarkerClusterGroup;
  markerClusterData: any[] = [];
  markerClusterOptions: L.MarkerClusterGroupOptions;

  icon = L.icon({
    iconUrl: 'assets/icon-marker.png',
    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  profile: any;

  //Dive edit
  id: number;
  private sub: any;
  dive: any;

  constructor(private adapter: DateAdapter<any>,
              private boatService: BoatService,
              private diveService: DiveService,
              private userService: UserService,
              private snackBar: MatSnackBar,
              private router: Router,
              public dialog: MatDialog,
              private ngRedux: NgRedux<any>,
              private route: ActivatedRoute) {

    const appState = this.ngRedux.getState();
    this.profile = appState.session.profile;
    this.adapter.setLocale('fr');
    this.boatService.getBoats().then(data => {
      this.boats = data;
    }, error => {
      if (_.get(error, 'statusText') === 'UNAUTHORIZED') {
        this.snackBar.open('le Token est expiré', 'OK', {
          duration: 1000
        });
        this.router.navigate(['/login']);
      }
    });
    this.userService.getUsers().then(users => {
      this.users = _.filter(users, {category: 'structure'});
    });

  }

  ngOnInit() {

    this.diveForm = new FormGroup({
      divingDate: new FormControl('', Validators.required),
      referenced: new FormControl('notreferenced'),
      times: new FormArray([]),
      divetypes: new FormArray([]),
      boats: new FormControl([]),
      wind: new FormControl(''),
      water_temperature: new FormControl(null),
      wind_temperature: new FormControl(null),
      visibility: new FormControl(null),
      sky: new FormControl(null),
      seaState: new FormControl(''),
      structure: new FormControl(),
      isWithStructure: new FormControl(''),
      latlng: new FormControl('')
    });

    this.addTime('00:00', '00:00');

    this.diveService.getDiveTypes().then(data => {
      this.initDiveType = data;
      this.initDiveTypeForm();
    });

    this.diveForm.get('isWithStructure').valueChanges
      .subscribe(value => {
        this.diveForm.get('structure').setValidators(value ? Validators.required : null);
        this.diveForm.get('structure').reset();
      });

    this.diveForm.get('times').valueChanges
      .subscribe(value => {
      });

    this.diveService.getDiveSites().then(data => {
      this.diveSites = data;
      const listMarker: any[] = [];
      for (const diveSite of this.diveSites) {

        const marker = L.marker([diveSite.longitude, diveSite.latitude], {
          title: diveSite.name,
          icon: this.icon,
          radius: 20,
          divesite_id: diveSite.id,
          divesite_name: diveSite.name,

        });
        marker.bindPopup(diveSite.name).openPopup();
        marker.on('click', this.onClick.bind(this));
        listMarker.push(marker);
      }
      this.markerClusterData = listMarker;
    });

    this.diveService.getDiveHearts().then(data => {

      for (let heart of data) {
        heart.geom_poly = JSON.parse(heart.geom_poly);
        let geojsonFeature = {
          'type': 'Feature',
          'properties': {
            'name': 'Coors Field',
            'amenity': 'Baseball Stadium',
            'popupContent': 'This is where the Rockies play!'
          },
          'geometry': heart.geom_poly
        };
        new L.geoJSON(geojsonFeature, {
          style: function (feature) {
            return feature.properties.style;
          }
        }).addTo(this.map);

      }
    });

    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.diveService.get(this.id).then(dive => {
        this.dive = dive;
        this.setDiveFrom();
      }, error => {
        console.log(error);
      });
    });
  }

  setDiveFrom() {
    this.reset();
    this.addTime(this.dive.times[0][0].substring(0, 5), this.dive.times[0][1].substring(0, 5));
    this.diveForm.controls['divingDate'].setValue(new Date(this.dive.divingDate));
    divesite_id = this.dive.dive_site.id;
    this.diveForm.controls['latlng'].setValue('Vous avez plongé à : ' + this.dive.dive_site.name);
    this.diveForm.controls['wind'].setValue(this.dive.weather.wind);
    this.diveForm.controls['water_temperature'].setValue(this.dive.weather.water_temperature);
    this.diveForm.controls['wind_temperature'].setValue(this.dive.weather.wind_temperature);
    this.diveForm.controls['visibility'].setValue('' + this.dive.weather.visibility);
    this.diveForm.controls['sky'].setValue(this.dive.weather.sky);
    this.diveForm.controls['seaState'].setValue(this.dive.weather.seaState);
  }

  onClick(event) {
    divesite_id = event.target.options.divesite_id;
    this.diveForm.controls['latlng'].setValue('Vous avez plongé à : ' + event.target.options.divesite_name);
  }

  markerClusterReady(group: L.MarkerClusterGroup) {
    this.markerClusterGroup = group;
  }

  initDiveTypeForm() {
    this.divetypes = this.diveForm.get('divetypes') as FormArray;
    for (const divetype of this.initDiveType) {
      let exists: any = false;
      if (this.dive)
        exists = this.dive.typeDives.filter(
          typedive => typedive.id == divetype.id);

      this.divetypes.push(new FormGroup({
        id: new FormControl(divetype.id),
        selected: new FormControl(exists != false ? true : false),
        name: new FormControl(divetype.name),
        nameMat: new FormControl(divetype.name),
        nbrDivers: new FormControl(1),
      }));
    }
  }

  addTime(startTime, endTime) {
    this.times = this.diveForm.get('times') as FormArray;
    this.times.push(new FormGroup({
      startTime: new FormControl(startTime),
      endTime: new FormControl(endTime),
    }));
  }

  removeTimes() {
    while (this.times.length)
      this.times.removeAt(0);
  }

  removeTime(i) {
    this.times.removeAt(i);
  }

  onMapReady(map: L.Map) {
    L.marker([50.6311634, 3.0599573]).addTo(map);
    map.on('click', this.checkPoint.bind(this));
    this.map = map;
  }

  checkPoint(e) {
    divesite_id = null;
    this.diveService.getCheckedPointHearts(e.latlng).then(data => {
      console.log(data);
    });
    this.diveForm.controls['latlng'].setValue(e.latlng);
  }

  reset() {
    this.hasSubmit = false;
    this.diveForm.reset();
    this.removeTimes();
    if (!this.dive)
      this.addTime('00:00', '00:00');
    while (this.divetypes.length)
      this.divetypes.removeAt(0);
    this.initDiveTypeForm();
  }

  save() {
    this.dive = null;
    if (this.diveForm.invalid) {
      this.snackBar.open('Merci de remplir les champs correctement', 'OK', {
        duration: 3000
      });
      return;
    }
    if (!divesite_id) {
      this.snackBar.open('Merci de sélectionner un site de plongée', 'OK', {
        duration: 3000
      });
      return;
    }
    this.hasSubmit = true;
    const data = this.diveForm.getRawValue();
    if (data.divingDate)
      data.divingDate = new Date(data.divingDate);
    data.boats = _.map(data.boats, boat => {
      return {
        boat: boat.name
      };
    });

    data.divetypes = data.divetypes.filter(
      diveType => diveType.selected === true);

    data.divesite_id = divesite_id;
    let loading = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    console.log(data);
    this.diveService.save(data).then(response => {
      loading.close();
      this.diveService.added$.next(data);
      let dialogRef = this.dialog.open(DiveSuccessDialog, {
        panelClass: 'dive-success',
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(value => {
        if (value) {
          this.reset();
          window.scrollTo(0, 0);
        } else {
          this.userService.logout();
          this.router.navigate(['/login']);
        }
      });
    }, error => {
      //this.router.navigate(['/dives']);
      console.log(error);
      loading.close();
    });


  }

  //Getters
  get isWithStructure() {
    return this.diveForm.get('isWithStructure');
  }

  get sky() {
    return this.diveForm.get('sky');
  }

  get seaState() {
    return this.diveForm.get('seaState');
  }


}

@Component({
  selector: 'dive-success-dialog',
  template: `
    <h4>Félicitation !</h4>
    <mat-dialog-content>
      Votre plongée est bien déclarée.<br/>
      Que voulez-vous faire maintenant ?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button mat-dialog-close color="primary" (click)="newDive()">
        Déclarer une nouvelle plongée
      </button>
      <button mat-raised-button mat-dialog-close color="warn" (click)="logout()">
        J'ai fini, je me déconnecte
      </button>
    </mat-dialog-actions>`
})
export class DiveSuccessDialog {

  constructor(public dialogRef: MatDialogRef<DiveSuccessDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  newDive() {
    this.dialogRef.close(true);
  }

  logout() {
    this.dialogRef.close(false);
  }
}
