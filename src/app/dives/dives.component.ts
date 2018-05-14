import { Component, OnInit } from '@angular/core';
import {DiveService} from '../services/dive.service';

@Component({
  selector: 'app-dives',
  templateUrl: './dives.component.html',
  styleUrls: ['./dives.component.scss']
})
export class DivesComponent implements OnInit {
  dives = []
  constructor(private diveService: DiveService) { }

  ngOnInit() {
    this.diveService.getDives().then(data => {
      console.log(data);
    }, error => {
      console.log(error);
    })
  }

}
