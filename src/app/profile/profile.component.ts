import { Component, OnInit, Input, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { UserService } from '../services/user.service';
import { config } from '../settings';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

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

  getPermit(id: number) {
    if (this.user.id !== id /* || !this.user.isAdmin() */) {
      return null
    }
    const permit$ = this.userService.getPermit(id)
    permit$.subscribe(
      data => {
        const file = new Blob([data.body], {type: 'application/pdf'})
        const fileURL = window.URL.createObjectURL(file)
        this.openDialog(fileURL)
      },
      error => console.error('Permit download failed: ' + error))
  }

  openDialog(blobUrl: string) {
    let dialogRef = this.dialog.open(PermitViewDialog, {
      width: "100vw",
      data: {permitBlobUrl: this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl)}
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.debug(result)
      }
    })
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
  <button mat-button (click)="onNoClick()">CANCEL</button>
  <button mat-button [mat-dialog-close]="data" cdkFocusInitial>AGREED</button>
</div>`,
  styles: [`
  .dialog-full-width {
    width: 100%;
    }
`]
})
export class PermitViewDialog {

  constructor(
    public dialogRef: MatDialogRef<PermitViewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.debug('PermitBlob:', data.permitBlobUrl)
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
