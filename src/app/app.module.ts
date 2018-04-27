import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { ErrorComponent, RegisterComponent, LoaderDialogComponent } from './register/register.component';
import { AppMaterialModule } from './app-material/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthGuard } from './services/auth-guard';
import { UserService } from './services/user.service';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { StoreModule } from './models/store.module';
import { NgReduxModule } from '@angular-redux/store';
import { BoatComponent } from './boat/boat.component';
import { InitGuard } from './services/init-guard';
import { DiveComponent } from './dive/dive.component';
import {BoatService} from './services/boat.service';
import {DiveService} from './services/dive.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileComponent,
    RegisterComponent,
    BoatComponent,
    ErrorComponent,
    LoaderDialogComponent,
    DiveComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppMaterialModule,
    AppRoutingModule,
    StoreModule,
    NgReduxModule,
    LeafletModule.forRoot()
  ],
  entryComponents: [ErrorComponent, LoaderDialogComponent],
  providers: [
    InitGuard,
    AuthGuard,
    UserService,
    BoatService,
    DiveService,
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
