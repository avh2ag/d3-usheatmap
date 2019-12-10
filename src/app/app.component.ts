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
      name: 'Florida',
      value: '2'
    },

    {
      name: 'Oregon',
      value: '0'
    },
    {
      name: 'Tennessee',
      value: '9'
    },
    {
      name: 'Texas',
      value: 43
    }
  ]);

  tooltipHTMLFn(stateName: string, value: string) {
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
