import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantsAdmin } from './etudiants-admin';

describe('EtudiantsAdmin', () => {
  let component: EtudiantsAdmin;
  let fixture: ComponentFixture<EtudiantsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantsAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(EtudiantsAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
