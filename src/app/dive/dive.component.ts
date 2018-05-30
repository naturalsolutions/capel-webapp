import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _ from 'lodash';
import * as L from 'leaflet';

import { UserService } from '../services/user.service';
import { BoatService } from '../services/boat.service';
import { DiveService } from '../services/dive.service';
import { LoadingDialogComponent } from '../app-dialogs/loading-dialog/loading-dialog.component';
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
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
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
    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  profile:any;
  constructor(private adapter: DateAdapter<any>,
              private boatService: BoatService,
              private diveService: DiveService,
              private userService: UserService,
              private snackBar: MatSnackBar,
              private router: Router,
              public dialog: MatDialog,
              private ngRedux: NgRedux<any>
              ) {

    const appState = this.ngRedux.getState();
    this.profile = appState.session.profile;
    this.adapter.setLocale('fr');
    this.boatService.getBoats().then(data => {
      this.boats = data;
    }, error => {
      if (_.get(error, 'statusText') === 'UNAUTHORIZED') {
        this.snackBar.open("le Token est expiré", "OK", {
          duration: 1000
        });
        this.router.navigate(['/login']);
      }
    });
    this.userService.getUsers().then(users => {
      this.users = _.filter(users, {category: 'structure'});
    });

    /* this.boatCtrl = new FormControl();
    this.boatCtrl.valueChanges.subscribe(value => {
      console.log(value);
    }); */
   /*  this.filteredBoats = this.boatCtrl.valueChanges
      .pipe(
        startWith(''),
        map(boat => boat ? this.filterBoats(boat) : this.boats.slice())
      ); */
  }
  filterBoats(name: string) {
    return this.boats.filter(state =>
      state.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
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
      isWithStructure:  new FormControl('', Validators.required),
      latlng: new FormControl('')
    });

    this.addTime();

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
      for (const diveSite of this.diveSites ) {

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
          let  geojsonFeature = {
            'type': 'Feature',
            'properties': {
              'name': 'Coors Field',
              'amenity': 'Baseball Stadium',
              'popupContent': 'This is where the Rockies play!'
            },
            'geometry': heart.geom_poly
          };
          new L.geoJSON(geojsonFeature, {
            style: function(feature) {
              return feature.properties.style;
            }
          }).addTo(this.map);

        }
    });

  }
  onClick(event) {
    divesite_id = event.target.options.divesite_id;
    this.diveForm.controls['latlng'].setValue('Vous êtes plongée á : '+event.target.options.divesite_name);

  }
  markerClusterReady(group: L.MarkerClusterGroup) {

    this.markerClusterGroup = group;

  }

  initDiveTypeForm() {
    this.divetypes = this.diveForm.get('divetypes') as FormArray;
    for (const divetype of this.initDiveType){
      this.divetypes.push(new FormGroup({
        id: new FormControl(divetype.id),
        selected: new FormControl(false),
        name: new FormControl(divetype.name),
        nameMat: new FormControl(divetype.name),
        nbrDivers: new FormControl(1),
      }));
    }
  }
  addTime() {
    this.times = this.diveForm.get('times') as FormArray;
    this.times.push(new FormGroup({
      startTime: new FormControl('00:00'),
      endTime: new FormControl('00:00'),
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
    map.on('click', this.checkPoint.bind(this))
    this.map = map;
  }

  checkPoint(e) {
    divesite_id = null;
    this.diveService.getCheckedPointHearts(e.latlng).then(data => {
      console.log(data);
    })
    this.diveForm.controls['latlng'].setValue(e.latlng);
  }

  reset() {
    this.hasSubmit = false;
    this.diveForm.reset();
    this.removeTimes();
    this.addTime();
    while (this.divetypes.length)
      this.divetypes.removeAt(0);
    this.initDiveTypeForm();
  }

  save() {

    if (this.diveForm.invalid) {
      this.snackBar.open("Merci de remplir les champs correctement", "OK", {
        duration: 3000
      });
      return;
    }
    if (!divesite_id) {
      this.snackBar.open("Merci de sélectionner un site de plongée", "OK", {
        duration: 3000
      });
      return;
    }
    this.hasSubmit = true;
    const data = this.diveForm.getRawValue();
    if (data.divingDate)
      data.divingDate = data.divingDate.format();
    data.boats = _.map(data.boats, boat => {
      return {
        boat: boat.name
      };
    });
    data.divesite_id = divesite_id;
    //data.structure = _.get(data.structure, 'id');
    let loading = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
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
  get isWithStructure(){ return this.diveForm.get('isWithStructure'); }
  get sky() { return this.diveForm.get('sky'); }
  get seaState() { return this.diveForm.get('seaState'); }


}

@Component({
  selector: 'dive-success-dialog',
  template: `
    <h4>Félicitation !</h4>
    <mat-dialog-content>
      Votre plongée est bien déclarée.<br />
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
