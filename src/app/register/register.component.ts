import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {
  userForm: FormGroup;
  boats: FormArray =  new FormArray([]);
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {

  }

  // create new Boat Form
  createBoat(): FormGroup {
    return this.fb.group({
      name: new FormControl('', Validators.required),
      immatriculation: new FormControl('', Validators.required),
    });
  }

  // component initialisation
  ngOnInit() {
    this.userForm = this.fb.group({
      type: new FormControl('', Validators.required),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      password:  new FormControl('', Validators.required),
      repeat:  new FormControl('', Validators.required),
      boats: this.fb.array([])
    }, {validator: this.passwordConfirming});
    this.addBoat();
  }
  // Confirm password validation
  passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get('password').value !== c.get('repeat').value) {
      return {invalid: true};
    }
  }
  // add new Boat
  addBoat() {
    this.boats = this.userForm.get('boats') as FormArray;
    this.boats.push(this.createBoat());
  }

  // remove Boat
  removeBoat(indice: any) {
    this.boats.removeAt(indice);
  }

  // save User
  save() {
    if ( this.userForm.invalid ) {
      this.snackBar.openFromComponent(ErrorComponent, {
        duration: 1000,
      });
    }else {
      console.log(this.userForm.getRawValue());
    }
  }

  // User getters
  get lastname(){ return this.userForm.get('lastname'); }
  get firstname(){ return this.userForm.get('firstname'); }
  get type(){ return this.userForm.get('type'); }
  get email(){ return this.userForm.get('email'); }
  get phone(){ return this.userForm.get('phone'); }
  get address(){ return this.userForm.get('address'); }
  get password(){ return this.userForm.get('password'); }
  get repeat(){ return this.userForm.get('repeat'); }

  // Boat Getters
  get name(){ return this.userForm.get('boats').get('name'); }
  get immatriculation(){ return this.userForm.get('boats').get('immatriculation'); }

}
@Component({
  selector: 'app-error-component',
  template: `<div class="error">Merci de remplir les champs correctement</div>`,
  styles: [`.error { color: red; }`],
})
export class ErrorComponent {}
