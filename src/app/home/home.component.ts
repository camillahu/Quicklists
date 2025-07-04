import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {ModalComponent} from '../shared/ui/modal.component';
import {Checklist} from '../shared/interfaces/checklist';
import {FormBuilder} from '@angular/forms';
import {FormModalComponent} from '../shared/ui/form-modal.component';
import {ChecklistService} from '../shared/data-access/checklist.service';
import {ChecklistListComponent} from '../shared/ui/checklist-list.component';

@Component({
  selector: 'app-home',
  imports: [
    ModalComponent,
    FormModalComponent,
    ChecklistListComponent
  ],
  template: `
    <header>
      <h1>Quicklists</h1>
      <button (click)="checklistBeingEdited.set({})">Add checklist</button>
    </header>

    <section>
      <h2>Your checklists</h2>
      <app-checklist-list
        [checklists]="checklistService.checklists()"
        (delete)="checklistService.remove$.next($event)"
        (edit)="checklistBeingEdited.set($event)"
      />
    </section>

    <app-modal [isOpen]="!!checklistBeingEdited()">
      <ng-template>
        <app-form-modal
          [title]="checklistBeingEdited()?.title
          ? checklistBeingEdited()!.title!
          : 'Add Checklist'"
          [formGroup]="checklistForm"
          (close)="checklistBeingEdited.set(null)"
          (save)="
        checklistBeingEdited()?.id
        ? checklistService.edit$.next({
            id: checklistBeingEdited()!.id!,
            data: checklistForm.getRawValue()
        })
        : checklistService.add$.next(checklistForm.getRawValue())
        "/>
      </ng-template>
    </app-modal>
  `,
})

export default class HomeComponent {
  formBuilder = inject(FormBuilder)
  checklistService = inject(ChecklistService)

  checklistBeingEdited: WritableSignal<Partial<Checklist> | null> = signal<Partial<Checklist> | null>(null);

  checklistForm = this.formBuilder.nonNullable.group({
    title: [''],
  });

  constructor() {
    effect(() => {
      const checklist = this.checklistBeingEdited();

      if(!checklist) {
        this.checklistForm.reset();
      } else {
        this.checklistForm.patchValue({ //takes whatever value we supply to it and update form with them
          title: checklist.title,
        });
      }
    });
  }
}
