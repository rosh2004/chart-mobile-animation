import { Component, Input, OnChanges, SimpleChanges, ViewChildren } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsCoreOption, EChartsType } from 'echarts/core';
import { BarSeriesOption, LineSeriesOption } from 'echarts';
import { gsap } from 'gsap';


@Component({
  selector: 'app-custom-chart',
  imports: [NgxEchartsDirective],
  templateUrl: './custom-chart.html',
  styleUrl: './custom-chart.scss',
})
export class CustomChart implements OnChanges {
  readonly STEP = 3;
  readonly smoothness = 0.4
  readonly xAxisLabelColor = 'var(--x-axis-label-color)';
  readonly yAxisLabelColor = 'var(--y-axis-label-color)';
  readonly thisWeekColor = 'var(--this-week-color)';
  readonly previousWeekColor = 'var(--previous-week-color)';

  @Input() chartType: 'LINE' | 'COLUMN' = 'LINE';
  
  initialRendered = false;

  echartInstance?: EChartsType;

  thisWeek = [6, 10, 7, 6, 8];
  previousWeek = [2.6, 4.6, 4, 7, 5, 11, 9];
  labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  maxVal = Math.max(...this.thisWeek, ...this.previousWeek);
  niceMax = Math.ceil(this.maxVal / this.STEP) * this.STEP;

  options: EChartsCoreOption = {
    xAxis: {
      type: 'category',
      data: this.labels,
      axisLine: false,
      axisLabel: {
        color: this.xAxisLabelColor, 
      },
      boundaryGap: false,
    },
    
    yAxis: {
      max: this.niceMax,
      type: 'value',
      axisLine: false,
      splitLine: {
        show: false
      },
      axisLabel: {
        color: this.yAxisLabelColor,
        formatter: (value: number) => {
          return value > 0 ? value: '';
        },
        margin: 20,
      },
      interval: 3,
    },
    animationDuration: 700,
    animationEasing: 'quadraticInOut',
  }

  async ngOnChanges(changes: SimpleChanges){
    if(!this.echartInstance) return;
    if(changes['chartType'] && changes['chartType'].currentValue) {

      if(this.chartType === 'LINE') {

        this.animateBarchartToZero();
        await this.waitForRender();
        this.updateColumnToLine();
      } else {

        await this.shrinkClipsRightToLeft(0.4);
        this.updateLineToColumn();
      }
    }
  }

  async onChartInit(echartsInstance: EChartsType){
    if(this.initialRendered) return;
    this.initialRendered = true;
    this.echartInstance = echartsInstance;
    await Promise.resolve(setTimeout(() => {}, 0));
      if(this.chartType === 'LINE') {
        this.updateColumnToLine();
      } else {
        this.updateLineToColumn();
      }
  }

  updateLineToColumn() {
    if (this.echartInstance) {
      this.echartInstance.setOption({
        animationDuration: 200,
        animationEasing: 'quadraticInOut',
        series: this.getColumnSeries(this.thisWeek, this.previousWeek),
      });
    }
  }

  updateColumnToLine() {
    if (this.echartInstance) {
      this.echartInstance.on('rendered', () => {
        this.echartInstance?.dispatchAction({
          type: 'hideTip',
        });
      });
      this.echartInstance.setOption({
        animationDuration: 700,
        animationEasing: 'quadraticInOut',
        series: this.getLineSeries(this.thisWeek, this.previousWeek),
      });
    }
  }

  getColumnSeries(thisWeek: number[], previousWeek: number[]): BarSeriesOption[] {
    return [
      {
        name: 'Test',
        type: 'bar',
        data: thisWeek,
        barWidth: 3,
        color: this.thisWeekColor,
        barGap: '200%',
      },
      {
        name: 'Test',
        type: 'bar',
        data: previousWeek,
        barWidth: 3,
        color: this.previousWeekColor,
        barGap: '200%',
      }
    ]
  }

  getLineSeries(thisWeek: number[], previousWeek: number[]): LineSeriesOption[] {
    return [
      {
        name: '',
        type: 'line',
        smooth: this.smoothness,
        smoothMonotone:'x',
        data: thisWeek,
        showSymbol: false,
        lineStyle: {
          color: this.thisWeekColor,
          width: 3,
        },
        z: 2,
        
      },
      {
        name: 'Previous',
        type: 'line',
        smooth:this.smoothness,
        smoothMonotone:'x',
        data: previousWeek,
        showSymbol: false,
        lineStyle: {
          color: this.previousWeekColor,
          width: 3,  
        },
        z: 1,
      }
    ]
  }

  animateBarchartToZero() {
    if (this.echartInstance) {
      this.echartInstance.setOption({
        series: [
          {
            type: 'bar',
            data: this.thisWeek.map(() => 0),
            animationDurationUpdate: 200,
            animationEasing: 'quadraticInOut',
          },
          {
            type: 'bar',
            data: this.previousWeek.map(() => 0),
            animationDurationUpdate: 200,
            animationEasing: 'quadraticInOut',
          }
        ]
      });
    }
  }

  animateLineChartToZero() {
    if (this.echartInstance) {
      this.echartInstance.setOption({
        series: [
          {
            type: 'line',
            data: this.thisWeek.map(() => 0),
            animationDurationUpdate: 200,
            animationEasing: 'quadraticInOut',
          },
          {
            type: 'line',
            data: this.previousWeek.map(() => 0),
            animationDurationUpdate: 200,
            animationEasing: 'quadraticInOut',
          }
        ]
      });
    }
  }

  async waitForRender() {
    new Promise<void>((resolve) => {
      const handler = () => {
        this.echartInstance?.off('finished', handler); // clean up
        resolve();
      };
      this.echartInstance?.on('finished', handler);
    });
  }


private async shrinkClipsRightToLeft(duration = 0.6, ease = 'power2.inOut') {
  const svg = this.echartInstance?.getDom().querySelector('svg') as SVGSVGElement | null;
  if (!svg) return;

  // grab the actual clip shapes
  const clipShapes = Array.from(svg.querySelectorAll('clipPath > path')) as SVGPathElement[];
  if (!clipShapes.length) return;

  const tweens: Promise<void>[] = [];
  for (const shape of clipShapes) {
    const bb = shape.getBBox();                         // in user units
    const originX = bb.x;                    // right edge
    const originY = bb.y + bb.height / 2;               // vertical center

    // set right-edge origin, then scaleX -> 0
    gsap.set(shape, { scaleX: 1, svgOrigin: `${originX} ${originY}` });
    tweens.push(new Promise<void>(resolve => {
      gsap.to(shape, { scaleX: 0, duration, ease, onComplete: resolve });
    }));
  }
  await Promise.all(tweens);
}

}
