import {
  AddChecklistItem,
  ChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem
} from '../../shared/interfaces/checklist-item';
import {computed, inject, Injectable, signal} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RemoveChecklist} from '../../shared/interfaces/checklist';
import {StorageService} from '../../shared/data-access/storage.service';


export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
}

@Injectable({
  providedIn: 'root',
})

export class ChecklistItemService {
  storageService = inject(StorageService)

  //state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
  });

  //selectors
  checklistItems = computed(() => this.state().checklistItems);

  //sources
  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();
  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();

  constructor() {
    this.add$.pipe(takeUntilDestroyed()).subscribe((checklistItem) =>
      this.state.update((state) => ({
        ...state,
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
    );
    this.toggle$.pipe(takeUntilDestroyed()).subscribe((checklistItemId) =>
      this.state.update((state)=> ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
        item.id === checklistItemId
          ? {...item, checked: !item.checked}
          : item
        ),
      }))
    );
    this.reset$.pipe(takeUntilDestroyed()).subscribe((checklistId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
        item.checklistId === checklistId
          ? {...item, checked: false}
          : item
        ),
      }))
    );
    this.checklistItemsLoaded$.pipe(takeUntilDestroyed()).subscribe((checklistItems) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: [...state.checklistItems, this.add]
      }))
    )
  }
}


