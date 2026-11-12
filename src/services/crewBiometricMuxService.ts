/**
 * SPACE HEALTH MONITO - Real-Time Multi-Astronaut Biometric MUX Engine
 * Multiplexed 1Hz telemetry streaming across flight crew members:
 * - CDR Sarah Chen, Ph.D. (Commander / Systems Specialist)
 * - PLT Marcus Vance, USSF (Pilot / ECLSS Lead)
 * - MS Dr. Elena Rostova, MD (Mission Specialist / Chief Medical Officer)
 *
 * Implements independent, concurrent 1Hz telemetry streams, individual
 * microgravity adaptation rates, cardiorespiratory drift, and cross-crew comparison metrics.
 */

import { AstronautProfile, HealthMeasurement } from '../types';
import { telemetryStreamEngine, TelemetryFrame } from './telemetryStreamEngine';

export interface CrewMemberMuxState {
  profile: AstronautProfile;
  currentFrame: TelemetryFrame;
  cardiorespiratoryDriftBpm: number;
  projectedBmdLossPercentPerMonth: number;
  circadianPhaseShiftHours: number;
  cumulativeRadiationMSv: number;
  trishResilienceIndex: number; // 0-100
  activeStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL';
}

export type CrewMuxSubscriber = (crewState: Record<string, CrewMemberMuxState>) => void;

// Crew profiles
export const CREW_MEMBERS: Record<string, AstronautProfile> = {
  'astro-1': {
    id: 'astro-1',
    userId: 'usr-1',
    name: 'Sarah Chen',
    callsign: 'Nova',
    mission: 'Artemis Gateway Expedition 04',
    destination: 'Lunar Orbital Gateway',
    missionDay: 142,
    totalDaysInSpace: 326,
    bloodType: 'O-Positive',
    age: 38,
    heightCm: 172,
    weightKg: 64.5,
    baselineVitals: {
      restingHeartRate: 58,
      systolicBP: 114,
      diastolicBP: 72,
      spo2: 98.4,
      bodyTempC: 36.6,
      hrvMs: 65,
    },
    radiationCumulativeMSv: 78.4,
    radiationMissionLimitMSv: 250.0,
    boneDensityLossRatePercentPerMonth: 0.85,
    currentStatus: 'Nominal',
  },
  'astro-2': {
    id: 'astro-2',
    userId: 'usr-2',
    name: 'Marcus Vance',
    callsign: 'Atlas',
    mission: 'Artemis Gateway Expedition 04',
    destination: 'Lunar Orbital Gateway',
    missionDay: 142,
    totalDaysInSpace: 184,
    bloodType: 'A-Positive',
    age: 42,
    heightCm: 185,
    weightKg: 82.0,
    baselineVitals: {
      restingHeartRate: 52,
      systolicBP: 118,
      diastolicBP: 76,
      spo2: 98.8,
      bodyTempC: 36.5,
      hrvMs: 72,
    },
    radiationCumulativeMSv: 62.1,
    radiationMissionLimitMSv: 250.0,
    boneDensityLossRatePercentPerMonth: 0.92,
    currentStatus: 'Nominal',
  },
  'astro-3': {
    id: 'astro-3',
    userId: 'usr-3',
    name: 'Elena Rostova',
    callsign: 'Phoenix',
    mission: 'Artemis Gateway Expedition 04',
    destination: 'Lunar Orbital Gateway',
    missionDay: 142,
    totalDaysInSpace: 215,
    bloodType: 'B-Positive',
    age: 36,
    heightCm: 168,
    weightKg: 58.2,
    baselineVitals: {
      restingHeartRate: 62,
      systolicBP: 110,
      diastolicBP: 68,
      spo2: 98.2,
      bodyTempC: 36.7,
      hrvMs: 58,
    },
    radiationCumulativeMSv: 71.9,
    radiationMissionLimitMSv: 250.0,
    boneDensityLossRatePercentPerMonth: 0.79,
    currentStatus: 'Nominal',
  },
};

class CrewBiometricMuxService {
  private activeAstronautId: string = 'astro-1';
  private subscribers: Set<CrewMuxSubscriber> = new Set();
  private timerId: any = null;
  private tickCount: number = 0;

  // Individual crew telemetry states
  private crewState: Record<string, CrewMemberMuxState> = {};

  constructor() {
    // Initialize default states
    Object.keys(CREW_MEMBERS).forEach((id) => {
      const p = CREW_MEMBERS[id];
      this.crewState[id] = {
        profile: p,
        currentFrame: {
          timestamp: new Date().toISOString(),
          heartRate: p.baselineVitals.restingHeartRate + 2,
          spo2: p.baselineVitals.spo2,
          bodyTemperature: p.baselineVitals.bodyTempC,
          systolicBP: p.baselineVitals.systolicBP,
          diastolicBP: p.baselineVitals.diastolicBP,
          hrv: p.baselineVitals.hrvMs,
          respiratoryRate: 14,
          cabinPressurePsi: 14.7,
          cabinCo2MmHg: 2.2,
          vestibularConflictScore: 1.2,
          eclssOgaPercent: 21.0,
          trishRecoveryScore: 88,
          severity: 'NOMINAL',
          anomalyName: 'Nominal Operations',
        },
        cardiorespiratoryDriftBpm: 3.2,
        projectedBmdLossPercentPerMonth: p.boneDensityLossRatePercentPerMonth,
        circadianPhaseShiftHours: id === 'astro-2' ? 0.4 : id === 'astro-3' ? -0.2 : 0.1,
        cumulativeRadiationMSv: p.radiationCumulativeMSv,
        trishResilienceIndex: 91,
        activeStatus: 'NOMINAL',
      };
    });

    // Subscribe to global telemetryStreamEngine for active astronaut sync
    telemetryStreamEngine.subscribe((frame) => {
      this.handleGlobalFrame(frame);
    });

    this.startMuxLoop();
  }

