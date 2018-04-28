import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialog,
  MatDatepickerModule,
  MatDialogModule,
  MatFormFieldModule,
  MatListModule,
  MatIconModule,
  MatInputModule,
  MAT_LABEL_GLOBAL_OPTIONS,
  MatOptionModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatSliderModule
} from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule, 
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSliderModule,
    MatToolbarModule,
  ],
  declarations: [],
  providers: [
    {provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'always'}}
  ]
})
export class AppMaterialModule { }
