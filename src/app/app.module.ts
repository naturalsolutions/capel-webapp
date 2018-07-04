import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import 'rxjs/add/observable/of';
import { AppRoutingModule } from './app-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {AppComponent, DiveDeleteDialog} from './app.component';
import { LoginComponent } from './login/login.component';
import { PermitComponent } from './permit/permit.component';
import { RegisterComponent } from './register/register.component';
import { AppMaterialModule } from './app-material/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthGuard } from './services/auth-guard';
import { UserService } from './services/user.service';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { StoreModule } from './models/store.module';
import { NgReduxModule } from '@angular-redux/store';
import { BoatComponent } from './boat/boat.component';
import { InitGuard } from './services/init-guard';
import {DiveAddNewSiteDialog, DiveComponent, DiveHeartDialog, DiveNotAllowedDialog, DiveSuccessDialog} from './dive/dive.component';
import { BoatService } from './services/boat.service';
import { DiveService } from './services/dive.service';

import { RuleDialog } from './permit/permit.component';
import { DivesComponent } from './dives/dives.component';
import { AppDialogsModule } from './app-dialogs/app-dialogs.module';


import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';
import { ProfileComponent, ProfileFormDialogComponent } from './profile/profile.component';

import { ChartModule } from 'angular2-highcharts';

registerLocaleData(localeFr);
import {HighchartsStatic} from 'angular2-highcharts/dist/HighchartsService';
import { ProfileFormComponent } from './profile-form/profile-form.component';
import {NgxEditorModule} from 'ngx-editor';

declare var require: any;
export function highchartsFactory() {
  const hc = require('highcharts/highstock');
  const dd = require('highcharts/modules/exporting');
  dd(hc);
  return hc;
}


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PermitComponent,
    RegisterComponent,
    BoatComponent,
    DiveComponent,
    DiveHeartDialog,
    RuleDialog,
    DiveSuccessDialog,
    DiveNotAllowedDialog,
    DiveDeleteDialog,
    DivesComponent,
    ProfileComponent,
    DiveAddNewSiteDialog,
    ProfileFormComponent,
    ProfileFormDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppMaterialModule,
    AppDialogsModule,
    AppRoutingModule,
    StoreModule,
    NgReduxModule,
    LeafletModule.forRoot(),
    LeafletMarkerClusterModule.forRoot(),
    ChartModule,
    NgxEditorModule
  ],
  entryComponents: [
    RuleDialog,
    DiveSuccessDialog,
    DiveDeleteDialog,
    DiveNotAllowedDialog,
    DiveAddNewSiteDialog,
    ProfileFormComponent,
    ProfileFormDialogComponent,
    DiveHeartDialog
  ],
  providers: [
    InitGuard,
    AuthGuard,
    UserService,
    BoatService,
    DiveService,
    {
    provide: HighchartsStatic,
    useFactory: highchartsFactory
    }
    ,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
