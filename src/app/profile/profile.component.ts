import { Component, OnInit, OnDestroy, Input, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
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

  permitBlobUrl: SafeResourceUrl;
  private onDestroy$ = new Subject();
  private fg: FormGroup;
  private user: any = {};
  private config;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService
  ) {
    this.config = config;
  }

  ngOnInit() {
    console.log('ProfileComponent ngOnInit');
    this.userService.getProfile().then(user => {
        console.log(user);
        this.user = user;
        this.fg = this.fb.group({
          password: [''],
          passwordConfirm: ['']
        });
      }, error => {
        console.log(error);
      });
    }

  ngOnDestroy() {
    this.onDestroy$.next()
  }

  getPermit(id: number) {
    if (this.user.id !== id /* && !this.user.isAdmin() */) {
      return null
    }
    this.userService.getPermit(id)
      .takeUntil(this.onDestroy$)
      .subscribe(
        data => {
          const blob = new Blob([data.body], {type: 'application/pdf'})
          let blobUrl = window.URL.createObjectURL(blob)
          this.permitBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl)
          blobUrl = window.URL.createObjectURL(blob)
          this.openDialog(blobUrl)
        },
        error => console.error('Permit download failed: ' + error))
  }

  openDialog(blobUrl: string) {
    let dialogRef = this.dialog.open(PermitViewDialog, {
      width: "100vw", height: "80vh",
      data: {permitBlobUrl: this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl)}
    })

    dialogRef.afterClosed()
      .takeUntil(this.onDestroy$)
      .subscribe(data => {
        const a = window.document.getElementById('downloadPermit')
        a.setAttribute('download', 'permit.pdf')
        let click = new MouseEvent("click", {
            "view": window,
            "bubbles": true,
            "cancelable": false
        });
        a.dispatchEvent(click)
      }
    )
  }
}

@Component({
  selector: 'permit-view-dialog',
  template: `
<h1 mat-dialog-title>Site</h1>
<div mat-dialog-content>
  <iframe [src]="data.permitBlobUrl" class="dialog-full-width"></iframe>
</div>
<div mat-dialog-actions align="end">
  <button mat-button [mat-dialog-close]="data" cdkFocusInitial>TELECHARGER LE PDF</button>
</div>`,
  styles: [`
  .dialog-full-width {
    width: 100%;
    height: 50vh;  /* FIXME: dialog/dialog-content heights */
  }
`]
})
export class PermitViewDialog {

  constructor(
    public dialogRef: MatDialogRef<PermitViewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
