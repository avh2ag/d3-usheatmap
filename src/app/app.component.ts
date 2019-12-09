import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import * as STATE_CODES from './lib/states.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'us-heatmap';
  ngAfterViewInit() {
    this.drawMap();
  }

  drawMap() {
    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const unemployment = d3.map();
    const stateNames = d3.map();

    const path = d3.geoPath();

    const x = d3.scaleLinear()
        .domain([1, 10])
        .rangeRound([600, 860]);

    const color = d3.scaleThreshold()
        .domain(d3.range(0, 10))
        .range(d3.schemeBlues[9]);

    const g = svg.append('g')
        .attr('class', 'key')
        .attr('transform', 'translate(0,40)');
    /* begin legend */
    g.selectAll('rect')
      .data(color.range().map(function(d) {
          d = color.invertExtent(d);
          if (d[0] == null) { d[0] = x.domain()[0]; }
          if (d[1] == null) { d[1] = x.domain()[1]; }
          return d;
        }))
      .enter().append('rect')
        .attr('height', 8)
        .attr('x', function(d) { return x(d[0]); })
        .attr('width', function(d) { return x(d[1]) - x(d[0]); })
        .attr('fill', function(d) { return color(d[0]); });

    g.append('text')
        .attr('class', 'caption')
        .attr('x', x.range()[0])
        .attr('y', -6)
        .attr('fill', '#000')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('Unemployment rate');
    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(function(x, i) { return i ? x : x + '%'; })
        .tickValues(color.domain()))
      .select('.domain')
        .remove();
    /* end legend */
    const promises = [
      d3.json('https://d3js.org/us-10m.v1.json'),
      d3.tsv('assets/us-state-names.tsv', function(d) {
        stateNames.set(d.id, d.name);
        console.log(stateNames);
      }),
      d3.tsv('assets/map.tsv', function(d) {
        unemployment.set(d.name, +d.value);
      })
    ];
    Promise.all(promises).then(ready);

    function ready([us]) {
      svg.append('g')
          .attr('class', 'counties')
        .selectAll('path')
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append('path')
          .attr('fill', function(d) {
              const sn = stateNames.get(d.id);
              d.rate = unemployment.get(stateNames.get(d.id)) || 0;
              const col =  color(d.rate);
              if (col) {
                return col;
              } else {
                return '#ffffff';
              }
          })
          .attr('d', path)
        .append('title')
          .text(function(d) {
              return d.rate + '%'; });

      svg.append('path')
          .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
          .attr('class', 'states')
          .attr('d', path);
    }
  }

}
