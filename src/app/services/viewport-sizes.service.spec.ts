import { TestBed } from '@angular/core/testing';

import { ViewportSizesService } from './viewport-sizes.service';

describe('ViewportSizesService', () => {
  let service: ViewportSizesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewportSizesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
