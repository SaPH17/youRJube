import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelEditVideosComponent } from './channel-edit-videos.component';

describe('ChannelEditVideosComponent', () => {
  let component: ChannelEditVideosComponent;
  let fixture: ComponentFixture<ChannelEditVideosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelEditVideosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelEditVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
