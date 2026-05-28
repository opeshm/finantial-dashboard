export type AssetPreset = {
  label: string;
  symbol: string;
  type: string;
  region: string;
};

export const assetPresets: AssetPreset[] = [
  { label: 'MSCI World ETF - iShares Core MSCI World UCITS', symbol: 'IWDA.AS', type: 'ETF', region: 'Europa' },
  { label: 'MSCI World ETF - iShares MSCI World ETF', symbol: 'URTH', type: 'ETF', region: 'USA' },
  { label: 'S&P 500 Index', symbol: '^GSPC', type: 'Indice', region: 'USA' },
  { label: 'S&P 500 ETF - SPDR', symbol: 'SPY', type: 'ETF', region: 'USA' },
  { label: 'S&P 500 ETF - Vanguard', symbol: 'VOO', type: 'ETF', region: 'USA' },
  { label: 'Nasdaq 100 ETF - Invesco QQQ', symbol: 'QQQ', type: 'ETF', region: 'USA' },
  { label: 'Apple', symbol: 'AAPL', type: 'Accion', region: 'USA' },
  { label: 'Microsoft', symbol: 'MSFT', type: 'Accion', region: 'USA' },
];
