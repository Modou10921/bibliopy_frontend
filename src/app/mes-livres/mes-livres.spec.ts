import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesLivres } from './mes-livres';

describe('MesLivres', () => {
  let component: MesLivres;
  let fixture: ComponentFixture<MesLivres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesLivres],
    }).compileComponents();

    fixture = TestBed.createComponent(MesLivres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
