import { Component, OnInit, Input, AfterViewInit, HostListener,
  ViewChild, OnChanges, SimpleChanges,
  SimpleChange, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { stateCodes } from './map-info/states';
import { US_FEATURE_DATA } from './map-info/us-10m.v1';

@Component({
  selector: 'ng-d3-us-colormap',
  template: `
    <div #chartContainer [id]='chartId' >
    </div>
  `,
  styles: []
})
export class NgD3UsColormapComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() chartId = 'united-states';
  @Input() data = [];
  @Input() dataScaleColors = ['#7f0000', '#ffd500', '#228B22'];
  @Input() noEntryColor = '#c9c9c9';
  @Input() tooltipTextFn: (stateName: string, value: string ) => string;
  @Input() isUseStateCode = true;
  @Output() stateClicked = new EventEmitter<any>();
  @Output() stateHovered = new EventEmitter<any>();
  @Output() stateMouseout = new EventEmitter<any>();
  containerSelector = `#${this.chartId}`;
  @ViewChild('chartContainer', {static: false}) chartContainer;
  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.drawMap();
  }
  ngOnChanges(changes: SimpleChanges) {
    // check for changes to data, lowColor, highColor
    this.checkForChange(changes, 'chartId', this.drawMap);
    this.checkForChange(changes, 'data', this.drawMap);

    this.checkForChange(changes, 'dataScaleColors', this.drawMap);
    this.checkForChange(changes, 'isUseStateCode', this.drawMap);

  }

  // callback to run if change detected
  private checkForChange(changes: SimpleChanges, changeKeyName: string, cb: () => any) {
    const change: SimpleChange = changes[changeKeyName];
    if (!change || change.firstChange) {
      return;
    }
    if (change.previousValue !== change.currentValue) {
      cb();
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.drawMap();
    }, 100);
  }

  drawMap = () => {
    const getStateData = (featureData) => {
      const stateName = stateNames.get(+featureData.id);
      const val = stateValues.get(stateName);
      return { stateName, val };
    };
    d3.select(`${this.containerSelector} svg`).remove();
    const bounds = this.chartContainer.nativeElement.getBoundingClientRect();
    const width = bounds.width ? bounds.width : window.innerWidth;
    const resolution = 1000;
    const scaledHeight = width * 0.618;
    const viewBoxHeight = scaledHeight + 80; // 80 is the total amount of translation for legend
    const svg = d3.select(this.containerSelector)
      .append('svg')
      .attr('width', width)
      .attr('height', scaledHeight)
      .attr('viewBox', `0 0 ${width} ${ viewBoxHeight }`)
      .attr('preserveAspectRatio', 'xMinYMid');

    const stateSelectorType = this.isUseStateCode ? 'code' : 'name';
    const stateValues = d3.map();
    this.data.forEach( d => {
      stateValues.set(d[stateSelectorType], +d.value);
    });

    const stateNames = d3.map();
    stateCodes.forEach((d) => {
      stateNames.set(+d.id, d[stateSelectorType]);
    });
    const path = d3.geoPath();

    let dataMin = Number.MAX_VALUE;
    let dataMax = Number.MIN_VALUE;
    this.data.forEach( d => {
      const val = +d.value;
      if (val < dataMin) {
        dataMin = val;
      }
      if (val > dataMax) {
        dataMax = val;
      }
    });

    const colorScale = d3.scaleLinear()
      .domain([dataMax, (dataMax / this.dataScaleColors.length / 2),  0])
      .range(this.dataScaleColors);
    /* legend */
    const colormap = svg.append('g')
    .attr('class', 'colormap-g');
    // .attr('transform', `scale(${scale})`);
    colormap.append('g')
      .attr('class', 'state-container')
      .selectAll('path')
      .data(topojson.feature(US_FEATURE_DATA, US_FEATURE_DATA.objects.states).features)
      .enter()
      .append('path')
        .attr('class', 'state')
        .attr('fill', (d) => {
          // pick color for state
          let color = this.noEntryColor;
          const val = stateValues.get(stateNames.get(+d.id)) || -1;
          if (val > 0) {
            color = colorScale(val);
          }
          return color;
        })
        .attr('d', path)
        .on('click', d => {
          this.stateClicked.emit(getStateData(d));
        })
        .on('mouseover', d => {
          this.stateHovered.emit(getStateData(d));
        })
        .on('mouseout', d => {
          this.stateMouseout.emit(getStateData(d));
        });
    // draw state outlines
    colormap.append('path')
      .datum(topojson.mesh(US_FEATURE_DATA, US_FEATURE_DATA.objects.states, (a, b) => a !== b ))
      .attr('class', 'state-paths')
      .attr('d', path);
    // bottom legend
    const key = svg
      .append('g')
      .attr('transform', `translate(5, ${scaledHeight})`)
      .attr('class', 'legend')
      .append('g');
    const legend = key.append('defs')
      .append('svg:linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '100%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '100%')
      .attr('spreadMethod', 'pad');

    legend.selectAll('stop')
        .data(colorScale.range())
        .enter()
        .append('stop')
        .attr('offset', (d, i) => i / (colorScale.range().length - 1) )
        .attr('stop-color', (d) => d);

    key.append('rect')
    .attr('width', width * .9)
    .attr('height', 25)
    .style('fill', 'url(#gradient)')
    .attr('transform', 'translate(0, 25)');

    const y = d3.scaleLinear()
      .range([0, width * .9])
      .domain([0, dataMax]);
    const yAxis = d3.axisBottom(y);
    key.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(0, 50)`)
      .call(yAxis);
    /* end legend */


    d3.select('.colormap-g').attr('transform', 'scale(' + width / resolution + ')');


  }

}
