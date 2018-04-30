import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import {UserService} from '../services/user.service';
import { config } from '../settings';
import { MatSnackBar} from '@angular/material';
import * as _ from 'lodash';
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
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
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
        if (_.get(error, 'statusText') === 'UNAUTHORIZED') {
          this.snackBar.open("le Token est expiré", "OK", {
            duration: 1000
          });
          this.router.navigate(['/login']);
        }
      });
    }

}
