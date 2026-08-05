import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEmprunts } from './gestion-emprunts';

describe('GestionEmprunts', () => {
  let component: GestionEmprunts;
  let fixture: ComponentFixture<GestionEmprunts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEmprunts],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionEmprunts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
