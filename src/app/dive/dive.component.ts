import { Component, OnInit } from '@angular/core';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {BoatService} from '../services/boat.service';
import {DiveService} from '../services/dive.service';
import * as L from 'leaflet';
import * as _ from 'lodash';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import { MatChipsModule, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-dive',
  templateUrl: './dive.component.html',
  styleUrls: ['./dive.component.scss'],
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
export class DiveComponent implements OnInit{


  diveForm: FormGroup;
  times: FormArray = new FormArray([]);
  divetypes: FormArray = new FormArray([]);
  boatsChsd: any[] = [];
  boats: any[] = [];
  diveTypes: any[] = [];
  boatCtrl: FormControl;
  filteredBoats: Observable<any[]>;
  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 5,
    center: L.latLng(43.3, 5.4)
  };

  constructor(private adapter: DateAdapter<any>,
              private boatService: BoatService,
              private diveService: DiveService,
              private snackBar: MatSnackBar,
              private router: Router,
              private http: HttpClient
              ) {
    this.adapter.setLocale('fr');
    this.diveService.getDiveTypes().then(data => {
      this.diveTypes = data;
      this.initDiveTypeForm();
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
    this.boatCtrl = new FormControl();
    this.filteredBoats = this.boatCtrl.valueChanges
      .pipe(
        startWith(''),
        map(boat => boat ? this.filterBoats(boat) : this.boats.slice())
      );
  }
  filterBoats(name: string) {
    return this.boats.filter(state =>
      state.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  ngOnInit() {
    this.diveForm = new FormGroup({
      divingDate: new FormControl('', Validators.required),
      referenced: new FormControl(true, Validators.required),
      times: new FormArray([]),
      divetypes: new FormArray([]),
      boat: new FormArray([]),
      wind: new FormControl('', Validators.required),
      water_temperature: new FormControl('', Validators.required),
      wind_temperature: new FormControl('', Validators.required),
      visibility: new FormControl('', Validators.required),
      structure: new FormControl('', Validators.required),
    });
    this.addTime();

  }
  initDiveTypeForm() {
    this.divetypes = this.diveForm.get('divetypes') as FormArray;
    for (const divetype of this.diveTypes){
      this.divetypes.push(new FormGroup({
        name: new FormControl(false, Validators.required),
        nbrDivers: new FormControl(''),
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
    this.boatsChsd.push({'boat_id': this.boatCtrl.value, 'isStructure': this.diveForm.get('structure').value});
  }
  deleteBoat(i) {
    this.boatsChsd.splice(i, 1);
  }
  removeTime(i) {
    this.times.removeAt(i);
  }
  onMapReady(map: Map) {
    L.marker([50.6311634, 3.0599573]).addTo(map);
  }

}
