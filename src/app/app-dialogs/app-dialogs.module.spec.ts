import { AppDialogsModule } from './app-dialogs.module';

describe('AppDialogsModule', () => {
  let appDialogsModule: AppDialogsModule;

  beforeEach(() => {
    appDialogsModule = new AppDialogsModule();
  });

  it('should create an instance', () => {
    expect(appDialogsModule).toBeTruthy();
  });
});
