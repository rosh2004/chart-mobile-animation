import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomChart } from './custom-chart';


describe('CustomLineChart', () => {
  let component: CustomChart;
  let fixture: ComponentFixture<CustomChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
