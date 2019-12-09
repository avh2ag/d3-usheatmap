import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { stateCodes, StateCode } from './lib/states';
import {default as US_FEATURE_DATA} from './lib/us-10m.v1.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'us-heatmap';
  data: Array<{ name: string, value: any }> = [
    {
      name: 'Florida',
      value: '2'
    },
    {
      name: 'New Mexico',
      value: '3'
    },
    {
      name: 'Arkansas',
      value: '2'
    },
    {
      name: 'Oregon',
      value: '0'
    },
    {
      name: 'Tennessee',
      value: '9'
    }
  ];

  ngAfterViewInit() {
    this.drawMap();
  }

  drawMap() {
    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const stateValues = d3.map();
    this.data.forEach( d => {
      stateValues.set(d.name, +d.value);
    });
    const legendText = 'Legend'; // make this config upcoming

    const stateNames = d3.map();
    const path = d3.geoPath();

    const g = svg.append('g')
        .attr('class', 'key')
        .attr('transform', 'translate(0,40)');
    /* begin legend */
    const x = d3.scaleLinear()
      .domain([1, 15])
      .rangeRound([600, 860]);
    const colorScheme: Array<any> = d3.schemeBlues[9];
    const rangeEnd = colorScheme.length;
    const colorScale = d3.scaleThreshold()
      .domain(d3.range(0, rangeEnd))
      .range(colorScheme);

    g.selectAll('rect')
      .data(colorScale.range().map( (d) => {
          d = colorScale.invertExtent(d);
          if (d[0] == null) { d[0] = x.domain()[0]; }
          if (d[1] == null) { d[1] = x.domain()[1]; }
          return d;
        }))
      .enter().append('rect')
        .attr('height', 8)
        .attr('x', (d) =>  x(d[0]) )
        .attr('width', (d) => x(d[1]) - x(d[0]) )
        .attr('fill', (d) => colorScale(d[0]) );

    g.append('text')
        .attr('class', 'caption')
        .attr('x', x.range()[0])
        .attr('y', -6)
        .attr('fill', '#000')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text(legendText);
    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat( (x, i) =>  i ? x : x )
        .tickValues(colorScale.domain()))
      .select('.domain')
        .remove();
    /* end legend */
    stateCodes.forEach((d: StateCode) => {
      stateNames.set(d.id, d.name);
    });
    svg.append('g')
      .attr('class', 'state-container')
      .selectAll('path')
      .data(topojson.feature(US_FEATURE_DATA, US_FEATURE_DATA.objects.states).features)
      .enter()
      .append('path')
        .attr('fill', (d) => {
          // pick color for state
          d.rate = stateValues.get(stateNames.get(d.id)) || 0;
          const col =  colorScale(d.rate);
          return col ? col : '#fff';
        })
        .attr('d', path)
      .append('title')
        .text(d => {
          const stateName = stateNames.get(d.id);
          const val = stateValues.get(stateName);
          const valueText = val ? val : 'N/A';
          return `${stateName}: ${stateValues.get(valueText)}`;
        });
    // draw state outlines
    svg.append('path')
      .datum(topojson.mesh(US_FEATURE_DATA, US_FEATURE_DATA.objects.states, (a, b) => a !== b ))
      .attr('class', 'states')
      .attr('d', path);

  }

}
