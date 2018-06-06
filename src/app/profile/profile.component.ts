import { Component, OnInit } from '@angular/core';
import {DiveService} from '../services/dive.service';
import {NgRedux} from '@angular-redux/store';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any;
  dives: any[];
  constructor(private diveService: DiveService,
              private ngRedux: NgRedux<any>) {

    this.diveService.getDives().then(data => {
      this.dives = data;
      console.log(data);
    }, error => {
      console.log(error);
    });

    const appState = this.ngRedux.getState();
    this.user = appState.session.profile;

  }

  ngOnInit() {
  }

}
