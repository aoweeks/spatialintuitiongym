import { TestBed } from '@angular/core/testing';

import { MathsUtilsService } from './maths-utils.service';

describe('MathsUtilsService', () => {
  let service: MathsUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MathsUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
