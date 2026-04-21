import { StoredCompoundInterestConfig } from '../models/compound-interest.models';

export abstract class CompoundInterestConfigRepository {
  abstract list(): StoredCompoundInterestConfig[];
  abstract saveAll(configs: StoredCompoundInterestConfig[]): void;
}
