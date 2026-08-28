import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeEmprunt } from './demande-emprunt';

describe('DemandeEmprunt', () => {
  let component: DemandeEmprunt;
  let fixture: ComponentFixture<DemandeEmprunt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeEmprunt],
    }).compileComponents();

    fixture = TestBed.createComponent(DemandeEmprunt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
