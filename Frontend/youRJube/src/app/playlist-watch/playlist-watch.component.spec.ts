import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistWatchComponent } from './playlist-watch.component';

describe('PlaylistWatchComponent', () => {
  let component: PlaylistWatchComponent;
  let fixture: ComponentFixture<PlaylistWatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaylistWatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistWatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
