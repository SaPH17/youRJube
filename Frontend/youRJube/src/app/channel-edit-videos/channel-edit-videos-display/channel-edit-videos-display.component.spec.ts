import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelEditVideosDisplayComponent } from './channel-edit-videos-display.component';

describe('ChannelEditVideosDisplayComponent', () => {
  let component: ChannelEditVideosDisplayComponent;
  let fixture: ComponentFixture<ChannelEditVideosDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelEditVideosDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelEditVideosDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
