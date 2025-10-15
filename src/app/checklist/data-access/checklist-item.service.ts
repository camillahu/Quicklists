import {
  AddChecklistItem,
  ChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem
} from '../../shared/interfaces/checklist-item';
import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {map, merge, Subject, take} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RemoveChecklist} from '../../shared/interfaces/checklist';
import {StorageService} from '../../shared/data-access/storage.service';
import { connect } from 'ngxtension/connect';

export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})

export class ChecklistItemService {
  storageService = inject(StorageService)

  //state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
    error: null
  });

  //selectors
  checklistItems = computed(() => this.state().checklistItems);
  loaded = computed(() => this.state().loaded)

  //sources
  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();
  edit$ = new Subject<EditChecklistItem>();
  remove$ = new Subject<RemoveChecklistItem>();
  checklistRemoved$ = new Subject<RemoveChecklistItem>();
  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();

  constructor() {
    const nextState$ = merge(
      this.checklistItemsLoaded$.pipe(
        map((checklistItems) =>({
          checklistItems,
          loaded: true
        }))
      )
    );

    connect(this.state)
      .with(nextState$)
      .with(this.add$, (state, checklistItem) => ({
        checklistItems: [
          ...state.checklistItems,
          {
            ...checklistItem.item,
            id: Date.now().toString(),
            checklistId: checklistItem.checklistId,
            checked: false,
          },
        ],
      }))
      .with(this.edit$, (state, update) => ({
        checklistItems: state.checklistItems.map((item) =>
        item.id === update.id ? {...item, title: update.data.title } : item
        ),
      }))
      .with(this.toggle$, (state, checklistItemId) => ({
      checklistItems: state.checklistItems.map((item) =>
      item.id === checklistItemId
      ? {...item, checked: !item.checked }
      : item
      ),
    }))
      .with(this.reset$, (state, checklistId) => ({
        checklistItems: state.checklistItems.map((item) =>
        item.checklistId === checklistId ? { ...item, checked: false} : item
        ),
      }))
      .with(this.checklistRemoved$, (state, checklistId) => ({
        checklistItems: state.checklistItems.filter(
          (item) => item.checklistId !== checklistId
        ),
      }));

    // effects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems())
      }
    });
  }
}


