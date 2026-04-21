import { Injectable } from '@angular/core';
import { CompoundInterestConfigRepository } from '../../domain/repositories/compound-interest-config.repository';
import { StoredCompoundInterestConfig } from '../../domain/models/compound-interest.models';

@Injectable({ providedIn: 'root' })
export class LocalStorageCompoundInterestConfigRepository implements CompoundInterestConfigRepository {
  private readonly storageKey = 'compound-interest-configs';

  list(): StoredCompoundInterestConfig[] {
    try {
      const rawValue = globalThis.localStorage?.getItem(this.storageKey);

      if (!rawValue) {
        return [];
      }

      const parsed = JSON.parse(rawValue) as StoredCompoundInterestConfig[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveAll(configs: StoredCompoundInterestConfig[]): void {
    globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(configs));
  }
}
