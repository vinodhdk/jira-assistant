import { TestBed, inject } from '@angular/core/testing';

import { AppBrowserService } from './app-browser.service';

describe('AppBrowserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppBrowserService]
    });
  });

  it('should be created', inject([AppBrowserService], (service: AppBrowserService) => {
    expect(service).toBeTruthy();
  }));
});
