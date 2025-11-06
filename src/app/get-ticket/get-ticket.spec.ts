import { ComponentFixture, TestBed } from '@angular/core/testing';

// ...existing code...
// Change the imported symbol to the actual component name and use it in TestBed
import { GetTicketComponent } from './get-ticket';

describe('GetTicketComponent', () => {
  let component: GetTicketComponent;
  let fixture: ComponentFixture<GetTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GetTicketComponent] // component should be declared, not imported
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
