import { Component } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'us-colormap';
  data = of([
    {
      code: 'FL',
      name: 'Florida',
      value: 3
    },

    {
      code: 'OR',
      name: 'Oregon',
      value: '53'
    },
    {
      code: 'TN',
      name: 'Tennessee',
      value: '9'
    },
    {
      code: 'TX',
      name: 'Texas',
      value: 43
    },
    {
      code: 'CA',
      name: 'California',
      value: 1
    }
  ]);

  tooltipHTMLFn(stateName: string, value) {
    if (value === undefined) {
      value = 'N/A';
    }
    return `
      <table>
        <tr>
          <th>State</th>
          <th>Random Count</th>
        </tr>
        <tr>
          <td>${stateName}</td>
          <td>${value}</td>
        </tr>

      </table>
    `;
  }

}
