import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog } from '@angular/material';
import { UserService } from '../services/user.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class RegisterComponent implements OnInit {
  userForm: FormGroup;
  boats: FormArray = new FormArray([]);
  status: string = '';
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private dialog: MatDialog
  ) {

  }

  // create new Boat Form
  createBoat(): FormGroup {
    //TODO manage required fields
    return this.fb.group({
      name: new FormControl(''),
      matriculation: new FormControl(''),
    });
  }

  // component initialisation
  ngOnInit() {
    this.userForm = this.fb.group({
      category: new FormControl('', Validators.required),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      repeat: new FormControl('', [Validators.required, Validators.minLength(6)]),
      boats: this.fb.array([])
    }, { validator: this.passwordConfirming , updateOn: 'blur' });

  }
  // Confirm password validation
  passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get('password').value !== c.get('repeat').value) {
      return { invalid: true };
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
    if (this.userForm.invalid) {
      this.snackBar.openFromComponent(ErrorComponent, {
        duration: 1000
      });
    } else {
      const data: any = this.userForm.getRawValue();
      delete data.repeat;
      data.boats = _.filter(data.boats, boat => {
        if (_.get(boat, 'name') && _.get(boat, 'matriculation'))
          return boat;
      });
      let dialogRef = this.dialog.open(LoaderDialogComponent, {
        disableClose: true
      });

      this.userService.post(data)
        .then(user => {
          setTimeout(() => {
            dialogRef.close();
            this.status = 'complete';
          }, 500);
        }, error => {
          if (_.get(error, 'error.error.name') == 'invalid_model')
            this.snackBar.open("Cet email exite déjà", "OK", {
              duration: 5000
            });
          setTimeout(() => {
            dialogRef.close();
          }, 500);
        });
    }
  }

  // User getters
  get lastname(){ return this.userForm.get('lastname'); }
  get firstname(){ return this.userForm.get('firstname'); }
  get category(){ return this.userForm.get('type'); }
  get email(){ return this.userForm.get('email'); }
  get phone(){ return this.userForm.get('phone'); }
  get address(){ return this.userForm.get('address'); }
  get password(){ return this.userForm.get('password'); }
  get repeat(){ return this.userForm.get('repeat'); }

  // Boat Getters
  get name() { return this.userForm.get('boats').get('name'); }
  get matriculation() { return this.userForm.get('boats').get('matriculation'); }
}
@Component({
  selector: 'app-error-component',
  template: `<div class="error">Merci de remplir les champs correctement</div>`,
  styles: [`.error { color: red; }`],
})
export class ErrorComponent { }

@Component({
  selector: 'app-loader-dialog-component',
  template: `<mat-progress-spinner mode="indeterminate"></mat-progress-spinner>`
})
export class LoaderDialogComponent { }
