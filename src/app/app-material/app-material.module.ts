import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule
  ],
  exports: [MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule],
  declarations: []
})
export class AppMaterialModule { }
