/**
 * SPACE HEALTH MONITO — Data Models & Schemas
 * Comprehensive definitions for all 14 mission data domains
 * NASA Space Apps Challenge 2026
 */

export type UserRole =
  | 'Astronaut'
  | 'Flight Medical Officer'
  | 'Mission Health Specialist'
  | 'Mission Administrator'
  | 'Administrator'
  | 'Researcher';

export type ProvenanceType =
  | 'REAL_RESEARCH_DATA'
  | 'SIMULATED_TELEMETRY'
  | 'ILLUSTRATIVE_REFERENCE'
  | 'USER_ENTERED'
  | 'AI_GENERATED';

export type DataQualityStatus =
  | 'VERIFIED'
  | 'ESTIMATED'
  | 'SIMULATED'
  | 'DEGRADED'
  | 'SENSOR_UNAVAILABLE'
  | 'MISSING';

export type TriageSeverity = 'Critical' | 'Warning' | 'Advisory' | 'Nominal';
export type AlertReviewStatus = 'Active' | 'New' | 'Acknowledged' | 'Under Review' | 'Resolved' | 'Dismissed';

export type TelemetryClassificationType =
  | 'NOMINAL'
  | 'STRUCTURALLY_INVALID'
  | 'IMPOSSIBLE_OR_MALFORMED'
  | 'UNUSUAL_OBSERVATION'
  | 'POTENTIAL_SENSOR_ARTIFACT'
  | 'MISSING_MEASUREMENT'
  | 'STALE_MEASUREMENT'
  | 'REQUIRES_HUMAN_REVIEW';

export interface IRawObservation {
  id: string;
  astronautId: string;
  receivedAt: string;
  rawPayload: any;
  classification: TelemetryClassificationType;
  rejectionReason?: string;
  warnings?: string[];
  ingestedRecordId?: string;
  dataSource: string;
}

// 1. User Account
export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  assignedCrewId?: string; // If astronaut, links to their profile
  badgeNumber: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// 2. Astronaut Profile
export interface IAstronautProfile {
  id: string;
  userId: string;
  name: string;
  callsign: string;
  missionId: string;
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
  activeCountermeasures: string[];
  updatedAt: string;
}

// 3. Mission
export interface IMission {
  id: string;
  name: string;
  code: string;
  orbitTarget: string;
  launchDate: string;
  projectedReturnDate: string;
  currentDay: number;
  crewIds: string[];
  primaryFlightSurgeonId: string;
  environmentalTarget: {
    cabinTempC: { min: number; max: number };
    humidityPercent: { min: number; max: number };
    co2MmHg: { max: number };
    o2Percent: { min: number; max: number };
  };
  status: 'In Flight' | 'Pre-Launch' | 'Completed' | 'Aborted';
}

// 4. Physiological Telemetry
export interface IPhysiologicalTelemetry {
  id: string;
  idempotencyKey?: string;
  astronautId: string;
  missionId: string;
  timestamp: string;
  ingestedAt: string;
  dataSource: string; // e.g., 'BioHarness-V4', 'Cuff-BP-Module', 'PulseOx-Ear'
  dataQuality: DataQualityStatus;
  provenance: ProvenanceType;
  
  // Cardiovascular
  heartRate: number; // BPM
  heartRateVariability?: number; // ms (RMSSD)
  hrv?: number; // Alias for RMSSD ms
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  perfusionIndex?: number;
  respiratoryRate?: number; // Breaths/min
  
  // Oxygenation
  spo2: number; // %
  
  // Thermoregulation
  bodyTemperature: number; // Celsius
  temperatureType?: 'Core' | 'Tympanic' | 'Axillary' | 'Skin';
  
  // Unit & sensor metadata
  units: {
    heartRate: 'BPM';
    spo2: '%';
    bodyTemperature: '°C';
    hrv: 'ms';
  };
  sensorQualityScore?: number; // 0-100
  isOutlier?: boolean;
}

// 5. Environmental Telemetry
export interface IEnvironmentalTelemetry {
  id: string;
  missionId: string;
  habitatSection: 'Crew Quarters' | 'Cupola' | 'Command Module' | 'Exercise Deck' | 'Airlock';
  timestamp: string;
  ingestedAt: string;
  cabinTempC: number;
  humidityPercent: number;
  co2MmHg: number;
  o2Percent: number;
  cabinPressureKPa: number;
  traceContaminantIndex: number; // ppm
  dataQuality: DataQualityStatus;
  provenance: ProvenanceType;
}

// 6. Radiation Measurements
export interface IRadiationMeasurement {
  id: string;
  astronautId: string;
  missionId: string;
  timestamp: string;
  ingestedAt: string;
  sensorLocation: 'Crew Quarters' | 'Cupola' | 'Columbus Lab' | 'Personal Dosimeter';
  dosimeterSource: 'NASA-CPD-Active' | 'Passive-TLD' | 'Tissue-Equivalent-Proportional-Counter';
  doseRateMicroSvPerHour: number;
  accumulatedDailyMSv: number;
  cumulativeMissionMSv: number;
  solarActivityIndex: 'Quiet' | 'Minor SPE' | 'Elevated Solar Flux' | 'High GCR';
  shieldingFactor: number;
  dataQuality: DataQualityStatus;
  provenance: ProvenanceType;
}

