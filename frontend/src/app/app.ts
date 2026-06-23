import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlowbiteService } from './core/utils';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly flowbite = inject(FlowbiteService);

  ngOnInit(): void {
    this.flowbite.init();
  }
}
