import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerNavbar } from './buyer-navbar';

describe('BuyerNavbar', () => {
  let component: BuyerNavbar;
  let fixture: ComponentFixture<BuyerNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyerNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyerNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
