import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryMusicComponent } from './category-music.component';

describe('CategoryMusicComponent', () => {
  let component: CategoryMusicComponent;
  let fixture: ComponentFixture<CategoryMusicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryMusicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryMusicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
