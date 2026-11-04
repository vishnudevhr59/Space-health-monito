export type UserRole = 'Astronaut' | 'Mission Health Specialist' | 'Administrator';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  badgeNumber: string;
  assignedCrewId?: string;
}

export interface AstronautProfile {
  id: string;
  userId: string;
  name: string;
  callsign: string;
  mission: string;
  destination: string;
  missionDay: number;
  totalDaysInSpace: number;
  bloodType: string;
  age: number;
  heightCm: number;
  weightKg: number;
  baselineVitals: {
    restingHeartRate: number;
    systolicBP: number;
    diastolicBP: number;
    spo2: number;
    bodyTempC: number;
    hrvMs: number;
  };
  radiationCumulativeMSv: number;
  radiationMissionLimitMSv: number;
  boneDensityLossRatePercentPerMonth: number;
  currentStatus: 'Nominal' | 'Under Observation' | 'Intervention Required';
}

export interface HealthMeasurement {
  id: string;
  astronautId: string;
  timestamp: string;
  heartRate: number;
  spo2: number;
  bodyTemperature: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  hrv: number;
  respiratoryRate: number;
  perfusionIndex: number;
  isSimulated: boolean;
  dataQuality: 'High' | 'Degraded' | 'Partial Missing';
}

export interface SleepRecord {
  id: string;
  astronautId: string;
  date: string;
  totalDurationHours: number;
  deepSleepPercent: number;
  remSleepPercent: number;
  lightSleepPercent: number;
  awakeningsCount: number;
  circadianPhaseShiftHours: number;
  efficiencyPercent: number;
  qualityRating: 1 | 2 | 3 | 4 | 5;
  subjectiveRestfulness: string;
}

export interface ActivityRecord {
  id: string;
  astronautId: string;
  date: string;
  exerciseType: 'ARED Resistive' | 'T2 Treadmill' | 'CEVIS Cycle Ergometer' | 'EVA Extravehicular';
  durationMinutes: number;
  caloriesBurned: number;
  peakHeartRate: number;
  averageHeartRate: number;
  workloadJoules: number;
  completionRatePercent: number;
  countermeasureAdherence: boolean;
}

export interface RadiationRecord {
  id: string;
  astronautId: string;
  timestamp: string;
  sensorLocation: string;
  doseRateMicroSvPerHour: number;
  accumulatedDailyMSv: number;
  cumulativeMissionMSv: number;
  solarActivityIndex: string;
  shieldingFactor: number;
}

export interface HealthAlert {
  id: string;
  astronautId: string;
  astronautName: string;
  timestamp: string;
  indicator: string;
  severity: 'Critical' | 'Warning' | 'Advisory';
  observedValue: string;
  configuredThreshold: string;
  title: string;
  reason: string;
  suggestedAction: string;
  status: 'Active' | 'New' | 'Acknowledged' | 'Under Review' | 'Resolved' | 'Dismissed';
  dismissalReason?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface AIAnalysisResult {
  id: string;
  astronautId: string;
  timestamp: string;
  overallRiskScore: number;
  riskCategory: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  anomaliesDetected: {
    id: string;
    metric: string;
    deviationZScore: number;
    baselineComparison: string;
    explanation: string;
    potentialRisk: string;
    recommendedCountermeasure: string;
    evidenceConfidence: number;
  }[];
  correlations: {
    factors: [string, string];
    correlationCoefficient: number;
    clinicalSignificance: string;
  }[];
  trendProjections: {
    parameter: string;
    sevenDayProjection: string;
    trajectory: 'Improving' | 'Stable' | 'Drifting Negative';
  }[];
}

export interface WellnessAssessment {
  id: string;
  astronautId: string;
  timestamp: string;
  moodScore: number;
  stressLevel: number;
  cognitiveFatigue: number;
  confinementPerception: number;
  socialCohesionScore: number;
  notes?: string;
}

export interface ResearchReference {
  id: string;
  title: string;
  source: string;
  category: string;
  url: string;
  year: number;
  authors: string;
  summary: string;
  keyFindings: string[];
  relevanceToAstronautMonitoring: string;
  doi?: string;
  datasetId?: string;
  studyPopulation?: string;
  sampleSize?: number | string;
  variablesUsed?: string[];
  provenanceType?: string;
  methodology?: string;
  knownLimitations?: string;
}
