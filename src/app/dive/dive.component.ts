import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import * as _ from 'lodash';
import * as L from 'leaflet';

import { UserService } from '../services/user.service';
import { BoatService } from '../services/boat.service';
import { DiveService } from '../services/dive.service';
import { LoadingDialogComponent } from '../app-dialogs/loading-dialog/loading-dialog.component';

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

  constructor(private adapter: DateAdapter<any>,
              private boatService: BoatService,
              private diveService: DiveService,
              private userService: UserService,
              private snackBar: MatSnackBar,
              private router: Router,
              public dialog: MatDialog
              ) {
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
      wind: new FormControl('', Validators.required),
      water_temperature: new FormControl('', Validators.required),
      wind_temperature: new FormControl('', Validators.required),
      visibility: new FormControl('', Validators.required),
      sky: new FormControl('', Validators.required),
      seaState: new FormControl('', Validators.required),
      structure: new FormControl(),
      isWithStructure:  new FormControl('', Validators.required),
      latlng: new FormControl('', Validators.required)
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
        console.log(value);
      });

    this.diveService.getDiveSites().then(data => {
      this.diveSites = data;
      for (const diveSite of this.diveSites ) {
        let marker = L.marker([diveSite.longitude, diveSite.latitude], {
          title: 'unselected',
          radius: 20,
          divesite_id: diveSite.id
        }).addTo(this.map);
        marker.bindPopup(diveSite.name).openPopup();
        marker.on("click", function (event) {
          divesite_id = event.target.options.divesite_id;
        });
      }
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
          console.log(geojsonFeature);
          new L.geoJSON(geojsonFeature, {
            style: function(feature) {
              return feature.properties.style;
            }
          }).addTo(this.map);

        }
    });



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
    map.on('click', (e) => {
      console.log(e.latlng);
      this.diveForm.controls['latlng'].setValue(e.latlng);
    });
    this.map = map;


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
    console.log(divesite_id);
    //data.structure = _.get(data.structure, 'id');
    console.log(data);
    let loading = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    this.diveService.save(data).then(response => {
      loading.close();
      console.log(data);
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
