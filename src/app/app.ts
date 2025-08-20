import { Component } from '@angular/core';
import { TopBar } from "./components/top-bar/top-bar";
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from './custom-echarts';
import { CustomChart } from './components/custom-chart/custom-chart';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [TopBar, CustomChart],
  providers: [provideEchartsCore({ echarts })],
})
export class App {
  chartType: 'LINE' | 'COLUMN' = 'LINE';


  updateChartType(type: 'LINE' | 'COLUMN') {
    this.chartType = type;
  }
}