// 7. Baseline Profile
export interface IBaselineProfile {
  id: string;
  astronautId: string;
  phase: 'Pre-Flight Baseline' | 'In-Flight Current' | 'Post-Flight Target';
  observationPeriod: {
    startDate: string;
    endDate: string;
    solDays: number;
    sampleCount: number;
  };
  metrics: {
    restingHeartRate: { mean: number; std: number; unit: 'BPM' };
    spo2: { mean: number; std: number; unit: '%' };
    bodyTemperature: { mean: number; std: number; unit: '°C' };
    hrv: { mean: number; std: number; unit: 'ms' };
    systolicBP: { mean: number; std: number; unit: 'mmHg' };
    diastolicBP: { mean: number; std: number; unit: 'mmHg' };
    sleepDurationHours?: { mean: number; std: number; unit: 'Hours' };
  };
  calculationMethod: 'Rolling 30-Sol Gaussian Kernel' | 'NASA Normative Calibration' | 'Pre-Launch Clinical Testing';
  dataSource: string;
  provenance: ProvenanceType;
  lastUpdated: string;
  isLocked: boolean;
}

// 8. ML Analysis Result
export interface IMLAnalysisResult {
  id: string;
  astronautId: string;
  timestamp: string;
  modelVersion: string;
  sensitivitySettingSigma: number;
  isolationForestScore: number; // 0.0 - 1.0
  isIsolatedOutlier: boolean;
  contributingIndicators: {
    feature: string;
    observedValue: number;
    baselineMean: number;
    zScore: number;
    contributionWeight: number; // % contribution to anomaly
    unit: string;
  }[];
  overallRiskScore: number; // 0 - 100
  triageClassification: 'NOMINAL' | 'ATTENTION' | 'PRIORITY REVIEW';
  explainableInsights: {
    id: string;
    metric: string;
    triageTier: string;
    observed: string;
    baseline: string;
    delta: string;
    zScore: number;
    confidence: number;
    whatChanged: string;
    historicalComparison: string;
    whyFlagged: string;
    spaceflightContext: string;
    supportingResearch: string;
    suggestedNextStep: string;
  }[];
  provenance: ProvenanceType;
  uncertaintyEstimate: number; // 0-1 (model epistemic uncertainty)
  disclaimer: string;
}

// 9. Health Alert
export interface IHealthAlert {
  id: string;
  astronautId: string;
  astronautName: string;
  missionId?: string;
  timestamp: string;
  indicator: string;
  severity: TriageSeverity;
  observedValue: string;
  configuredThreshold: string;
  title: string;
  reason: string;
  suggestedAction: string;
  status: AlertReviewStatus;
  dismissalReason?: string;
  relatedMeasurementId?: string;
  relatedMLAnalysisId?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

// 10. Notifications
export interface INotification {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  linkTab?: string;
  isRead: boolean;
  createdAt: string;
}

// 11. Health Report
export interface IHealthReport {
  id: string;
  astronautId: string;
  generatedByUserId: string;
  generatedAt: string;
  title: string;
  missionDay: number;
  classification: string;
  summaryMetrics: {
    avgHeartRate: number;
    avgSpO2: number;
    avgSleepDuration: number;
    cumulativeRadiationMSv: number;
    adherenceRatePercent: number;
  };
  recommendations: string[];
  approvedBySurgeon: boolean;
}

// 12. Research Reference & Provenance
export interface IResearchReference {
  id: string;
  title: string;
  authors: string;
  source: string;
  year: number;
  url: string;
  doi?: string;
  category: 'Cardiovascular' | 'Radiation' | 'Bone & Muscle' | 'Sleep & Circadian' | 'Behavioral';
  datasetId?: string; // e.g., 'NASA OSDR GL-DS-8841'
  studyPopulation?: string;
  sampleSize?: number;
  variablesUsed: string[];
  summary: string;
  keyFindings: string[];
  provenanceType: ProvenanceType;
  methodology: string;
  knownLimitations: string;
}

// 13. Audit Log
export interface IAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  action: string; // e.g., 'INGEST_TELEMETRY', 'ACKNOWLEDGE_ALERT', 'READ_ASTRONAUT_RECORDS'
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'DENIED' | 'ERROR';
  details?: string;
}

// 14. Device and Sensor Information
export interface IDeviceSensorInfo {
  id: string;
  sensorId: string;
  name: string;
  category: 'Cardiovascular' | 'Pulse Oximeter' | 'Dosimeter' | 'Environmental' | 'EEG Sleep Cap';
  modelNumber: string;
  firmwareVersion: string;
  calibrationDate: string;
  nextCalibrationDue: string;
  accuracyTolerance: string;
  batteryPercent: number;
  status: 'OPERATIONAL' | 'DEGRADED' | 'CALIBRATION_REQUIRED' | 'OFFLINE';
  assignedAstronautId?: string;
}

// Sleep and Activity interfaces for backwards compatibility
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
  provenance?: ProvenanceType;
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
  provenance?: ProvenanceType;
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
  notes: string;
}
