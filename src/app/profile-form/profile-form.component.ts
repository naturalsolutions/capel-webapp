import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { config } from '../settings';
import { UserService } from '../services/user.service';
import { LoadingDialogComponent } from '../app-dialogs/loading-dialog/loading-dialog.component';
import * as _ from "lodash";

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileFormComponent implements OnInit {

  @Input()
  method: string;

  dataToPatch: any;
  userForm: FormGroup;
  boats: FormArray = new FormArray([]);
  status: string = '';
  isSubmit: boolean;
  config = config;
  keys = Object.keys(config.countries);

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private dialog: MatDialog
  ) { }

  // component initialisation
  ngOnInit() {

    this.userForm = this.fb.group({
      category: new FormControl('particulier', Validators.required),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      website: new FormControl(''),
      company: new FormControl(''),
      email: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      zip: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      country: new FormControl('FR', Validators.required),
      password: new FormControl(''),
      repeat: new FormControl(''),
      boats: this.fb.array([])
    }, { validator: this.passwordConfirming, updateOn: 'blur' });

    if (this.method == 'post') {
      this.userForm.get('password').setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('repeat').setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      this.fetch();
    }
    /* console.log(this.user);
    if (this.user)
      this.userForm.patchValue(this.user); */
  }

  fetch() {
    this.userService.getProfile()
      .then(user => {
        this.dataToPatch = user;
        this.userForm.patchValue(user);
        //TODO manage nested
        this.boats = this.userForm.get('boats') as FormArray;
        user.boats.forEach(boat => {
          let fg: FormGroup = this.fb.group({
            id: new FormControl(boat.id),
            name: new FormControl(boat.name, Validators.required),
            matriculation: new FormControl(boat.matriculation, Validators.required),
          });
          this.boats.push(fg);
        });
      }, error => {
        console.log(error);
      });
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
    let fg: FormGroup = this.fb.group({
      id: new FormControl(null),
      name: new FormControl('', Validators.required),
      matriculation: new FormControl('', Validators.required),
    });
    this.boats.push(fg);
  }

  // remove Boat
  removeBoat(indice: any) {
    this.boats.removeAt(indice);
  }

  // save User
  save() {
    this.isSubmit = true;
    if (this.userForm.invalid) {
      this.snackBar.open("Merci de remplir les champs correctement", "OK", {
        duration: 3000
      });
    } else {
      let formData: any = this.userForm.getRawValue();
      let boats = _.map(this.dataToPatch.boats, boat => {
        let formBoat: any = _.find(formData.boats, formBoat => {
          return formBoat.id == boat.id;
        });
        if (!formBoat)
          boat.status = 'removed';
        return boat;
      });

      let newBoats = _.filter(formData.boats, formBoat => {
        if (formBoat.id)
          return false;
        delete formBoat.id;
        return true;
      });

      formData.boats = boats.concat(newBoats);
      formData.boats = _.filter(formData.boats, boat => {
        if (_.get(boat, 'name') && _.get(boat, 'matriculation'))
          return boat;
      });
      let dialogRef = this.dialog.open(LoadingDialogComponent, {
        disableClose: true
      });

      delete formData.repeat;
      
      console.log(formData);

      let srvMethod:Promise<any> = this.method == 'post' ? this.userService.post(formData) : this.userService.post(formData);
      
      srvMethod.then(user => {
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
  get lastname() { return this.userForm.get('lastname'); }
  get firstname() { return this.userForm.get('firstname'); }
  get category() { return this.userForm.get('category'); }
  get password() { return this.userForm.get('password'); }
  get repeat() { return this.userForm.get('repeat'); }

  // Boat Getters
  get name() { return this.userForm.get('boats').get('name'); }
  get matriculation() { return this.userForm.get('boats').get('matriculation'); }

}
