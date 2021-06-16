import { TestBed } from '@angular/core/testing';

import { CubeStackCanvasesService } from './cube-stack-canvases.service';

describe('CubeStackCanvasesService', () => {
  let service: CubeStackCanvasesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CubeStackCanvasesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
