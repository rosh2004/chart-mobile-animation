import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideButton } from './slide-button';

describe('SlideButton', () => {
  let component: SlideButton;
  let fixture: ComponentFixture<SlideButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
