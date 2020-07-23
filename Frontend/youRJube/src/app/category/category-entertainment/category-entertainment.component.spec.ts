import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryEntertainmentComponent } from './category-entertainment.component';

describe('CategoryEntertainmentComponent', () => {
  let component: CategoryEntertainmentComponent;
  let fixture: ComponentFixture<CategoryEntertainmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryEntertainmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryEntertainmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
