import { Provider } from '@/lib/x402/types';
import { ProviderAdapter, ProviderExecutionResult } from '../ProviderAdapter';

const GEO_DATABASE: Record<string, { location: string; latitude: number; longitude: number }> = {
  nagpur: { location: "Nagpur, India", latitude: 21.1458, longitude: 79.0882 },
  mumbai: { location: "Mumbai, India", latitude: 19.0760, longitude: 72.8777 },
  delhi: { location: "New Delhi, India", latitude: 28.6139, longitude: 77.2090 },
  newyork: { location: "New York, USA", latitude: 40.7128, longitude: -74.0060 },
  london: { location: "London, UK", latitude: 51.5074, longitude: -0.1278 },
  tokyo: { location: "Tokyo, Japan", latitude: 35.6762, longitude: 139.6503 },
  paris: { location: "Paris, France", latitude: 48.8566, longitude: 2.3522 }
};

export class GeocodingAdapter implements ProviderAdapter {
  async execute(input: string, provider: Provider): Promise<ProviderExecutionResult> {
    const cleanQuery = input.toLowerCase().replace(/[^a-z]/g, '');
    
    let key = 'nagpur';
    for (const place of Object.keys(GEO_DATABASE)) {
      if (cleanQuery.includes(place)) {
        key = place;
        break;
      }
    }

    const match = GEO_DATABASE[key];
    const result = {
      location: match.location,
      latitude: match.latitude,
      longitude: match.longitude,
      confidence: 0.98,
      notice: "Simulated Provider Output (Geocoding API)"
    };

    return {
      success: true,
      providerId: provider.id,
      providerName: provider.name,
      category: 'Geocoding',
      result,
      latency: Math.floor(70 + Math.random() * 50),
      usage: {
        amount: 1,
        unit: 'query'
      },
      cost: provider.price,
      isSimulated: true
    };
  }
}
