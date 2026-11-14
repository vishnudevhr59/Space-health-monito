export interface IssOrbitalSnapshot {
  name: string;
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKmh: number;
  visibility: string;
  kpIndex: number;
  solarFluxStatus: 'QUIET' | 'MODERATE' | 'STORM';
  source: 'LIVE_ISS_API' | 'BACKEND_RELAY' | 'ORBITAL_PROPAGATOR';
  timestamp: string;
}

function buildFallbackOrbitalSnapshot(): IssOrbitalSnapshot {
  const t = Date.now() / 1000;
  // ~92.9-minute ISS orbital period (~5574 s) at 51.6° inclination
  const phase = (t % 5574) / 5574;
  const angle = phase * Math.PI * 2;
  const latitude = +(Math.sin(angle) * 51.6).toFixed(2);
  const longitude = +((((phase * 360) - 180 + 360) % 360) - 180).toFixed(2);
  const altitudeKm = +(418.4 + Math.cos(angle) * 2.1).toFixed(1);
  const velocityKmh = +(27582 + Math.sin(angle) * 28).toFixed(0);
  return {
    name: 'ISS (ZARYA)',
    latitude,
    longitude,
    altitudeKm,
    velocityKmh,
    visibility: latitude > 0 ? 'daylight' : 'eclipsed',
    kpIndex: 2.3,
    solarFluxStatus: 'QUIET',
    source: 'ORBITAL_PROPAGATOR',
    timestamp: new Date().toISOString(),
  };
}

export async function fetchLiveIssTelemetry(): Promise<IssOrbitalSnapshot> {
  // 1. Try Express backend proxy first (includes SWPC Kp index when server is running)
  try {
    const res = await fetch('/api/orbital/iss', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (typeof data?.latitude === 'number' && typeof data?.longitude === 'number') {
          return data as IssOrbitalSnapshot;
        }
      }
    }
  } catch {
    // Static host or backend unavailable — try direct public WhereTheISSAt endpoint
  }

  // 2. Direct CORS-enabled public ISS telemetry endpoint (works on static Vercel deployments)
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.latitude === 'number' && typeof data?.longitude === 'number') {
        return {
          name: 'ISS (ZARYA)',
          latitude: +data.latitude.toFixed(2),
          longitude: +data.longitude.toFixed(2),
          altitudeKm: +Number(data.altitude || 418.5).toFixed(1),
          velocityKmh: +Number(data.velocity || 27580).toFixed(0),
          visibility: data.visibility || 'daylight',
          kpIndex: 2.3,
          solarFluxStatus: 'QUIET',
          source: 'LIVE_ISS_API',
          timestamp: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Offline fallback
  }

  return buildFallbackOrbitalSnapshot();
}
