import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule,
  MAT_LABEL_GLOBAL_OPTIONS, MatRadioModule, MatOptionModule, MatSelectModule, MatIconModule, MatToolbarModule, MatInputModule
  , MatSnackBarModule
} from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule
  ],
  exports: [MatIconModule, MatSnackBarModule, MatToolbarModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatRadioModule, MatOptionModule, MatInputModule],
  declarations: [],
  providers: [
    {provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'always'}}
  ]
})
export class AppMaterialModule { }
