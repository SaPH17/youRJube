import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoRelatedComponent } from './video-related.component';

describe('VideoRelatedComponent', () => {
  let component: VideoRelatedComponent;
  let fixture: ComponentFixture<VideoRelatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoRelatedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoRelatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
