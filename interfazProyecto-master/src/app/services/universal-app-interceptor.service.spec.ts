import { TestBed } from '@angular/core/testing';

import { UniversalAppInterceptor } from './universal-app-interceptor.service';

describe('UniversalAppInterceptor', () => {
  let service: UniversalAppInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversalAppInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
