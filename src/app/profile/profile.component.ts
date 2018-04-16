import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import {UserService} from '../services/user.service';

@Component({
  selector: 'user-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private fg:FormGroup;
  private user: any = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userService.getProfile().then(user => {
        console.log(user);
        this.user = user;
        this.fg = this.fb.group({
          password: [''],
          passwordConfirm: ['']
        });
      }, error => {
        console.log(error);
      });
    }

}
