import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorySportComponent } from './category-sport.component';

describe('CategorySportComponent', () => {
  let component: CategorySportComponent;
  let fixture: ComponentFixture<CategorySportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategorySportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategorySportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
