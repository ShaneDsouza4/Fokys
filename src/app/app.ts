import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Popup } from './popup/popup';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Popup],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'fokys';
}
