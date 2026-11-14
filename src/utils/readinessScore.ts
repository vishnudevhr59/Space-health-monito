export interface ReadinessInput {
  heartRate: number;
  hrv: number;
  sleepHours: number;
  sleepEfficiency: number;
  skinTempC: number;
  baselineHrv?: number;
  baselineRhr?: number;
  baselineTempC?: number;
}

export type ReadinessAlertLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface ReadinessFactorDetail {
  name: string;
  weight: string;
  current_value: string;
  baseline_value?: string;
  target_value?: string;
  ratio?: string;
  delta?: string;
  factor_score: string;
  weighted_points: number;
  max_points: number;
  status: string;
  explanation: string;
}

export interface ReadinessEvaluation {
  readinessScore: number;
  status: ReadinessAlertLevel;
  hrvRatio: number;
  hrvScore: number;
  rhrDiff: number;
  rhrScore: number;
  sleepScore: number;
  tempDiff: number;
  tempScore: number;
  recommendedAction: string;
  whyExplanation: string;
  readinessFactors: {
    hrv: ReadinessFactorDetail;
    rhr: ReadinessFactorDetail;
    sleep: ReadinessFactorDetail;
    temp: ReadinessFactorDetail;
  };
}

/**
 * Pure, deterministic Axiom-4 / ISS Edge-Computing Mission Readiness Score engine.
 * Weighted 4-factor composite:
 *   HRV (35%) + Resting Heart Rate (25%) + Sleep Duration & Efficiency (25%) + Skin Temp Stability (15%)
 */
export function calculateEdgeReadinessScore(input: ReadinessInput): ReadinessEvaluation {
  const baselineHrv = Math.max(1, input.baselineHrv ?? 65);
  const baselineRhr = input.baselineRhr ?? 58;
  const baselineTemp = input.baselineTempC ?? 36.6;

  // 1. HRV Score (35% weight, capped at 1.15 ratio -> 100 pts)
  const safeHrv = Math.max(0, input.hrv);
  const hrvRatio = Math.min(safeHrv / baselineHrv, 1.15);
  const hrvScore = Math.max(0, Math.min((hrvRatio / 1.0) * 100, 100));

  // 2. Resting Heart Rate Score (25% weight, 4 pts penalty per bpm elevation above baseline)
  const rhrDiff = Math.round((input.heartRate - baselineRhr) * 10) / 10;
  const rhrScore = Math.max(0, Math.min(100, 100 - rhrDiff * 4));

  // 3. Sleep Score (25% weight, target 7.5h duration * clamped efficiency 0..100%)
  const clampedHours = Math.max(0, input.sleepHours);
  const clampedEff = Math.max(0, Math.min(100, input.sleepEfficiency));
  const durationFactor = Math.min(clampedHours / 7.5, 1.0);
  const sleepScore = Math.max(0, Math.min(100, durationFactor * clampedEff));

  // 4. Skin Temperature Stability Score (15% weight, 60 pts penalty per 1.0°C deviation)
  const tempDiff = Math.abs(input.skinTempC - baselineTemp);
  const tempScore = Math.max(0, Math.min(100, 100 - tempDiff * 60));

  // Weighted Composite Total (0 - 100)
  const readinessTotal =
    hrvScore * 0.35 +
    rhrScore * 0.25 +
    sleepScore * 0.25 +
    tempScore * 0.15;

  const readinessScore = Math.round(readinessTotal * 10) / 10;

  const status: ReadinessAlertLevel =
    readinessScore >= 80 ? 'GREEN' : readinessScore >= 60 ? 'YELLOW' : 'RED';

  const recommendedAction =
    status === 'GREEN'
      ? 'Cleared for EVA extravehicular prep, high-stress docked maneuvers, and standard cognitive tasks.'
      : status === 'YELLOW'
      ? 'Cleared for nominal station maintenance. Recommend 30-min sleep extension and 460nm circadian light re-calibration.'
      : 'Cardiorespiratory strain or autonomic fatigue detected. Suspend EVA operations; initiate Private Medical Conference.';

  const whyExplanation =
    status === 'GREEN'
      ? `Score is ${readinessScore}/100 (GREEN) because autonomic recovery (HRV ${Math.round(safeHrv)} ms, ${(hrvScore * 0.35).toFixed(1)}/35 pts) and resting heart rate (${Math.round(input.heartRate)} bpm, ${(rhrScore * 0.25).toFixed(1)}/25 pts) closely align with pre-flight baseline with strong sleep efficiency (${Math.round(clampedEff)}%).`
      : status === 'YELLOW'
      ? `Score is ${readinessScore}/100 (YELLOW) due to moderate physiological debt, primarily driven by ${
          hrvRatio < 0.9
            ? `diminished autonomic HRV recovery (${Math.round(safeHrv)} ms vs ${baselineHrv} ms baseline)`
            : rhrDiff > 0
            ? `resting heart rate elevation (+${rhrDiff} bpm over baseline)`
            : `sleep deficit (${clampedHours}h vs 7.5h target)`
        }, indicating standard orbital maintenance capacity while deferring high-intensity EVA.`
      : `Score is ${readinessScore}/100 (RED) due to concurrent cardiorespiratory and autonomic strain exceeding safety margins. Immediate rest and Private Medical Conference recommended.`;

  return {
    readinessScore,
    status,
    hrvRatio,
    hrvScore,
    rhrDiff,
    rhrScore,
    sleepScore,
    tempDiff,
    tempScore,
    recommendedAction,
    whyExplanation,
    readinessFactors: {
      hrv: {
        name: 'Heart Rate Variability (HRV RMSSD)',
        weight: '35%',
        current_value: `${Math.round(safeHrv)} ms`,
        baseline_value: `${baselineHrv} ms`,
        ratio: `${hrvRatio.toFixed(2)}x`,
        factor_score: `${Math.round(hrvScore)}/100`,
        weighted_points: Number((hrvScore * 0.35).toFixed(1)),
        max_points: 35.0,
        status: hrvRatio >= 1.0 ? 'Optimal' : hrvRatio >= 0.85 ? 'Acceptable' : 'Depressed',
        explanation:
          hrvRatio >= 1.0
            ? 'Autonomic parasympathetic tone matches or exceeds orbital baseline, indicating full neurological recovery.'
            : `HRV dropped ${Math.round((1 - hrvRatio) * 100)}% below baseline, reflecting cumulative fatigue or sympathetic stress.`,
      },
      rhr: {
        name: 'Resting Heart Rate (RHR)',
        weight: '25%',
        current_value: `${Math.round(input.heartRate)} bpm`,
        baseline_value: `${baselineRhr} bpm`,
        delta: `${rhrDiff > 0 ? `+${rhrDiff}` : rhrDiff} bpm`,
        factor_score: `${Math.round(rhrScore)}/100`,
        weighted_points: Number((rhrScore * 0.25).toFixed(1)),
        max_points: 25.0,
        status: rhrDiff <= 0 ? 'Optimal' : rhrDiff <= 4 ? 'Mild Elevation' : 'Strained',
        explanation:
          rhrDiff <= 0
            ? 'Resting heart rate remains at or below baseline, showing zero cardiovascular over-compensation.'
            : `RHR is elevated +${rhrDiff} bpm above baseline, applying a -${Math.round(rhrDiff * 4)} pt penalty due to cephalad fluid volume shift.`,
      },
      sleep: {
        name: 'Sleep Duration & Efficiency',
        weight: '25%',
        current_value: `${clampedHours}h duration · ${Math.round(clampedEff)}% efficiency`,
        target_value: '7.5h duration · ≥85% efficiency',
        factor_score: `${Math.round(sleepScore)}/100`,
        weighted_points: Number((sleepScore * 0.25).toFixed(1)),
        max_points: 25.0,
        status: clampedHours >= 7.0 && clampedEff >= 85 ? 'Optimal' : 'Sleep Debt',
        explanation:
          clampedHours >= 7.0 && clampedEff >= 85
            ? 'Adequate slow-wave sleep and high sleep efficiency counter 16 orbital sunrises/day circadian disruption.'
            : `Sleep duration (${clampedHours}h / 7.5h) or efficiency (${Math.round(clampedEff)}%) falls short, reducing neurological alertness.`,
      },
      temp: {
        name: 'Skin Temperature Stability',
        weight: '15%',
        current_value: `${input.skinTempC}°C`,
        baseline_value: `${baselineTemp}°C`,
        delta: `±${tempDiff.toFixed(2)}°C`,
        factor_score: `${Math.round(tempScore)}/100`,
        weighted_points: Number((tempScore * 0.15).toFixed(1)),
        max_points: 15.0,
        status: tempDiff <= 0.3 ? 'Optimal' : 'Thermal Drift',
        explanation:
          tempDiff <= 0.3
            ? 'Peripheral skin temperature is thermally stable within normal diurnal limits.'
            : `Thermal deviation of ±${tempDiff.toFixed(2)}°C indicates possible thermoregulatory drift or early immune activation.`,
      },
    },
  };
}

