import { Component, OnInit, OnDestroy, Input, Inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { UserService } from '../services/user.service';
import { config } from '../settings';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private permitBlob: Blob
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
      }, error => {
      console.error(error);
        if (error && error.status === 401) {
          this.snackBar.open("Vous devez vous connecter", "OK", {
            duration: 3000
          });
          this.router.navigate(['/login']);
        }
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next()
  }

  getPermit(id: number) {
    if (this.user.id !== id /* && !this.user.isAdmin() */) {
      return null
    }

    const isFirefoxWithPdfJs = () => {
      // If firefox is >= 19, we assume pdf.js is installed (no way to check it)
      let hits = navigator.userAgent.match(/Firefox\/([0-9]+).[0-9]+/)
      return (hits && hits.length >= 2 && parseInt(hits[1]) >= 19)
    }

    const isMobile = () => (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

    this.userService.getPermit(id)
      .takeUntil(this.onDestroy$)
      .subscribe(
        (response: HttpResponse<Blob>) => {
          // console.debug(response.headers)
          this.permitBlob = new Blob([response.body], {type: 'application/pdf'})

          if ('application/pdf' in navigator.mimeTypes || isFirefoxWithPdfJs && !isMobile) {
            this.openPermitDialog(this.createBlobUrl())
          } else {
            this.saveBlobUrl()
          }
        },
        error => console.error('Permit download failed: ', error))  // 401 -> /login
  }

  createBlobUrl(): SafeResourceUrl|null {
    if (this.permitBlob) {
      console.debug('Gotta permit blob.')
      let blobUrl = window.URL.createObjectURL(this.permitBlob)
      return this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl)
    } else {
      console.debug('No permit blob.')
      return '/dev/null'
    }
  }

  saveBlobUrl(blobUrl?: SafeResourceUrl) {
    const a = window.document.getElementById('download')
    console.debug('blobUrl: ', a.getAttribute('href'))
    if (blobUrl) {
      a.setAttribute('href', blobUrl.toString())
    }
    a.setAttribute('download', `permit_capel_${this.user.firstname}_${this.user.id}.pdf`)
    let aclick = new MouseEvent("click", {
      "view": window,
      "bubbles": true,
      "cancelable": false
    })
    a.dispatchEvent(aclick)
    // window.URL.revokeObjectURL(url)
  }

  openPermitDialog(blobUrl: SafeResourceUrl) {
    const dialogRef = this.dialog.open(PermitViewDialog, {
      width: '100vw',
      disableClose: true,
      data: {
          blobUrl: blobUrl
        }
    })

    dialogRef.afterClosed()
      .takeUntil(this.onDestroy$)
      .subscribe(data => {
        this.saveBlobUrl()
      }
    )
  }
}

@Component({
  selector: 'permit-view-dialog',
  template: `
<h1 mat-dialog-title>Site</h1>
<div mat-dialog-content>
  <object [data]="data.blobUrl" class="dialog-full-width"></object>
</div>
<div mat-dialog-actions align="end">
  <button mat-button [mat-dialog-close]="data" cdkFocusInitial>TELECHARGER LE PDF</button>
</div>`,
  styles: [`
  .dialog-full-width {
    width: 100%;
    min-height: 400px;
  }
`]
})
export class PermitViewDialog {

  constructor(
    public dialogRef: MatDialogRef<PermitViewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}
}
