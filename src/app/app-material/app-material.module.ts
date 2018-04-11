import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule,
  MAT_LABEL_GLOBAL_OPTIONS, MatRadioModule, MatOptionModule, MatSelectModule, MatIconModule, MatToolbarModule
} from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule
  ],
  exports: [MatIconModule, MatToolbarModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatOptionModule],
  declarations: [],
  providers: [
    {provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'always'}}
  ]
})
export class AppMaterialModule { }
