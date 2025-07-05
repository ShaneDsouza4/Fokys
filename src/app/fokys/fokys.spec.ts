import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fokys } from './fokys';

describe('Fokys', () => {
  let component: Fokys;
  let fixture: ComponentFixture<Fokys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fokys]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fokys);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
