import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryGamingComponent } from './category-gaming.component';

describe('CategoryGamingComponent', () => {
  let component: CategoryGamingComponent;
  let fixture: ComponentFixture<CategoryGamingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryGamingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryGamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
