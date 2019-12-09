import { Component, OnInit, Input, AfterViewInit, HostListener, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { stateCodes } from './map-info/states';
import { US_FEATURE_DATA } from './map-info/us-10m.v1';

@Component({
  selector: 'ng-d3-us-colormap',
  template: `
    <div #chartContainer [id]='chartId'>
    </div>
  `,
  styles: []
})
export class NgD3UsColormapComponent implements OnInit, AfterViewInit {
  @Input() chartId = 'united-states';
  @Input() data = [];
  @Input() lowColor = '#c9c9c9';
  @Input() highColor = '#1976d2';

  @ViewChild('chartContainer', {static: false}) chartContainer;
  constructor() { }

  ngOnInit() {}
  ngAfterViewInit() {
    this.drawMap();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.drawMap();
    }, 50);
  }

  drawMap() {
    const containerSelector = `#${this.chartId}`;
    d3.select(`${containerSelector} svg`).remove();
    let svg = d3.select(containerSelector)
                  .append('svg')
                  .attr('width', '100%')
                  .attr('height', '100%');
    const scale = window.innerWidth / 1000 * .9; // 1000 for the 1K resolution we're using
    svg = svg.append('g')
      .attr('class', 'heatmap-g')
      .attr('transform', `scale(${scale})`);

    const stateValues = d3.map();
    this.data.forEach( d => {
      stateValues.set(d.name, +d.value);
    });
    const legendText = 'Legend'; // make this config upcoming

    const stateNames = d3.map();
    stateCodes.forEach((d) => {
      stateNames.set(d.id, d.name);
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

    const colorScheme: Array<any> = d3.schemeBlues[9];
    const rangeEnd = colorScheme.length;
    const colorScale = d3.scaleLinear().domain([0, dataMax]).range([this.lowColor, this.highColor]);
    /* legend */
    const legendWidth = 60;
    const legendHeight = 500;
    const key = svg
      .append('g')
      .attr('width', legendWidth)
      .attr('x', 0)
      .attr('height', legendHeight)
      .attr('class', 'legend');
    const legend = key.append('defs')
      .append('svg:linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '100%')
      .attr('y1', '0%')
      .attr('x2', '100%')
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
    .attr('width', 25)
    .attr('height', legendHeight)
    .style('fill', 'url(#gradient)')
    .attr('transform', 'translate(0,10)');

    const y = d3.scaleLinear()
      .range([legendHeight, 0])
      .domain([0, dataMax]);

    const yAxis = d3.axisRight(y);

    key.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(0,10)')
      .call(yAxis);
    /* end legend */

    svg.append('g')
      .attr('class', 'state-container')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .selectAll('path')
      .data(topojson.feature(US_FEATURE_DATA, US_FEATURE_DATA.objects.states).features)
      .enter()
      .append('path')
        .attr('fill', (d) => {
          // pick color for state
          d.rate = stateValues.get(stateNames.get(d.id)) || 0;
          const col =  colorScale(d.rate);
          return col ? col : this.lowColor;
        })
        .attr('d', path)
      .append('title')
        .text(d => {
          const stateName = stateNames.get(d.id);
          const val = stateValues.get(stateName);
          const valueText = val ? val : 'N/A';
          return `${stateName}: ${valueText}`;
        });
    // draw state outlines
    svg.append('path')
    .attr('transform', `translate(${legendWidth}, 0)`)
      .datum(topojson.mesh(US_FEATURE_DATA, US_FEATURE_DATA.objects.states, (a, b) => a !== b ))
      .attr('class', 'states')
      .attr('d', path);

  }

}
