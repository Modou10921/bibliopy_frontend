import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionLivres } from './gestion-livres';

describe('GestionLivres', () => {
  let component: GestionLivres;
  let fixture: ComponentFixture<GestionLivres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionLivres],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionLivres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
