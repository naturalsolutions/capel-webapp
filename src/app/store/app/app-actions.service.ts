import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class AppActionsService {

  constructor(
    private http: HttpClient,
    private ngRedux: NgRedux<any>,
    private userService: UserService) { }

  static PATCH_APP = 'PATCH_APP';
  public patch(data: any): void {
    this.ngRedux.dispatch({ type: AppActionsService.PATCH_APP, data: data });
  }

  static APP_ADD_UNIQ_MESSAGE = 'APP_ADD_UNIQ_MESSAGE';
  public addUniqMessage(name: string): void {
    this.ngRedux.dispatch({ type: AppActionsService.APP_ADD_UNIQ_MESSAGE, data: name });
  }
}

export interface IAppAction {
  type: string;
  data: any;
}
