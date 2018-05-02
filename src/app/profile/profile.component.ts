import { Component, OnInit, OnDestroy, Input, Inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
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

import { config } from '../settings';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private permit = {
    blob: <Blob>null,
    name:  ''
  }
  private onDestroy$ = new Subject()
  private fg: FormGroup;
  private user: any = {};
  private config;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private userService: UserService,
  ) {
    this.config = config;
  }

  ngOnInit() {
    if (!this.userService.isConnected()) {
      this.router.navigate(['/login']);
    }
    console.debug('ProfileComponent ngOnInit');
    this.userService.getProfile().then(user => {
        this.user = user;
        this.fg = this.fb.group({
          password: [''],
          passwordConfirm: ['']
        });

        this.permit.name = `permit_capel_${this.user.firstname}_${this.user.id}.pdf`

      }, error => {
      console.error(error);
        if (error && error.status === 401) {
          this.snackBar.open("Vous devez vous connecter", "OK", {duration: 3000});
          this.router.navigate(['/login']);
        }
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  getPermit(id: number) {
    if (!this.user || this.user.id !== id /* && !this.user.isAdmin()) */) {
      return null;
    }

    const isFirefoxWithPdfJs = () => {
      // If firefox is >= 19, we assume pdf.js is installed (no way to check it)
      let hits = navigator.userAgent.match(/Firefox\/([0-9]+).[0-9]+/)
      return (hits && hits.length >= 2 && parseInt(hits[1]) >= 19)
    }
    const isMobile = () => (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

    let permitSubscription = this.userService.getPermit(id)
        .takeUntil(this.onDestroy$)
        .subscribe(
      (response: HttpResponse<Blob>) => {
        console.debug('permit response: ', response)
        this.permit.blob = new Blob([response.body], {type: 'application/pdf'})
      },
      error => {
        console.error('Permit download failed: ', error)
        this.snackBar.open("Le téléchargement de l'autorisation a échoué.", "OK", {duration: 1000})
      },
      () => {
        if ('application/pdf' in navigator.mimeTypes || isFirefoxWithPdfJs && !isMobile)  {
          let blob = window.URL.createObjectURL(this.permit.blob)
          let blobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blob)
          this.openPermitDialog(blobUrl)
        } else {
          this.saveBlob(this.permit.blob, this.permit.name)
        }
      }
    )
  }

  saveBlob(blob, name) {
    let link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute('visibility','hidden')
    link.download = name
    link.onload = function() { window.URL.revokeObjectURL(link.href) }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  openPermitDialog(blobUrl) {
    const dialogRef = this.dialog.open(PermitViewDialog, {
      width: '100vw',
      disableClose: true,
      data: {
          blobUrl: blobUrl,
          type: 'application/pdf'
        }
    })
    dialogRef.afterClosed()
      .take(1)
      .subscribe(data => {
        window.URL.revokeObjectURL(data.blobUrl)
        this.saveBlob(this.permit.blob, this.permit.name);
      }
    )
  }
}

@Component({
  selector: 'permit-view-dialog',
  template: `
<h1 mat-dialog-title>Site</h1>
<form id="agreement">
  <div class="spinner-wrapper" *ngIf="loading"><mat-spinner></mat-spinner></div>
<div mat-dialog-content>
    <object
      [data]="data.blobUrl"
      [type]="data.type"
      form="agreement"
      typemustmatch=true
      class="dialog-full-width"
      (load)="onLoad($event)">
    </object>
  </div>
  <div mat-dialog-actions align="end">
    <button mat-button [mat-dialog-close]="data" cdkFocusInitial>TELECHARGER LE PDF</button>
  </div>
</form>`,
  styles: [`
  .dialog-full-width {
    width: 100%;
    min-height: 400px;
  }

  .spinner-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
  }
`]
})
export class PermitViewDialog {

  loading = true

  constructor(public dialogRef: MatDialogRef<PermitViewDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  onLoad(event: Event) {
    this.loading = false;
  }
}
