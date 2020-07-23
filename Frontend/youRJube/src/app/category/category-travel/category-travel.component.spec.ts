import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTravelComponent } from './category-travel.component';

describe('CategoryTravelComponent', () => {
  let component: CategoryTravelComponent;
  let fixture: ComponentFixture<CategoryTravelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryTravelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryTravelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
