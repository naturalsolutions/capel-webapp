import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule,
  MAT_LABEL_GLOBAL_OPTIONS, MatRadioModule, MatOptionModule, MatSelectModule, MatIconModule, MatToolbarModule, MatInputModule
  , MatSnackBarModule,
  MatProgressSpinnerModule,
  MatDialog,
  MatDialogModule, MatListModule, MatDatepickerModule, MatAutocompleteModule, MatSliderModule
} from '@angular/material';


@NgModule({
  imports: [
    CommonModule, MatDialogModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule
  ],
  exports: [MatIconModule, MatSnackBarModule, MatToolbarModule, MatAutocompleteModule, MatSliderModule, MatDatepickerModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatRadioModule, MatOptionModule, MatInputModule, MatProgressSpinnerModule, MatListModule, MatDialogModule],
  declarations: [],
  providers: [
    {provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'always'}}
  ]
})
export class AppMaterialModule { }
