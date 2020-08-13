import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistWatchDisplayComponent } from './playlist-watch-display.component';

describe('PlaylistWatchDisplayComponent', () => {
  let component: PlaylistWatchDisplayComponent;
  let fixture: ComponentFixture<PlaylistWatchDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaylistWatchDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistWatchDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
