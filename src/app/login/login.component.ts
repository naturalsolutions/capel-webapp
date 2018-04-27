import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {UserService} from '../services/user.service';
import {AuthInterceptorService} from '../services/auth-interceptor.service';
import {SessionActionsService} from '../store/session/session-actions.service';
import * as _ from 'lodash';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private fg:FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private sessionActionsService: SessionActionsService
  ) { }

  ngOnInit() {
    this.fg = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.userService.login(this.fg.value).then(data => {
      this.sessionActionsService.open(data);
      this.router.navigate(['/profile']);
    }, error => {
      console.log(error);
      if (_.get(error, 'error.error') == 'user_draft') {
        this.snackBar.open("Veuillez valider votre email", "OK", {
          duration: 5000
        });
      }
      }
    );
  }
}
