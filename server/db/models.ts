/**
 * Mongoose Schema Definitions for Space Health Monito
 * MongoDB Collections:
 * 1. Users
 * 2. AstronautProfiles
 * 3. HealthMeasurements
 * 4. SleepRecords
 * 5. ActivityRecords
 * 6. RadiationExposureRecords
 * 7. HealthAlerts
 * 8. AIAnalysisResults
 * 9. WellnessAssessments
 * 10. ResearchReferences
 */

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'Astronaut' | 'Mission Health Specialist' | 'Administrator';
  assignedCrewId?: string;
  badgeNumber: string;
  createdAt: string;
}

export interface IAstronautProfile {
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

export interface IHealthMeasurement {
  id: string;
  astronautId: string;
  timestamp: string;
  heartRate: number; // BPM
  spo2: number; // %
  bodyTemperature: number; // Celsius
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  hrv: number; // ms (Heart Rate Variability - RMSSD)
  respiratoryRate: number; // breaths/min
  perfusionIndex: number;
  isSimulated: boolean;
  dataQuality: 'High' | 'Degraded' | 'Partial Missing';
}

export interface ISleepRecord {
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

export interface IActivityRecord {
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

export interface IRadiationExposureRecord {
  id: string;
  astronautId: string;
  timestamp: string;
  sensorLocation: 'Crew Quarters' | 'Cupola' | 'Columbus Lab' | 'Personal Dosimeter';
  doseRateMicroSvPerHour: number;
  accumulatedDailyMSv: number;
  cumulativeMissionMSv: number;
  solarActivityIndex: 'Quiet' | 'Minor SPE' | 'Elevated Solar Flux' | 'High GCR';
  shieldingFactor: number;
}

export interface IHealthAlert {
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
  status: 'Active' | 'Acknowledged' | 'Resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface IAIAnalysisResult {
  id: string;
  astronautId: string;
  timestamp: string;
  overallRiskScore: number; // 0-100
  riskCategory: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  anomaliesDetected: {
    id: string;
    metric: string;
    deviationZScore: number;
    baselineComparison: string;
    explanation: string;
    potentialRisk: string;
    recommendedCountermeasure: string;
    evidenceConfidence: number; // 0-1
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

export interface IWellnessAssessment {
  id: string;
  astronautId: string;
  timestamp: string;
  moodScore: number; // 1-10
  stressLevel: number; // 1-10
  cognitiveFatigue: number; // 1-10
  confinementPerception: number; // 1-10
  socialCohesionScore: number; // 1-10
  notes?: string;
}

export interface IResearchReference {
  id: string;
  title: string;
  source: 'NASA Human Research Program' | 'NASA OSDR' | 'NASA GeneLab' | 'NASA Technical Reports (NTRS)' | 'Human Research Roadmap' | 'NASA Space Radiation Research';
  category: 'Space Radiation' | 'Microgravity & Bone/Muscle' | 'Cardiovascular' | 'Sleep & Behavioral' | 'Immune System';
  url: string;
  year: number;
  authors: string;
  summary: string;
  keyFindings: string[];
  relevanceToAstronautMonitoring: string;
}
