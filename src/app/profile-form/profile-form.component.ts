import {Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, Inject} from '@angular/core';
import {MatSnackBar, MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { config } from '../settings';
import { UserService } from '../services/user.service';
import { LoadingDialogComponent } from '../app-dialogs/loading-dialog/loading-dialog.component';
import * as _ from "lodash";
import { countries } from '../app-assets/countries/fr';
import {DomSanitizer} from '@angular/platform-browser';
import {SessionActionsService} from '../store/session/session-actions.service';
import {Router} from '@angular/router';
import  commons from '../app-assets/communes/fr.json';
import {Observable} from 'rxjs/index';
import {map, startWith} from 'rxjs/operators';
@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileFormComponent implements OnInit {

  @Input()
  method: string;

  @Output()
  saved = new EventEmitter<any>();

  user: any = {};
  dataToPatch: any;
  userForm: FormGroup;
  boats: FormArray = new FormArray([]);
  status: string = '';
  isSubmit: boolean;
  config = config;
  keys = Object.keys(countries);
  countries = countries;
  hide;
  commons: any[] = commons;
  commonCtrl = new FormControl();
  filteredCommons: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private dialog: MatDialog,
    private sessionActionsService: SessionActionsService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.filteredCommons = this.commonCtrl.valueChanges
    .pipe(startWith(''),
      map(common => common ? this._filterCommons(common) : this.commons.slice())
    );
  }
  private _filterCommons(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.commons.filter(common => common.comm_minus.toLowerCase().indexOf(filterValue) === 0);
  }
  getImageSanitiser(img: any){
    return this.sanitizer.bypassSecurityTrustResourceUrl(img);
  }
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
      common: new FormControl(''),
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
  categoryChange(event) {
    if(event.value == 'particulier'){
      let dialogRef = this.dialog.open(CategoryChangeDialog, {
        width: '600px',
        data: {
        }
      });
      dialogRef.afterClosed().subscribe(value => {
        if(value)
          this.userForm.controls['category'].setValue('particulier');
        else
          this.userForm.controls['category'].setValue('structure');
      });
    }
  }
  upload(e) {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.userService.patchMe({
        photo: 'data: image/' + file.type + '; base64 ,' + reader.result.split(',')[1],
        boats: []
      }).then(data => {
        this.sessionActionsService.patch(data);
        this.user = data;
      });
    }
  }
  fetch() {
    this.userService.getProfile()
      .then(data => {
        this.feed(data);
      }, error => {
        console.log(error);
      });
  }

  feed(data) {
    this.user = data;
    this.dataToPatch = data;
    this.userForm.patchValue(data);
    this.commonCtrl.setValue(data.common)
    //TODO manage nested
    this.boats = this.userForm.get('boats') as FormArray;
    this.boats.reset();
    data.boats.forEach(boat => {
      let fg: FormGroup = this.fb.group({
        id: new FormControl(boat.id),
        name: new FormControl(boat.name, Validators.required),
        matriculation: new FormControl(boat.matriculation, Validators.required),
      });
      this.boats.push(fg);
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
        if (!formBoat) {
          boat.status = 'removed';
          return boat;
        }else
          return formBoat;
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
      formData.common = this.commonCtrl.value;
      console.log(formData);

      let srvMethod: Promise<any> = this.method == 'post' ? this.userService.post(formData) : this.userService.patchMe(formData);

      srvMethod.then(user => {
        this.saved.emit(user);
        setTimeout(() => {
          dialogRef.close();
          this.snackBar.open("Modifications enregistrées", "OK", {
            duration: 3000
          });
          this.status = 'complete';
        }, 500);
        this.router.navigate(['/statistics']);
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

  // User Getters
  get lastname() { return this.userForm.get('lastname'); }
  get firstname() { return this.userForm.get('firstname'); }
  get category() { return this.userForm.get('category'); }
  get password() { return this.userForm.get('password'); }
  get repeat() { return this.userForm.get('repeat'); }

  // Boat Getters
  get name() { return this.userForm.get('boats').get('name'); }
  get matriculation() { return this.userForm.get('boats').get('matriculation'); }

}
@Component({
  selector: 'category-change-dialog',
  template: `
    <h4>Attention !</h4>
    <mat-dialog-content>
      Changement de status profil, vous allez perdre une partie d'information.<br>
      Voulez-vous confirmer?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button  mat-raised-button mat-dialog-close color="primary" (click)="confirm()">
        Confirmer
      </button>
      <button mat-raised-button mat-dialog-close color="primary" (click)="close()">
        Annuler
      </button>
    </mat-dialog-actions>`
})
export class CategoryChangeDialog {

  constructor(public dialogRef: MatDialogRef<CategoryChangeDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  confirm() {
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }
}
