import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgD3UsColormapComponent } from './ng-d3-us-colormap.component';

describe('NgD3UsColormapComponent', () => {
  let component: NgD3UsColormapComponent;
  let fixture: ComponentFixture<NgD3UsColormapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgD3UsColormapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgD3UsColormapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
