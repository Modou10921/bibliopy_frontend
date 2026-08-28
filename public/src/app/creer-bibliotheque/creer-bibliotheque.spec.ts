import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreerBibliotheque } from './creer-bibliotheque';

describe('CreerBibliotheque', () => {
  let component: CreerBibliotheque;
  let fixture: ComponentFixture<CreerBibliotheque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreerBibliotheque],
    }).compileComponents();

    fixture = TestBed.createComponent(CreerBibliotheque);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
