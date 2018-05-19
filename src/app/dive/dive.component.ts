import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
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
  boatsChsd: any[] = [];
  boats: any[] = [];
  diveTypes: any[] = [];
  boatCtrl: FormControl;
  filteredBoats: Observable<any[]>;
  users: any[] = [];
  map: L.Map;
  leafletOptions = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 12,
    center: L.latLng(43, 6.3833),
    dragging: true,
    scrollWheelZoom: false
  };

  constructor(private adapter: DateAdapter<any>,
              private boatService: BoatService,
              private diveService: DiveService,
              private userService: UserService,
              private snackBar: MatSnackBar,
              private router: Router
              ) {
    this.adapter.setLocale('fr');
    this.diveService.getDiveTypes().then(data => {
      this.diveTypes = data;
    });
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
      this.users = users;
    })
    this.boatCtrl = new FormControl();
    this.boatCtrl.valueChanges.subscribe(value => {
      console.log(value);
    });
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
      referenced: new FormControl('referenced'),
      times: new FormArray([]),
      divetypes: new FormArray([]),
      boats: new FormArray([]),
      wind: new FormControl('', Validators.required),
      water_temperature: new FormControl('', Validators.required),
      wind_temperature: new FormControl('', Validators.required),
      visibility: new FormControl('', Validators.required),
      sky: new FormControl('', Validators.required),
      seaState: new FormControl('', Validators.required),
      structure: new FormControl(),
      isWithStructure:  new FormControl('', Validators.required),
      latlng: new FormControl('', Validators.required),
    });
    this.addTime();
    this.initDiveTypeForm();
    this.diveForm.get('isWithStructure').valueChanges
      .subscribe(value => {
        this.diveForm.get('structure').setValidators(value ? Validators.required : null);
        this.diveForm.get('structure').reset();
      });
    this.diveForm.get('times').valueChanges
      .subscribe(value => {
        console.log(value);
      });
  }
  initDiveTypeForm() {
    this.divetypes = this.diveForm.get('divetypes') as FormArray;
    for (const divetype of this.diveTypes){
      this.divetypes.push(new FormGroup({
        id: new FormControl(divetype.id),
        name: new FormControl(false, Validators.required),
        nameMat: new FormControl(divetype.name),
        nbrDivers: new FormControl('1'),
      }));
    }
  }
  addTime() {
    this.times = this.diveForm.get('times') as FormArray;
    this.times.push(new FormGroup({
      startTime: new FormControl(''),
      endTime: new FormControl(''),
    }));
  }
  addBoat () {
    this.boatsChsd.push({'boat': this.boatCtrl.value});
  }
  deleteBoat(i) {
    this.boatsChsd.splice(i, 1);
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

  }
  save() {
    this.hasSubmit = true;
    console.log(this.diveForm.get('structure').valid);
    const data = this.diveForm.getRawValue();
    data.boats = this.boatsChsd;

    /* this.diveService.save(data).then(data => {
      this.router.navigate(['/dives']);
    }, error => {
      console.log(error);
    }) */
  }
  //Getters
  get isWithStructure(){ return this.diveForm.get('isWithStructure'); }
  get sky() { return this.diveForm.get('sky'); }
  get seaState() { return this.diveForm.get('seaState'); }


}