export const calculate_readiness = calculateEdgeReadinessScore;

export interface DtnPacketBuildInput {
  astronautId: string;
  crewName: string;
  mission: string;
  missionDay: number;
  locationModule: string;
  syncStatus?: 'PENDING_DOWNLINK' | 'ACK_GROUND';
  heartRate: number;
  hrv: number;
  spo2: number;
  respirationRpm: number;
  skinTempC: number;
  bloodGlucoseMgDl: number;
  sleepHours: number;
  sleepEfficiency: number;
  cabinCo2Ppm: number;
  evaluation: ReadinessEvaluation;
  timestamp?: Date;
}

export function buildDtnTelemetryPacket(params: DtnPacketBuildInput) {
  const now = params.timestamp ?? new Date();
  const iso = now.toISOString();
  return {
    packet_id: `ax4-crew-${params.astronautId}-${iso.slice(0, 10)}T${iso.slice(11, 19).replace(/:/g, '')}Z`,
    sync_status: params.syncStatus ?? 'PENDING_DOWNLINK',
    crew_member: {
      id: params.astronautId,
      name: params.crewName,
      mission: params.mission,
      mission_day: params.missionDay,
      location_module: params.locationModule,
    },
    biometrics: {
      heart_rate_bpm: Math.round(params.heartRate),
      resting_hr_bpm: Math.round(params.heartRate),
      hrv_rmssd_ms: Math.round(params.hrv),
      spo2_pct: params.spo2,
      respiration_rpm: params.respirationRpm,
      skin_temp_c: Number(params.skinTempC.toFixed(1)),
      blood_glucose_mg_dl: params.bloodGlucoseMgDl,
    },
    circadian_and_sleep: {
      sleep_duration_hours: Number(params.sleepHours.toFixed(1)),
      sleep_efficiency_pct: Math.round(params.sleepEfficiency),
      ambient_lux_exposure: 420,
    },
    cabin_context: {
      co2_level_ppm: params.cabinCo2Ppm,
      radiation_dose_msv: 0.48,
      cabin_pressure_kpa: 101.3,
    },
    edge_ai_output: {
      readiness_score: params.evaluation.readinessScore,
      alert_level: params.evaluation.status,
      recommended_action: params.evaluation.recommendedAction,
      readiness_factors: params.evaluation.readinessFactors,
      why_score_in_current_state: params.evaluation.whyExplanation,
    },
  };
}
