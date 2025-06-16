import {Component, input} from '@angular/core';
import {Checklist} from '../interfaces/checklist';
import {KeyValuePipe} from '@angular/common';

@Component({
  selector: "home-checklist-list",
  template: `
    @for (checklist of checklists() | keyvalue; track checklist.id) {

    }
  `,
  imports: [
    KeyValuePipe
  ]
})

export class ChecklistListComponent {
  checklists = input.required<Checklist[]>;
}
