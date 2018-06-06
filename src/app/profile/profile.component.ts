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
  exploredSites: any = 0;
  nbrDivesMonths: any = 0;
  nbrHoursInWater: any = 0;
  nbrDives: any = 0;
  constructor(private diveService: DiveService,
              private ngRedux: NgRedux<any>) {

    this.diveService.getDives().then(data => {
      this.dives = data;
      this.nbrDives = this.dives.length;
      this.getNbrHoursInWaterAndNbrMonth();
    }, error => {
      console.log(error);
    });

    const appState = this.ngRedux.getState();
    this.user = appState.session.profile;

  }

  ngOnInit() {
  }
  getNbrHoursInWaterAndNbrMonth() {
    let oldDive: any, startTime: any, endTime: any;
    for ( const dive of this.dives) {
      startTime = dive.times[0][0].split(':');
      endTime = dive.times[0][1].split(':');
      this.nbrHoursInWater += Math.abs(((( Number(endTime[0]) * 60 ) +  Number(endTime[1])) - (( Number(startTime[0]) * 60 ) + Number(startTime[1]))) / 60);
      if ( ! oldDive ) {
        this.nbrDivesMonths++;
        oldDive = dive;
      }else {
        if ( new Date(dive.divingDate).getMonth() === new Date(oldDive.divingDate).getMonth() ) {
          oldDive = dive;
        }else {
          this.nbrDivesMonths++;
          oldDive = dive;
        }
      }
    }
  }

}
