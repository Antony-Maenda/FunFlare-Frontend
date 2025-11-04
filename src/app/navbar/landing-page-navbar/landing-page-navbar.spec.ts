import { ComponentFixture, TestBed } from '@angular/core/testing';
 import { LandingPageNavbar } from './landing-page-navbar';

describe('LandingPageNavbar', () => {
  let component: LandingPageNavbar;
  let fixture: ComponentFixture<LandingPageNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
