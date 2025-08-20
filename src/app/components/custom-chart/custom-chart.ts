import { Component, Input, OnChanges, SimpleChanges, ViewChildren } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsCoreOption, EChartsType } from 'echarts/core';
import { BarSeriesOption, GraphicComponentOption, LineSeriesOption, XAXisComponentOption, YAXisComponentOption } from 'echarts';
import { gsap } from 'gsap';
import { XAXisOption, YAXisOption } from 'echarts/types/dist/shared';


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
  private readonly DOT_R  = 6;

  
  @Input() chartType: 'LINE' | 'COLUMN' = 'LINE';
  
  initialRendered = false;

  echartInstance?: EChartsType;

  thisWeek = [6, 10, 7, 6, 8];
  previousWeek = [2.6, 4.6, 4, 7, 5, 11, 9];
  labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  maxVal = Math.max(...this.thisWeek, ...this.previousWeek);
  niceMax = Math.ceil(this.maxVal / this.STEP) * this.STEP;

  options: EChartsCoreOption = {
    type: 'line',
    xAxis: this.getXAxis(),
    yAxis: this.getYAxis(),
    emphasis: { disabled: true },
    animation: true,
    animationDuration: 0,
    
  }

  async ngOnChanges(changes: SimpleChanges){
    if(!this.echartInstance) return;
    if(changes['chartType'] && changes['chartType'].currentValue) {
      this.hideLastDot();

      if(this.chartType === 'LINE') {
        
        this.animateBarchartToZero();
        await this.waitForFinish();
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
    await this.waitForFinish();
    if(this.chartType === 'LINE') {
      this.updateColumnToLine();
      this.echartInstance.setOption({
        graphic: this.getLastDotGraphic(700),
      })
    } else {
      this.updateLineToColumn();
      this.echartInstance.setOption({
        graphic: this.getLastDotGraphic(200),
      })

    }

  }

  async updateLineToColumn() {
    if (this.echartInstance) {
      this.echartInstance?.setOption({
        animationDuration: 200,
        animationEasing: 'quadraticInOut',
        series: this.getColumnSeries(this.thisWeek, this.previousWeek),
        graphic: this.getLastDotGraphic(200),
      });
    }
  }

  async updateColumnToLine() {
    if (this.echartInstance) {
      this.echartInstance.setOption({
        animationEasing: 'quadraticInOut',
        series: this.getLineSeries(this.thisWeek, this.previousWeek),
        graphic: this.getLastDotGraphic(700),
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
    const durationLastWeek = 800;
    const durationThisWeek = (this.previousWeek.length/this.thisWeek.length) * durationLastWeek;
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
        animationDuration: durationThisWeek,
        
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
        animationDuration: durationLastWeek,
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

  private waitForFinish(): Promise<void> {
    return new Promise<void>((resolve) => {
      const handler = () => { this.echartInstance?.off('finished', handler); resolve(); };
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

  getLastDotGraphic(delay = 700): GraphicComponentOption[] {
    if(!this.echartInstance) return [];
    const lastIdx = this.thisWeek.length - 1; // index of the last data point 
    const xCat = this.labels[lastIdx];            // e.g. 'F'
    const yVal = this.thisWeek[lastIdx];          // e.g. 8

    // get pixel coords inside the chart
    let [x, y] = this.echartInstance.convertToPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [xCat, yVal]
    ) as number[];
    if(this.chartType === 'COLUMN'){
      x = x + -5
    }

    return [
      {
        type: 'circle',
        id: 'lastDot',
        shape: { cx: x, cy: y, r: 4 },
        style: { fill: '#fff' },
        z: 10,
        keyframeAnimation: {
        duration: 400,
        delay: delay,
        loop: false,
        keyframes: [
          { percent: 0.0, shape: { r: 0, style: { opacity: 0 } } },                  
          { percent: 0.4, shape: { r: this.DOT_R * 2} , easing: 'cubicOut' },
          { percent: 0.75, shape: { r: this.DOT_R * 0.85 }, easing: 'cubicInOut' },
          { percent: 1.0,  shape: { r: this.DOT_R, style: { opacity: 1 }    }, easing: 'bounceOut' }
        ]
      }
      }
    ]
  }

  hideLastDot() {
    this.echartInstance?.setOption({
      graphic: [
        {
          type: 'circle',
          id: 'lastDot',
          keyframeAnimation: {
            duration: 200, 
            loop: false,
            keyframes: [
              { percent: 0.0, shape: { r: this.DOT_R } },
              { percent: 1.0, shape: { r: 0 }, easing: 'cubicIn' },
            ]
          }
        }
      ]
    });
  }

  getYAxis(): YAXisComponentOption{
    return {
      max: this.niceMax,
      type: 'value',
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        color: this.yAxisLabelColor,
        formatter: (value: number) => {
          return value > 0 ? `${value}`: '';
        },
        margin: 20,
      },
      interval: 3,
    }
  }

  getXAxis(): XAXisComponentOption{
    return{
      type: 'category',
      data: this.labels,
      axisLine: {
        show: false
      },
      boundaryGap: false,
      axisLabel: {
        color: this.xAxisLabelColor, 
      },
    }
  }

}
