import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandePrintComponent } from './commande-print.component';

describe('CommandePrintComponent', () => {
  let component: CommandePrintComponent;
  let fixture: ComponentFixture<CommandePrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommandePrintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandePrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
