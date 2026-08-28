import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendreLivre } from './rendre-livre';

describe('RendreLivre', () => {
  let component: RendreLivre;
  let fixture: ComponentFixture<RendreLivre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendreLivre],
    }).compileComponents();

    fixture = TestBed.createComponent(RendreLivre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
