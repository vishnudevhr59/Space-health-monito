import { describe, it, expect } from 'vitest';
import {
  calculate_readiness,
  calculateEdgeReadinessScore,
  buildDtnTelemetryPacket,
} from '../utils/readinessScore';

describe('calculate_readiness — Axiom-4 / ISS Edge Mission Readiness Algorithm', () => {
  it('evaluates optimal orbital baseline telemetry as GREEN (90-100)', () => {
    const result = calculate_readiness({
      heartRate: 58,
      hrv: 68,
      sleepHours: 7.5,
      sleepEfficiency: 92,
      skinTempC: 36.6,
      baselineHrv: 65,
      baselineRhr: 58,
      baselineTempC: 36.6,
    });

    expect(result.status).toBe('GREEN');
    expect(result.readinessScore).toBe(98);
    expect(result.readinessFactors.hrv.status).toBe('Optimal');
    expect(result.readinessFactors.rhr.status).toBe('Optimal');
    expect(result.readinessFactors.sleep.status).toBe('Optimal');
    expect(result.readinessFactors.temp.status).toBe('Optimal');
    expect(result.whyExplanation).toContain('GREEN');
  });

  it('uses calibrated defaults when optional baseline values are omitted', () => {
    const result = calculateEdgeReadinessScore({
      heartRate: 58,
      hrv: 65,
      sleepHours: 7.5,
      sleepEfficiency: 88,
      skinTempC: 36.6,
    });

    expect(result.status).toBe('GREEN');
    expect(result.hrvRatio).toBe(1);
    expect(result.rhrDiff).toBe(0);
    expect(result.tempDiff).toBe(0);
    expect(result.readinessScore).toBe(97);
  });

  describe('Extreme HRV drops & boundary clamping', () => {
    it('handles an extreme HRV collapse to 0 ms without NaN and flags Depressed status', () => {
      const result = calculate_readiness({
        heartRate: 88,
        hrv: 0,
        sleepHours: 5.5,
        sleepEfficiency: 75,
        skinTempC: 37.1,
        baselineHrv: 65,
        baselineRhr: 58,
        baselineTempC: 36.6,
      });

      expect(result.hrvRatio).toBe(0);
      expect(result.hrvScore).toBe(0);
      expect(result.readinessFactors.hrv.weighted_points).toBe(0);
      expect(result.readinessFactors.hrv.status).toBe('Depressed');
      expect(result.readinessFactors.hrv.explanation).toContain('dropped 100%');
      expect(result.status).toBe('RED');
    });

    it('clamps negative HRV sensor artifacts safely to 0 ms', () => {
      const result = calculate_readiness({
        heartRate: 60,
        hrv: -18,
        sleepHours: 7.5,
        sleepEfficiency: 90,
        skinTempC: 36.6,
      });

      expect(result.hrvRatio).toBe(0);
      expect(result.hrvScore).toBe(0);
      expect(result.status).toBe('YELLOW');
      expect(result.whyExplanation).toContain('diminished autonomic HRV recovery');
    });

    it('categorizes mild HRV dip (0.85x - 0.99x) as Acceptable', () => {
      const result = calculate_readiness({
        heartRate: 58,
        hrv: 58, // 58/65 = 0.892x
        sleepHours: 7.5,
        sleepEfficiency: 90,
        skinTempC: 36.6,
        baselineHrv: 65,
      });

      expect(result.hrvRatio).toBeGreaterThanOrEqual(0.85);
      expect(result.hrvRatio).toBeLessThan(1.0);
      expect(result.readinessFactors.hrv.status).toBe('Acceptable');
    });

    it('caps HRV ratio at 1.15x and HRV factor score at 100 pts during high vagal rebound', () => {
      const result = calculate_readiness({
        heartRate: 50,
        hrv: 130, // 2.0x baseline
        sleepHours: 9.0,
        sleepEfficiency: 100,
        skinTempC: 36.6,
        baselineHrv: 65,
        baselineRhr: 58,
        baselineTempC: 36.6,
      });

      expect(result.hrvRatio).toBe(1.15);
      expect(result.hrvScore).toBe(100);
      expect(result.readinessScore).toBe(100);
    });

    it('protects against zero or negative baselineHrv without Infinity or division by zero', () => {
      const result = calculate_readiness({
        heartRate: 58,
        hrv: 40,
        sleepHours: 7.5,
        sleepEfficiency: 90,
        skinTempC: 36.6,
        baselineHrv: 0,
      });

      expect(Number.isFinite(result.readinessScore)).toBe(true);
      expect(result.hrvRatio).toBe(1.15);
      expect(result.hrvScore).toBe(100);
    });
  });

  describe('Sleep efficiency & duration fluctuations', () => {
    it('flags Sleep Debt when duration is low despite high efficiency', () => {
      const result = calculate_readiness({
        heartRate: 58,
        hrv: 65,
        sleepHours: 4.5, // 60% of 7.5h target
        sleepEfficiency: 90,
        skinTempC: 36.6,
      });

      expect(result.sleepScore).toBeCloseTo(54, 1);
      expect(result.readinessFactors.sleep.status).toBe('Sleep Debt');
      expect(result.readinessFactors.sleep.explanation).toContain('falls short');
    });

    it('flags Sleep Debt when sleep efficiency drops sharply on a full 8-hour window', () => {
      const result = calculate_readiness({
        heartRate: 64, // +6 bpm -> RHR score 76
        hrv: 62,       // ~0.95x
        sleepHours: 8.0, // capped at 1.0 duration factor
        sleepEfficiency: 42, // fragmented orbital rest
        skinTempC: 36.6,
      });

      expect(result.sleepScore).toBe(42);
      expect(result.readinessFactors.sleep.weighted_points).toBe(10.5);
      expect(result.status).toBe('YELLOW');
      expect(result.whyExplanation).toContain('resting heart rate elevation');
    });

    it('identifies sleep deficit as root cause in YELLOW justification when HRV & RHR are stable', () => {
      const result = calculate_readiness({
        heartRate: 58,
        hrv: 60, // 0.923x (>= 0.90)
        sleepHours: 4.0,
        sleepEfficiency: 50,
        skinTempC: 36.6,
      });

      expect(result.status).toBe('YELLOW');
      expect(result.whyExplanation).toContain('sleep deficit');
    });

    it('clamps extreme out-of-range sleep inputs (<0h / >100% / <0% efficiency)', () => {
      const zeroSleep = calculate_readiness({
        heartRate: 58,
        hrv: 65,
        sleepHours: -2,
        sleepEfficiency: -10,
        skinTempC: 36.6,
      });
      expect(zeroSleep.sleepScore).toBe(0);

      const maxSleep = calculate_readiness({
        heartRate: 58,
        hrv: 65,
        sleepHours: 12,
        sleepEfficiency: 145,
        skinTempC: 36.6,
      });
      expect(maxSleep.sleepScore).toBe(100);
    });
  });

  describe('RHR & skin temperature drift penalties', () => {
    it('classifies RHR Mild Elevation (1-4 bpm) vs Strained (>4 bpm) and clamps at 0', () => {
      const mild = calculate_readiness({
        heartRate: 61, // +3 bpm
        hrv: 65,
        sleepHours: 7.5,
        sleepEfficiency: 90,
        skinTempC: 36.6,
      });
      expect(mild.rhrScore).toBe(88);
      expect(mild.readinessFactors.rhr.status).toBe('Mild Elevation');

      const extreme = calculate_readiness({
        heartRate: 140, // +82 bpm -> clamped 0
        hrv: 65,
        sleepHours: 7.5,
        sleepEfficiency: 90,
        skinTempC: 36.6,
      });
      expect(extreme.rhrScore).toBe(0);
      expect(extreme.readinessFactors.rhr.status).toBe('Strained');
    });

    it('penalizes both thermal cooling and fever drift (>0.3°C) at 60 pts/°C and clamps at 0', () => {
      const mildWarm = calculate_readiness({
        heartRate: 58,
        hrv: 65,
        sleepHours: 7.5,
        sleepEfficiency: 90,
        skinTempC: 36.9, // exactly +0.3°C boundary
        baselineTempC: 36.6,
      });
      expect(mildWarm.tempDiff).toBeCloseTo(0.3, 2);
      expect(mildWarm.readinessFactors.temp.status).toBe('Optimal');

      const coldDrift = calculate_readiness({
        heartRate: 58,
        hrv: 65,
        sleepHours: 7.5,
        sleepEfficiency: 90,
        skinTempC: 35.4, // -1.2°C cooling deviation
        baselineTempC: 36.6,
      });
      expect(coldDrift.tempDiff).toBeCloseTo(1.2, 2);
      expect(coldDrift.tempScore).toBeCloseTo(28, 1);
      expect(coldDrift.readinessFactors.temp.status).toBe('Thermal Drift');

      const fever = calculate_readiness({
        heartRate: 78,
        hrv: 42,
        sleepHours: 5.0,
        sleepEfficiency: 68,
        skinTempC: 38.8, // +2.2°C drift
        baselineTempC: 36.6,
      });

      expect(fever.tempDiff).toBeCloseTo(2.2, 2);
      expect(fever.tempScore).toBe(0);
      expect(fever.readinessFactors.temp.status).toBe('Thermal Drift');
      expect(fever.readinessFactors.temp.explanation).toContain('Thermal deviation');
      expect(fever.status).toBe('RED');
      expect(fever.whyExplanation).toContain('RED');
    });
  });

  describe('Status threshold boundaries (GREEN >= 80, YELLOW >= 60, RED < 60)', () => {
    it('classifies exact 80.0 boundary as GREEN and just below 80 as YELLOW', () => {
      // HRV=100*0.35 (35) + RHR=100*0.25 (25) + Sleep=20*0.25 (5) + Temp=100*0.15 (15) = 80.0
      const atGreenBoundary = calculate_readiness({
        heartRate: 58,
        hrv: 65,
        sleepHours: 7.5,
        sleepEfficiency: 20,
        skinTempC: 36.6,
      });
      expect(atGreenBoundary.readinessScore).toBe(80);
      expect(atGreenBoundary.status).toBe('GREEN');

      const justBelowGreen = calculate_readiness({
        heartRate: 58,
        hrv: 65,
        sleepHours: 7.5,
        sleepEfficiency: 19,
        skinTempC: 36.6,
      });
      expect(justBelowGreen.readinessScore).toBe(79.8);
      expect(justBelowGreen.status).toBe('YELLOW');
    });

    it('classifies exact 60.0 boundary as YELLOW and just below 60 as RED', () => {
      // HRV=100*0.35 (35) + RHR=40*0.25 (10) + Sleep=0*0.25 (0) + Temp=100*0.15 (15) = 60.0
      const atYellowBoundary = calculate_readiness({
        heartRate: 73, // +15 bpm -> rhrScore = 40
        hrv: 65,
        sleepHours: 0,
        sleepEfficiency: 0,
        skinTempC: 36.6,
      });
      expect(atYellowBoundary.readinessScore).toBe(60);
      expect(atYellowBoundary.status).toBe('YELLOW');

      const justBelowYellow = calculate_readiness({
        heartRate: 74, // +16 bpm -> rhrScore = 36 -> 59.0
        hrv: 65,
        sleepHours: 0,
        sleepEfficiency: 0,
        skinTempC: 36.6,
      });
      expect(justBelowYellow.readinessScore).toBe(59);
      expect(justBelowYellow.status).toBe('RED');
    });

    it('enforces exact Optimal sleep cutoff (>=7.0h & >=85% efficiency)', () => {
      const optimalCutoff = calculate_readiness({
        heartRate: 58,
        hrv: 65,
        sleepHours: 7.0,
        sleepEfficiency: 85,
        skinTempC: 36.6,
      });
      expect(optimalCutoff.readinessFactors.sleep.status).toBe('Optimal');

      const belowHoursCutoff = calculate_readiness({
        heartRate: 58,
        hrv: 65,
        sleepHours: 6.9,
        sleepEfficiency: 95,
        skinTempC: 36.6,
      });
      expect(belowHoursCutoff.readinessFactors.sleep.status).toBe('Sleep Debt');
    });
  });

  describe('buildDtnTelemetryPacket — Store-and-Forward Bundle Serialization', () => {
    it('serializes crew context, telemetry, sync_status, and edge_ai_output cleanly', () => {
      const evaluation = calculate_readiness({
        heartRate: 58,
        hrv: 68,
        sleepHours: 7.5,
        sleepEfficiency: 92,
        skinTempC: 36.6,
      });

      const defaultPacket = buildDtnTelemetryPacket({
        astronautId: 'astro-1',
        crewName: 'CDR Sarah Chen',
        mission: 'Artemis Gateway Expedition 04',
        missionDay: 142,
        locationModule: 'GATEWAY_HALO_01',
        heartRate: 58,
        hrv: 68,
        spo2: 98.4,
        respirationRpm: 14,
        skinTempC: 36.6,
        bloodGlucoseMgDl: 94,
        sleepHours: 7.5,
        sleepEfficiency: 92,
        cabinCo2Ppm: 2100,
        evaluation,
      });

      expect(defaultPacket.sync_status).toBe('PENDING_DOWNLINK');
      expect(defaultPacket.edge_ai_output.readiness_score).toBe(98);
      expect(defaultPacket.edge_ai_output.alert_level).toBe('GREEN');
      expect(defaultPacket.biometrics.blood_glucose_mg_dl).toBe(94);

      const ackPacket = buildDtnTelemetryPacket({
        astronautId: 'astro-2',
        crewName: 'Gp Capt Shubhanshu Shukla',
        mission: 'Axiom-4',
        missionDay: 14,
        locationModule: 'ISS_HARMONY_NODE2',
        syncStatus: 'ACK_GROUND',
        heartRate: 54,
        hrv: 70,
        spo2: 99.0,
        respirationRpm: 13,
        skinTempC: 36.5,
        bloodGlucoseMgDl: 90,
        sleepHours: 7.4,
        sleepEfficiency: 91,
        cabinCo2Ppm: 1850,
        evaluation,
        timestamp: new Date('2026-11-14T08:30:00Z'),
      });

      expect(ackPacket.sync_status).toBe('ACK_GROUND');
      expect(ackPacket.packet_id).toBe('ax4-crew-astro-2-2026-11-14T083000Z');
    });
  });
});
