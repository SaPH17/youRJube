import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelCommunityDisplayComponent } from './channel-community-display.component';

describe('ChannelCommunityDisplayComponent', () => {
  let component: ChannelCommunityDisplayComponent;
  let fixture: ComponentFixture<ChannelCommunityDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelCommunityDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelCommunityDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
