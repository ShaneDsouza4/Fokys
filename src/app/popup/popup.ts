import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-popup',
  imports: [CommonModule, Navbar],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup implements OnInit {

  constructor() { }


  ngOnInit() {

  }





}
