import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {BoatModule} from '../models/boat.module';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {
  userForm: FormGroup;
  boats: FormArray =  new FormArray([]);
  constructor(private fb: FormBuilder) {
    this.userForm = fb.group({
      type: ['', Validators.required ],
      firstname: ['', Validators.required ],
      lastname: ['', Validators.required ],
      email: ['', Validators.required ],
      phone: ['', Validators.required ],
      address: ['', Validators.required ],
      password:  ['', Validators.required ],
      boats: fb.array([])
    });
  }
  createBoat(): FormGroup {
    return this.fb.group({
      name: '',
      immatriculation: ''
    });
  }
  ngOnInit() {

  }
  addBoat() {
    this.boats = this.userForm.get('boats') as FormArray;
    this.boats.push(this.createBoat());
  }
  removeBoat(indice: any) {
    this.boats.removeAt(indice);
  }
  save() {
    console.log(this.userForm.getRawValue());
  }
}
