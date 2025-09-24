import { Component } from '@angular/core';

@Component({
  selector: 'app-environments',
  imports: [],
  templateUrl: './environment.html',
  styleUrl: './environment.css'
})
export class Environment {
  production = false;
  apiUrl = 'http://192.168.1.178:8080';

}
