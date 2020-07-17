import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoReplyComponent } from './video-reply.component';

describe('VideoReplyComponent', () => {
  let component: VideoReplyComponent;
  let fixture: ComponentFixture<VideoReplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoReplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
