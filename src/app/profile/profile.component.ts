import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'user-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private fg:FormGroup;
  private user: any = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    let token:string = localStorage.getItem('portcros.token');
    if (!token)
      this.login();
    else {
      this.http.get<any>('http://127.0.0.1:5000/api/users/me', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).subscribe(user => {
        console.log(user);
        this.user = user;
        this.fg = this.fb.group({
          password: [''],
          passwordConfirm: ['']
        });
      }, error => {
        console.log(error);
        this.login();
      })
    }
  }

  login() {
    this.router.navigate(['/login']);
  }
}