  public getActiveAstronautId(): string {
    return this.activeAstronautId;
  }

  public setActiveAstronautId(id: string) {
    if (CREW_MEMBERS[id]) {
      this.activeAstronautId = id;
      this.notify();
    }
  }

  public getActiveProfile(): AstronautProfile {
    return CREW_MEMBERS[this.activeAstronautId] || CREW_MEMBERS['astro-1'];
  }

  public getAllCrewProfiles(): AstronautProfile[] {
    return Object.values(CREW_MEMBERS);
  }

  public getCrewMuxState(): Record<string, CrewMemberMuxState> {
    return { ...this.crewState };
  }

  public subscribe(callback: CrewMuxSubscriber): () => void {
    this.subscribers.add(callback);
    callback({ ...this.crewState });
    return () => this.subscribers.delete(callback);
  }

  private startMuxLoop() {
    if (this.timerId) return;
    this.timerId = setInterval(() => {
      this.muxTick();
    }, 1000);
  }

  private handleGlobalFrame(frame: TelemetryFrame) {
    // Primary active astronaut updates from the engine directly
    const currentId = this.activeAstronautId;
    if (this.crewState[currentId]) {
      this.crewState[currentId].currentFrame = { ...frame };
      this.crewState[currentId].activeStatus = frame.severity;
      this.crewState[currentId].cardiorespiratoryDriftBpm = +(
        frame.heartRate - this.crewState[currentId].profile.baselineVitals.restingHeartRate
      ).toFixed(1);
    }
    this.notify();
  }

  /**
   * Concurrently updates secondary astronauts with distinct physiological variance
   * and correlated reactions to shared cabin environment (Pressure, CO2)
   */
  private muxTick() {
    this.tickCount++;
    const t = this.tickCount;
    const activeFrame = this.crewState[this.activeAstronautId]?.currentFrame;

    Object.keys(this.crewState).forEach((id) => {
      if (id === this.activeAstronautId) return; // Active is driven by engine

      const member = this.crewState[id];
      const baseline = member.profile.baselineVitals;

      // Environmental sharing: Cabin pressure and CO2 are identical across habitat modules
      const cabinPress = activeFrame?.cabinPressurePsi ?? 14.7;
      const cabinCo2 = activeFrame?.cabinCo2MmHg ?? 2.2;

      // Physiological reaction functions tailored to member baseline
      // Marcus Vance (athletic, lower HR, higher tolerance to CO2)
      // Elena Rostova (higher baseline HR, sensitive to hypoxia)
      const isHypobaric = cabinPress < 12.0;
      const isHypercapnic = cabinCo2 > 3.0;

      let hrDelta = Math.sin(t * 0.3 + (id === 'astro-2' ? 1 : 2)) * 0.7;
      let spo2Val = baseline.spo2 - (Math.cos(t * 0.2) * 0.2);
      let vestScore = 1.0 + Math.sin(t * 0.1) * 0.3;

      if (isHypobaric) {
        // Hypobaric hypoxia compensatory tachycardia
        const hypoxiaSeverity = (14.7 - cabinPress) / 5.0;
        hrDelta += hypoxiaSeverity * (id === 'astro-2' ? 22 : 28);
        spo2Val = Math.max(86, baseline.spo2 - (hypoxiaSeverity * 14));
      }

      if (isHypercapnic) {
        // Carbon dioxide headache & tachypnea
        hrDelta += (cabinCo2 - 2.0) * 4;
        vestScore += (cabinCo2 - 2.0) * 1.2;
      }

      const nextHr = Math.round(baseline.restingHeartRate + hrDelta);
      const nextSpo2 = +spo2Val.toFixed(1);
      const nextSys = Math.round(baseline.systolicBP + (isHypobaric ? 12 : 0) + Math.sin(t * 0.1) * 2);
      const nextDia = Math.round(baseline.diastolicBP + (isHypobaric ? 6 : 0));
      const nextHrv = Math.max(25, Math.round(baseline.hrvMs - (isHypobaric ? 25 : 0)));

      let sev: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
      if (nextHr > 120 || nextSpo2 < 90 || cabinPress < 12.0) {
        sev = 'CRITICAL';
      } else if (nextHr > 95 || nextSpo2 < 95 || cabinCo2 > 3.5) {
        sev = 'WARNING';
      }

      member.currentFrame = {
        timestamp: new Date().toISOString(),
        heartRate: nextHr,
        spo2: nextSpo2,
        bodyTemperature: baseline.bodyTempC + (Math.sin(t * 0.05) * 0.02),
        systolicBP: nextSys,
        diastolicBP: nextDia,
        hrv: nextHrv,
        respiratoryRate: isHypobaric ? 22 : 14,
        cabinPressurePsi: cabinPress,
        cabinCo2MmHg: cabinCo2,
        vestibularConflictScore: +vestScore.toFixed(1),
        eclssOgaPercent: 21.0,
        trishRecoveryScore: sev === 'NOMINAL' ? 90 : 64,
        severity: sev,
        anomalyName: activeFrame?.anomalyName || 'Nominal Operations',
      };

      member.cardiorespiratoryDriftBpm = +(nextHr - baseline.restingHeartRate).toFixed(1);
      member.activeStatus = sev;
    });

    this.notify();
  }

  private notify() {
    this.subscribers.forEach((sub) => sub({ ...this.crewState }));
  }
}

export const crewBiometricMuxService = new CrewBiometricMuxService();
