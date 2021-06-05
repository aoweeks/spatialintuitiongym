import { TestBed } from '@angular/core/testing';

import { RatingFeedbackService } from './rating-feedback.service';

describe('RatingFeedbackService', () => {
  let service: RatingFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatingFeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
