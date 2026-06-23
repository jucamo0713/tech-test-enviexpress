import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FlowbiteService {
  init(): void {
    void import('flowbite').then(({ initFlowbite }) => initFlowbite());
  }
}

