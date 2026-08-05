import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardLivre } from './card-livre';

describe('CardLivre', () => {
  let component: CardLivre;
  let fixture: ComponentFixture<CardLivre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardLivre],
    }).compileComponents();

    fixture = TestBed.createComponent(CardLivre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
