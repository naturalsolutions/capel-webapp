import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {UserService} from '../services/user.service';
import {AuthInterceptorService} from '../services/auth-interceptor.service';
import {SessionActionsService} from '../store/session/session-actions.service';

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
    });
  }
}
