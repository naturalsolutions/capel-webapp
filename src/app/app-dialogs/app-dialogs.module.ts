import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { AppMaterialModule } from '../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule
  ],
  declarations: [LoadingDialogComponent],
  entryComponents: [LoadingDialogComponent]
})
export class AppDialogsModule { }
