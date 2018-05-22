import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader-dialog-component',
  template: `<mat-progress-spinner mode="indeterminate"></mat-progress-spinner>`
})
export class LoadingDialogComponent { }