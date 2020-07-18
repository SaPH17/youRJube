import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondVideoDisplayComponent } from './second-video-display.component';

describe('SecondVideoDisplayComponent', () => {
  let component: SecondVideoDisplayComponent;
  let fixture: ComponentFixture<SecondVideoDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondVideoDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondVideoDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
