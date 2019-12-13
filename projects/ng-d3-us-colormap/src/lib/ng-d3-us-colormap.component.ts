import { Component, OnInit, Input, AfterViewInit, HostListener, ViewChild, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { stateCodes } from './map-info/states';
import { US_FEATURE_DATA } from './map-info/us-10m.v1';

@Component({
  selector: 'ng-d3-us-colormap',
  template: `
    <div #chartContainer [id]='chartId' [style.height]="height" [style.width]="width">
      <div class="colormap-tooltip"></div>
    </div>
  `,
  styles: []
})
export class NgD3UsColormapComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() chartId = 'united-states';
  @Input() data = [];
  @Input() lowColor = '#c9c9c9';
  @Input() highColor = '#1976d2';
  @Input() scaleFactor = .9;
  @Input() height = '100%';
  @Input() width = '100%';
  @Input() tooltipTextFn: (stateName: string, value: string ) => string;
  @Input() isUseStateCode = true;
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
    this.checkForChange(changes, 'lowColor', this.drawMap);
    this.checkForChange(changes, 'highColor', this.drawMap);
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

  private getTooltipHTML(stateName: string, value: string) {
    return this.tooltipTextFn ? this.tooltipTextFn(stateName, value) : `${stateName}: ${value}`;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.drawMap();
    }, 100);
  }

  drawMap = () => {
    d3.select(`${this.containerSelector} svg`).remove();
    let svg = d3.select(this.containerSelector)
                  .append('svg')
                  .attr('width', this.width)
                  .attr('height', this.height);

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

    const bounds = this.chartContainer.nativeElement.getBoundingClientRect();
    const width = bounds.width ? bounds.width : window.innerWidth;
    const height = bounds.height ? bounds.height : window.innerHeight;
    const constraintSize = Math.min(width, height);
    const resolution = 1000;
    const scale = constraintSize / resolution * this.scaleFactor;
    const colorScale = d3.scaleLinear().domain([0, dataMax]).range([this.lowColor, this.highColor]);
    /* legend */
    const colormap = svg.append('g')
    .attr('class', 'colormap-g')
    .attr('transform', `scale(${scale})`);
    colormap.append('g')
      .attr('class', 'state-container')
      .selectAll('path')
      .data(topojson.feature(US_FEATURE_DATA, US_FEATURE_DATA.objects.states).features)
      .enter()
      .append('path')
        .attr('class', 'state')
        .attr('fill', (d) => {
          // pick color for state
          const val = stateValues.get(stateNames.get(+d.id)) || 0;
          const col =  colorScale(val);
          return col ? col : this.lowColor;
        })
        .attr('d', path)
        .on('mouseover', d => {
          d3.select(`#${this.chartId} .colormap-tooltip`)
            .html(() => {
              const stateName = stateNames.get(+d.id);
              const val = stateValues.get(stateName);
              const valueText = val ? val : 'N/A';
              return this.getTooltipHTML(stateName, valueText);
            })
            .transition()
            .duration(200)
            .style('left', `${d3.event.pageX}px`)
            .style('top', `${d3.event.pageY}px`)
            .style('opacity', 1);
        })
        .on('mouseout', d => {
          d3.select(`#${this.chartId} .colormap-tooltip`)
            .html('')
            .transition()
            .duration(200)
            .style('left', `0px`)
            .style('top', `0px`)
            .style('opacity', 0);
        });
    // draw state outlines
    colormap.append('path')
      .datum(topojson.mesh(US_FEATURE_DATA, US_FEATURE_DATA.objects.states, (a, b) => a !== b ))
      .attr('class', 'state-paths')
      .attr('d', path);
    // bottom legend
    const key = svg
      .append('g')
      .attr('transform', `translate(10, ${height * scale * .8})`)
      .attr('class', 'legend');
    const legend = key.append('defs')
      .append('svg:linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '100%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '100%')
      .attr('spreadMethod', 'pad');

    legend.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.highColor)
      .attr('stop-opacity', 1);

    legend.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', this.lowColor)
      .attr('stop-opacity', 1);

    key.append('rect')
    .attr('width', width * scale)
    .attr('height', 25)
    .style('fill', 'url(#gradient)')
    .attr('transform', 'translate(10, 25)');

    const y = d3.scaleLinear()
      .range([0, width * scale])
      .domain([0, dataMax]);
    const yAxis = d3.axisBottom(y);
    key.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(10, 50)`)
      .call(yAxis);
    /* end legend */

  }

}
