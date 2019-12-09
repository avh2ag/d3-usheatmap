import { TestBed } from '@angular/core/testing';

import { NgD3UsColormapService } from './ng-d3-us-colormap.service';

describe('NgD3UsColormapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgD3UsColormapService = TestBed.get(NgD3UsColormapService);
    expect(service).toBeTruthy();
  });
});
