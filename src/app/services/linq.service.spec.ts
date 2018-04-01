import { TestBed, inject } from '@angular/core/testing';

import { LinqService } from './linq.service';

describe('LinqService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LinqService]
    });
  });

  it('should be created', inject([LinqService], (service: LinqService) => {
    expect(service).toBeTruthy();
  }));
});
