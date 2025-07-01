import {Injectable, InjectionToken, PLATFORM_ID, inject} from '@angular/core';
import { of } from 'rxjs';
import {Checklist} from '../interfaces/checklist';
import {ChecklistItem} from '../interfaces/checklist-item';

export const LOCAL_STORAGE = new InjectionToken<Storage>(
  'window local storage object',
  {
    providedIn: 'root',
    //factory determines what will be injected when we run inject(LOCAL_STORAGE).
    //check if we are running in the browser,
    //if we are, use window.localStorage.
    //otherwise we can supply an alternate storage mechanism.
    //here we are providing a fake object to satisfy Storage type,
    //but in the future we might want to change it.
    factory: () => {
      return inject(PLATFORM_ID) === 'browser'
        ? window.localStorage
        : ({} as Storage);
    },
  }
);

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  storage = inject(LOCAL_STORAGE);

  loadChecklists() {
    const checklists = this.storage.getItem('checklists');
    return of( //converting data into observable stream
      checklists
        ? (JSON.parse(checklists) as Checklist[])
        : []
    );
  }

  loadChecklistItems() {
    const checklistItems = this.storage.getItem('checklistItems');
    return of( //converting data into observable stream
      checklistItems
        ? (JSON.parse(checklistItems) as ChecklistItem[])
        : []
    );
  }

  saveChecklists(checklists: Checklist[]) {
    this.storage.setItem('checklists', JSON.stringify(checklists));
  }

  saveChecklistItems(checklistItems: ChecklistItem[]) {
    this.storage.setItem('checklistItems', JSON.stringify(checklistItems));
  }
}
