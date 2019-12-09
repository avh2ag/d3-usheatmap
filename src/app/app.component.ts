import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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

}
