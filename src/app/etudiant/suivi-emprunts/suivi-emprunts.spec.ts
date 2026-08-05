import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviEmprunts } from './suivi-emprunts';

describe('SuiviEmprunts', () => {
  let component: SuiviEmprunts;
  let fixture: ComponentFixture<SuiviEmprunts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviEmprunts],
    }).compileComponents();

    fixture = TestBed.createComponent(SuiviEmprunts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
