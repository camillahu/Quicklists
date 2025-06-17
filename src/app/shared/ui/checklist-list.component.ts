import {Component, input} from '@angular/core';
import {Checklist} from '../interfaces/checklist';
import {KeyValuePipe} from '@angular/common';

@Component({
  selector: "app-checklist-list",
  template: `
    <ul>
      @for (checklist of checklists(); track checklist.id) {
        <li>
            {{checklist.title}}
        </li>
      } @empty {
        <p>Click the add button to create your first checklist!</p>
      }
    </ul>

  `,
})

export class ChecklistListComponent {
  checklists = input.required<Checklist[]>();
}
