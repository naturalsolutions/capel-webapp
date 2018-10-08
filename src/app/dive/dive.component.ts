import {Component, OnInit, ViewEncapsulation, Inject, NgZone} from '@angular/core';
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
import { colors } from '../app-assets/colors';
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
  boatsWS: any[] = [];
  initDiveType: any[] = [];
  users: any[] = [];
  diveSites: any[] = [];
  divehearts: any[] = [];
  map: L.Map;
  mode = true;
  leafletOptions = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
    ],
    zoom: 9,
    center: L.latLng(42.976520698105546, 6.284179687500001),
    dragging: true,
    scrollWheelZoom: false
  };


  markerClusterData: any[] = [];
  markerClusterOptions: L.MarkerClusterGroupOptions;
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
  profile: any;

  //Dive edit
  id: number;
  private sub: any;
  dive: any;
  //legend = L.control({position: 'bottomright'});
  constructor(private adapter: DateAdapter<any>,
              private boatService: BoatService,
              private diveService: DiveService,
              private userService: UserService,
              private snackBar: MatSnackBar,
              private router: Router,
              public dialog: MatDialog,
              private ngRedux: NgRedux<any>,
              private route: ActivatedRoute,
              private zone: NgZone) {

    const appState = this.ngRedux.getState();
    this.profile = appState.session.profile;
    this.adapter.setLocale('fr');
    this.boatService.getBoats().then(data => {
      this.boatsWS = data;
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
      this.users = this.users.sort((n1, n2) => {
        if (n1.lastname > n2.lastname) {
          return 1;
        }

        if (n1.lastname < n2.lastname) {
          return -1;
        }

        return 0;
      });
    });

  }

  ngOnInit() {
    this.diveForm = new FormGroup({
      divingDate: new FormControl('', Validators.required),
      referenced: new FormControl('notreferenced'),
      times: new FormArray([]),
      divetypes: new FormArray([]),
      boats: new FormControl([]),
      wind: new FormControl(null),
      water_temperature: new FormControl(null),
      wind_temperature: new FormControl(null),
      visibility: new FormControl(null),
      sky: new FormControl(null),
      seaState: new FormControl(null),
      structure: new FormControl(),
      comment: new FormControl(''),
      isWithStructure: new FormControl(''),
      latlng: new FormControl('')
    });
    // Get current dive id from parms and set form
    this.sub = this.route.params.subscribe(params => {
      this.id = + params['id']; // (+) converts string 'id' to a number
      if ( this.id ) {
        let loading = this.dialog.open(LoadingDialogComponent, {
          disableClose: true
        });
        this.diveService.get(this.id).then(dive => {
          this.dive = dive;
          this.setDiveFrom();
          loading.close();
        }, error => {
          console.log(error);
        });
      }else{
        this.dive = null;
        this.reset();
      }
    });
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
      let icon = this.icon;
      const listMarker: any[] = [];
      for (const diveSite of this.diveSites) {
        if (diveSite.privacy === 'public' || diveSite.privacy === null || (diveSite.privacy === 'private' && diveSite.user_id == this.profile.id)) {
          icon = this.icon;
          if (diveSite.privacy === 'public') icon = this.iconUserPublic;
          if (diveSite.privacy === 'private') icon = this.iconUserPrivate;
          const marker = L.marker([diveSite.latitude, diveSite.longitude], {
            title: diveSite.name,
            icon: icon,
            radius: 20,
            divesite_id: diveSite.id,
            divesite_name: diveSite.name,
            latlng: {'lat': diveSite.latitude, 'lng': diveSite.longitude}
          });
          marker.bindPopup(diveSite.name).openPopup();
          marker.on('click', this.onClick.bind(this));
          listMarker.push(marker);
        }
      }
      this.markerClusterData = listMarker;
    });

    this.diveService.getDiveHearts().then(data => {
      this.divehearts = data;
      for (const {heart, index} of data.map((heart, index) => ({ heart, index }))) {
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
          style: {
            "color": colors[heart.name],
            "weight": 5,
            "opacity": 0.65
          }
        }).addTo(this.map);

      }
    });

  }

  setDiveFrom() {
    this.reset();
    this.addTime(this.dive.times[0][0].substring(0, 5), this.dive.times[0][1].substring(0, 5));
    this.diveForm.controls['divingDate'].setValue(new Date(this.dive.divingDate));
    divesite_id = this.dive.dive_site.id;
    this.diveForm.controls['isWithStructure'].setValue(this.dive.shop? true : false);
    this.diveForm.controls['boats'].setValue(this.dive.boats);
    this.diveForm.controls['comment'].setValue(this.dive.comment);
    this.diveForm.controls['latlng'].setValue('Vous avez plongé à : ' + this.dive.dive_site.name);
    this.diveForm.controls['wind'].setValue(this.dive.weather.wind);
    this.diveForm.controls['water_temperature'].setValue(this.dive.weather.water_temperature ? this.dive.weather.water_temperature : null);
    this.diveForm.controls['wind_temperature'].setValue(this.dive.weather.wind_temperature ? this.dive.weather.wind_temperature : null);
    this.diveForm.controls['visibility'].setValue( this.dive.weather.visibility ? '' + this.dive.weather.visibility : null);
    this.diveForm.controls['sky'].setValue(this.dive.weather.sky ? this.dive.weather.sky : null);
    this.diveForm.controls['seaState'].setValue(this.dive.weather.seaState ? this.dive.weather.seaState : null);
    this.diveForm.controls['structure'].setValue(this.dive.shop);
    console.log(this.dive.shop);
    this.map.setView({'lat': this.dive.dive_site.latitude, 'lng':this.dive.dive_site.longitude}, 17);
  }

  compareBoat(boatN, boatO) {
    return boatN.name === boatO.name;
  }
  compareUser(userN, userO) {
    return userN.id === userO.id;
  }
  onClick(event) {
    divesite_id = event.target.options.divesite_id;
    this.checkPoint(event.target.options);
    this.diveForm.controls['latlng'].setValue('Vous avez plongé à : ' + event.target.options.divesite_name);
  }

  initDiveTypeForm() {
    this.divetypes = this.diveForm.get('divetypes') as FormArray;
    for (const divetype of this.initDiveType) {
      let exists: any = false;
      let nbrDivers = 1;
      if (this.dive) {
        for ( const divetypedive of this.dive.divetypedives ) {
          if ( divetypedive.typeDive.id === divetype.id ) {
            exists = true;
            nbrDivers = divetypedive.divers;
          }
        }
      }
      //exists = this.dive.divetypedives.filter(
      //  divetypedive => divetypedive.typeDive.id == divetype.id);
      this.divetypes.push(new FormGroup({
        id: new FormControl(divetype.id),
        selected: new FormControl(exists != false ? true : false),
        name: new FormControl(divetype.name),
        nameMat: new FormControl(divetype.name),
        nbrDivers: new FormControl({value:nbrDivers, disabled: (this.profile.category=='particulier'?true:false)}),
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
      for (var key in colors)
       div.innerHTML +=  '<i class="legend-icon" style="background-color: '+colors[key]+';"></i>' + key + '<br><br>';
      return div;
    };
    legend.addTo(map);

  }
  changed(evt){
    console.log(this.mode)
    this.mode = this.mode === true ? false :  true;
    console.log(this.mode)
  }
  checkPoint(e) {
    if(this.mode) {// mode add dive site enabled
      if (!e.title)
        divesite_id = null;
      else
        this.map.setView(e.latlng, 17);
      this.diveService.getCheckedPointHearts(e.latlng).then(hearts => {
        if (hearts.length) {
          this.zone.run(() => {
            let dialogRef = this.dialog.open(DiveHeartDialog, {
              width: '600px',
              data: {
                site: e.latlng,
                title: e.title,
                heart_name: hearts[0].name
              }
            });
            dialogRef.afterClosed().subscribe(value => {
              if (value)
                this.createSite(e);
            });
          });
        }
        if (!hearts.length && !e.title) {
          this.createSite(e);
        }
      });
      this.diveForm.controls['latlng'].setValue(e.latlng);
    }
  }
  createSite(e){
    this.zone.run(() => {
      let dialogRefSite = this.dialog.open(DiveAddNewSiteDialog, {
        width: '500px',
        data: {
          site: e.latlng
        }
      });
      dialogRefSite.afterClosed().subscribe(value => {
        let site = this.diveService.getCurrentSite();
        console.log(site);
        let icon = this.icon;
        if (site.privacy === 'public') icon = this.iconUserPublic;
        if (site.privacy === 'private') icon = this.iconUserPrivate;
        const marker = L.marker([site.latitude, site.longitude], {
          title: site.name,
          icon: icon,
          radius: 20,
          divesite_id: site.id,
          divesite_name: site.name,
          latlng: {'lat': site.latitude, 'lng': site.longitude}
        });
        marker.bindPopup(site.name).openPopup();
        marker.addTo(this.map);
        this.diveForm.controls['latlng'].setValue('Vous avez plongé à : ' + site.name);
        divesite_id = site.id;
        this.snackBar.open('Votre site ' + site.name + ' est bien été créé.', 'OK', {
          duration: 3000
        });
      });
    });
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
    if (this.profile.offenses.length > 0)
    if (new Date().getTime() >= new Date(this.profile.offenses[0].start_at).getTime()
          &&
        new Date().getTime() <= new Date(this.profile.offenses[0].end_at).getTime())
    {
      this.snackBar.open('Vous ne pouvez pas déclarer une plongée', 'OK', {
        duration: 3000
      });
      return;
    }

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
    this.diveService.save(data).then(response => {
      loading.close();
      this.diveService.added$.next(data);
      let dialogRef = this.dialog.open(DiveSuccessDialog, {
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(value => {
        if (value) {
          this.reset();
          window.scrollTo(0, 0);
        } else {
          this.router.navigate(['/profile']);
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
    <h4>Félicitations !</h4>
    <mat-dialog-content>
      Votre plongée est bien déclarée, Que voulez-vous faire maintenant ?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close color="primary" (click)="newDive()">
        Déclarer une nouvelle plongée
      </button>
      <button mat-raised-button mat-dialog-close color="primary" (click)="logout()">
        Continuer la navigation
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
@Component({
  selector: 'dive-heart-dialog',
  template: `
    <h4>Attention !</h4>
    <mat-dialog-content *ngIf="data.title">
      Site {{data.title}}, vous pouvez signer la Charte de plongée
    </mat-dialog-content>
    <mat-dialog-content *ngIf="data.heart_name && !data.title">
      Cœurs marins du Parc national de {{data.heart_name}}, plongée soumise à la signature d'un règlement
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <a href="http://149.202.44.29/site/reglementation.html" target="_blank" mat-raised-button mat-dialog-close color="primary">
        Voir les dispositions
      </a>
      <button *ngIf="!data.title" mat-raised-button mat-dialog-close color="primary" (click)="newDive()">
        Créer un site
      </button>
      <button mat-raised-button mat-dialog-close color="primary" (click)="close()">
        Ok
      </button>
    </mat-dialog-actions>`
})
export class DiveHeartDialog {

  constructor(public dialogRef: MatDialogRef<DiveHeartDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  newDive() {
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }
}


@Component({
  selector: 'dive-not-allowed-dialog',
  template: `
    <h4>Attention !</h4>
    <mat-dialog-content>
      Vous n'avez d'autorisation pour plonger sur ce site.<br/>
      <ul>
        <li *ngFor="let heart of data.hearts">
          {{ heart.name }}
        </li>
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button mat-dialog-close color="primary" (click)="ok()">
        Annuler
      </button>
      <button mat-raised-button mat-dialog-close color="primary" (click)="cancel()">
        Demander d'autorisation
      </button>
    </mat-dialog-actions>`
})
export class DiveNotAllowedDialog {
  constructor(public dialogRef: MatDialogRef<DiveNotAllowedDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
  }

  ok() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}


@Component({
  selector: 'dive-add-newsite-dialog',
  template: `
    <h4>Ajouter un site de plongée !</h4>
    <mat-dialog-content>
      <form  class="register-form inscription" [formGroup]="siteForm">
        <div class="row">
          <div class="col-sm-12">
            <mat-form-field class="mat-form-field-lg full-width" >
              <mat-select placeholder="visibilité du site" formControlName="privacy" required>
                <mat-option  value="private">
                  Privé
                </mat-option>
                <mat-option  value="public">
                  Public
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="col-sm-12">
            <mat-form-field class="full-width">
              <input class="text-left" matInput placeholder="Nom de site" formControlName="name" required>
            </mat-form-field>
          </div>
          <div class="col-sm-12">
            <mat-form-field class="full-width">
              <input class="text-left" matInput placeholder="latitude" disabled type="latitude" formControlName="latitude">
            </mat-form-field>
          </div>
          <div class="col-sm-12">
          <mat-form-field class="full-width">
            <input class="text-left" matInput placeholder="longitude" disabled type="longitude" formControlName="longitude">
          </mat-form-field>
          </div>
        </div>  
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button mat-dialog-close color="primary" (click)="cancel()">
        Annuler
      </button>
      <button mat-raised-button mat-dialog-close [disabled]="!siteForm.valid" color="primary" (click)="envoyer()">
        Envoyer
      </button>
    </mat-dialog-actions>`,
  styles: ['.full-width{ width: 100% }']
})
export class DiveAddNewSiteDialog {
  siteForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<DiveAddNewSiteDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any, public diveService: DiveService) {
    this.siteForm = new FormGroup({
      name: new FormControl('', Validators.required),
      privacy: new FormControl('', Validators.required),
      latitude: new FormControl(data.site.lat),
      longitude: new FormControl(data.site.lng),
      category: new FormControl('site')
    });
  }

  envoyer() {
    const data = this.siteForm.getRawValue();
    this.diveService.saveSite(data).then(site => {
      this.diveService.setCurrentSite(site);
    }, error => {
      console.log(error);
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
