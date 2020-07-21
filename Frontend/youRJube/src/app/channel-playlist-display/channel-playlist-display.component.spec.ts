import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelPlaylistDisplayComponent } from './channel-playlist-display.component';

describe('ChannelPlaylistDisplayComponent', () => {
  let component: ChannelPlaylistDisplayComponent;
  let fixture: ComponentFixture<ChannelPlaylistDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelPlaylistDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelPlaylistDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
