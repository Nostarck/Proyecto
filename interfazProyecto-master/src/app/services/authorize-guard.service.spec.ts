import { TestBed } from '@angular/core/testing';

import { AuthorizeGuard } from './authorize-guard.service';

describe('AuthorizeGuardService', () => {
  let service: AuthorizeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorizeGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
