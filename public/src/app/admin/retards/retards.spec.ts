import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Retards } from './retards';

describe('Retards', () => {
  let component: Retards;
  let fixture: ComponentFixture<Retards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Retards],
    }).compileComponents();

    fixture = TestBed.createComponent(Retards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
