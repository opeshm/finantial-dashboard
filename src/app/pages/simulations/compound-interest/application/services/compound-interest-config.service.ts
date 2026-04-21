import { Injectable } from '@angular/core';
import {
  CompoundInterestConfigData,
  CompoundInterestConfigExport,
  StoredCompoundInterestConfig,
} from '../../domain/models/compound-interest.models';
import { CompoundInterestConfigRepository } from '../../domain/repositories/compound-interest-config.repository';

export type SaveConfigurationResult =
  | { ok: true; config: StoredCompoundInterestConfig; configs: StoredCompoundInterestConfig[] }
  | { ok: false; message: string };

export type DeleteConfigurationResult = {
  deletedConfig?: StoredCompoundInterestConfig;
  configs: StoredCompoundInterestConfig[];
};

export type ImportConfigurationsResult =
  | { ok: true; importedCount: number; configs: StoredCompoundInterestConfig[] }
  | { ok: false; message: string };

@Injectable()
export class CompoundInterestConfigService {
  constructor(private readonly repository: CompoundInterestConfigRepository) {}

  listSavedConfigurations(): StoredCompoundInterestConfig[] {
    return this.repository.list();
  }

  saveConfiguration(name: string, data: CompoundInterestConfigData): SaveConfigurationResult {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return {
        ok: false,
        message: 'Introduce un nombre para guardar la configuracion.',
      };
    }

    const configs = this.repository.list();
    const nextId = this.getNextId(configs.map((item) => item.id));
    const newConfig: StoredCompoundInterestConfig = {
      id: nextId,
      name: trimmedName,
      savedAt: new Date().toISOString(),
      data,
    };

    const updatedConfigs = [newConfig, ...configs];
    this.repository.saveAll(updatedConfigs);

    return {
      ok: true,
      config: newConfig,
      configs: updatedConfigs,
    };
  }

  deleteConfiguration(id: number): DeleteConfigurationResult {
    const configs = this.repository.list();
    const deletedConfig = configs.find((item) => item.id === id);
    const updatedConfigs = configs.filter((item) => item.id !== id);

    this.repository.saveAll(updatedConfigs);

    return {
      deletedConfig,
      configs: updatedConfigs,
    };
  }

  importConfigurations(rawText: string): ImportConfigurationsResult {
    try {
      const parsed = JSON.parse(rawText) as Partial<CompoundInterestConfigExport> | Partial<StoredCompoundInterestConfig>;
      const importedConfigs = this.normalizeImportedConfigs(parsed);

      if (!importedConfigs.length) {
        return {
          ok: false,
          message: 'El archivo no contiene configuraciones validas.',
        };
      }

      const existingConfigs = this.repository.list();
      let nextId = this.getNextId(existingConfigs.map((item) => item.id));
      const usedNames = new Set(existingConfigs.map((item) => item.name.toLowerCase()));

      const preparedImports = importedConfigs.map((config) => {
        const uniqueName = this.makeImportedName(config.name, usedNames);
        usedNames.add(uniqueName.toLowerCase());

        return {
          ...config,
          id: nextId++,
          name: uniqueName,
        };
      });

      const mergedConfigs = [...preparedImports, ...existingConfigs];
      this.repository.saveAll(mergedConfigs);

      return {
        ok: true,
        importedCount: importedConfigs.length,
        configs: mergedConfigs,
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo importar el archivo JSON seleccionado.',
      };
    }
  }

  exportCurrentConfiguration(data: CompoundInterestConfigData): void {
    const payload: CompoundInterestConfigExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      configs: [
        {
          id: 1,
          name: `Configuracion actual ${new Date().toLocaleDateString('es-ES')}`,
          savedAt: new Date().toISOString(),
          data,
        },
      ],
    };

    this.downloadJson(payload, 'compound-interest-current.json');
  }

  exportSavedConfiguration(config: StoredCompoundInterestConfig): void {
    const payload: CompoundInterestConfigExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      configs: [config],
    };

    this.downloadJson(payload, `${this.slugify(config.name)}.json`);
  }

  exportAllSavedConfigurations(configs: StoredCompoundInterestConfig[]): boolean {
    if (!configs.length) {
      return false;
    }

    const payload: CompoundInterestConfigExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      configs,
    };

    this.downloadJson(payload, 'compound-interest-configs.json');
    return true;
  }

  private normalizeImportedConfigs(
    payload: Partial<CompoundInterestConfigExport> | Partial<StoredCompoundInterestConfig>,
  ): StoredCompoundInterestConfig[] {
    const configs = Array.isArray((payload as CompoundInterestConfigExport).configs)
      ? (payload as CompoundInterestConfigExport).configs
      : [payload as StoredCompoundInterestConfig];

    return configs
      .filter((item) => item && item.data)
      .map((item, index) => ({
        id: item.id ?? index + 1,
        name: item.name?.trim() || `Configuracion importada ${index + 1}`,
        savedAt: item.savedAt || new Date().toISOString(),
        data: item.data as CompoundInterestConfigData,
      }));
  }

  private makeImportedName(name: string, existingNames: Set<string>): string {
    if (!existingNames.has(name.toLowerCase())) {
      return name;
    }

    let index = 2;
    let candidate = `${name} (${index})`;

    while (existingNames.has(candidate.toLowerCase())) {
      index += 1;
      candidate = `${name} (${index})`;
    }

    return candidate;
  }

  private downloadJson(payload: CompoundInterestConfigExport, fileName: string): void {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private getNextId(ids: number[]): number {
    return ids.length ? Math.max(...ids) + 1 : 1;
  }
}
