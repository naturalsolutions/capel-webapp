import { Component, OnInit, OnDestroy, Input, Inject, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  MatSnackBar,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatProgressSpinnerModule
} from '@angular/material'
import { Subject } from 'rxjs';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import * as L from 'leaflet';

import { config } from '../settings';
import { UserService } from '../services/user.service';
import { LoaderDialogComponent } from '../register/register.component';
import { NgRedux } from '@angular-redux/store';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {

  leafletOptions = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 12,
    center: L.latLng(43, 6.3833),
    dragging: true,
    scrollWheelZoom: false
  };

  constructor(
    public dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    console.debug('ProfileComponent ngOnInit.');
  }

  onMapReady(map: L.Map) {
    L.marker([50.6311634, 3.0599573]).addTo(map);
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
    <mat-dialog-actions>
      <div class="col">
        <mat-checkbox class="d-block" (change)="onCheckBoxChange($event, 'a')">Check me!</mat-checkbox>
        <mat-checkbox class="d-block" (change)="onCheckBoxChange($event, 'b')">Check me!</mat-checkbox>
        <mat-checkbox class="d-block" (change)="onCheckBoxChange($event, 'c')">Check me!</mat-checkbox>
      </div>
      <div>
        <a mat-raised-button mat-dialog-close color="primary" [disabled]="!hasCheckAll" href="{{ config.serverURL }}/api/users/{{ user.id }}/permit.pdf">
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
