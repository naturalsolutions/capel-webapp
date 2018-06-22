import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DiveService } from '../services/dive.service';
import { NgRedux } from '@angular-redux/store';
import { months } from 'moment';
import { config } from '../settings';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {
  user: any;
  dives: any[];
  exploredSites: any = 0;
  nbrDivesMonths: any = 0;
  nbrHoursInWater: any = 0;
  nbrDives: any = 0;
  options: any;
  sites: any[] = [];
  countries = config.countries;
  constructor(private diveService: DiveService,
    private ngRedux: NgRedux<any>) {

    this.diveService.getDives().then(data => {
      this.dives = data;
      this.getExploredSite();
      this.nbrDives = this.dives.length;
      this.getNbrHoursInWaterAndNbrMonth();
      let dataChart = [
        this.getNbrDive(0),
        this.getNbrDive(1),
        this.getNbrDive(3),
        this.getNbrDive(4),
        this.getNbrDive(5),
        this.getNbrDive(6),
        this.getNbrDive(7),
        this.getNbrDive(8),
        this.getNbrDive(9),
        this.getNbrDive(10),
        this.getNbrDive(11)
      ];
      this.options = {
        chart: {
          type: 'areaspline'
        },
        title: {
          text: 'statistiques du nombre de plongées par mois'
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 150,
          y: 100,
          floating: true,
          borderWidth: 1
        },
        xAxis: {
          categories: [
            'Janvier',
            'Fevrier',
            'Mars',
            'Avril',
            'Juin',
            'Juillet',
            'Aout',
            'Septembre',
            'Octobre',
            'Novembre',
            'Decembre'
          ]
        },
        yAxis: {
          title: {
            text: 'Capel'
          }
        },
        tooltip: {
          shared: true,
          valueSuffix: ' plongées'
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'Plongées par mois',
          data: dataChart
        }]
      };
    }, error => {
      console.log(error);
    });

    const appState = this.ngRedux.getState();
    this.user = appState.session.profile;

  }

  ngOnInit() {

  }

  getNbrDive(month) {
    let nbr = 0;
    for (const dive of this.dives) {
      if (new Date(dive.divingDate).getMonth() === month)
        nbr++;
    }
    return nbr;

  }

  getNbrHoursInWaterAndNbrMonth() {
    let oldDive: any;
    for (const dive of this.dives) {
      this.calculateTimeInwater(dive.times[0][0].split(':'), dive.times[0][1].split(':'))
      if (!oldDive) {
        this.nbrDivesMonths++;
        oldDive = dive;
      } else {

        if (new Date(dive.divingDate).getMonth() === new Date(oldDive.divingDate).getMonth()) {
          oldDive = dive;
        } else {
          this.nbrDivesMonths++;
          oldDive = dive;
        }
      }
    }
  }

  getExploredSite() {

    for (const dive of this.dives) {
      let exists = false;
      for (let site of this.sites)
        if (site.id === dive.dive_site.id)
          exists = true;
      if (!exists)
        this.sites.push(dive.dive_site);
    }

  }

  calculateTimeInwater(startTime, endTime) {
    this.nbrHoursInWater += Math.abs(
      (
        ((Number(endTime[0]) * 60) + Number(endTime[1])) -
        ((Number(startTime[0]) * 60) + Number(startTime[1]))
      )
      / 60
    );
  }

}
