import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AssetPreset, ContributionBlock, SimulationResult } from '../domain/dca-historical.models';

type AssetsResponse = {
  presets: AssetPreset[];
};

type ApiError = {
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class DcaHistoricalApiService {
  constructor(private readonly http: HttpClient) {}

  fetchAssets(): Observable<AssetPreset[]> {
    return this.http.get<AssetsResponse>('/api/assets').pipe(
      map((response) => response.presets),
      catchError((error) => this.toErrorMessage(error, 'No se pudo cargar la lista de activos.')),
    );
  }

  runSimulation(payload: {
    symbol: string;
    startDate: string;
    endDate: string;
    contributionBlocks: ContributionBlock[];
  }): Observable<SimulationResult> {
    return this.http
      .post<SimulationResult>('/api/simulate', payload)
      .pipe(catchError((error) => this.toErrorMessage(error, 'No se pudo ejecutar la simulacion.')));
  }

  private toErrorMessage(error: unknown, fallback: string): Observable<never> {
    const apiError = error as { error?: ApiError };
    return throwError(() => new Error(apiError.error?.error ?? fallback));
  }
}
