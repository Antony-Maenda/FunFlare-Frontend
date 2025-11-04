import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetTicket } from './get-ticket';

describe('GetTicket', () => {
  let component: GetTicket;
  let fixture: ComponentFixture<GetTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetTicket]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetTicket);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
