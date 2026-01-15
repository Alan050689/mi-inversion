import type { FxRates } from "@shared/schema";

interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

let cachedRates: FxRates | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const FALLBACK_RATES: FxRates = {
  blue: 1200,
  oficial: 1000,
  mep: 1150,
  ccl: 1180,
  tarjeta: 1400,
  mayorista: 980,
  timestamp: new Date().toISOString(),
};

export async function getFxRates(): Promise<FxRates> {
  const now = Date.now();
  if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const response = await fetch('https://dolarapi.com/v1/dolares', {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data: DolarApiResponse[] = await response.json();
    
    const findRate = (casa: string): number => {
      const item = data.find((d) => d.casa === casa);
      return item?.venta || item?.compra || 0;
    };

    cachedRates = {
      blue: findRate('blue') || FALLBACK_RATES.blue,
      oficial: findRate('oficial') || FALLBACK_RATES.oficial,
      mep: findRate('bolsa') || FALLBACK_RATES.mep,
      ccl: findRate('contadoconliqui') || FALLBACK_RATES.ccl,
      tarjeta: findRate('tarjeta') || FALLBACK_RATES.tarjeta,
      mayorista: findRate('mayorista') || FALLBACK_RATES.mayorista,
      timestamp: new Date().toISOString(),
    };
    cacheTimestamp = now;

    return cachedRates;
  } catch (error) {
    console.error('Error fetching FX rates:', error);
    
    if (cachedRates) {
      return cachedRates;
    }

    return {
      ...FALLBACK_RATES,
      timestamp: new Date().toISOString(),
    };
  }
}
