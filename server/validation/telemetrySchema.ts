/**
 * SPACE HEALTH MONITO — Telemetry Validation Engine
 * Strict schema, physiological plausibility boundaries, unit normalization,
 * and data quality tagging.
 */

import { IPhysiologicalTelemetry, DataQualityStatus, ProvenanceType } from '../db/models.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: Partial<IPhysiologicalTelemetry>;
  dataQuality: DataQualityStatus;
}

// Physiological Hard & Soft Limits (Calibrated to NASA Flight Medicine criteria)
export const PHYSIOLOGICAL_BOUNDS = {
  heartRate: {
    minPossible: 28, // Extreme bradycardia survival limit
    maxPossible: 240, // Extreme supraventricular tachycardia limit
    minWarning: 45,
    maxWarning: 110,
    unit: 'BPM',
  },
  spo2: {
    minPossible: 70.0, // Critical asphyxiation limit
    maxPossible: 100.0, // Physical atmospheric saturation ceiling
    minWarning: 95.0,
    unit: '%',
  },
  bodyTemperature: {
    minPossible: 33.0, // Hypothermia limit
    maxPossible: 42.5, // Severe hyperpyrexia limit
    minWarning: 35.8,
    maxWarning: 37.8,
    unit: '°C',
  },
  hrv: {
    minPossible: 5.0,
    maxPossible: 250.0,
    minWarning: 20.0,
    unit: 'ms',
  },
  respiratoryRate: {
    minPossible: 4,
    maxPossible: 60,
    minWarning: 8,
    maxWarning: 24,
    unit: 'breaths/min',
  },
  systolicBP: {
    minPossible: 60,
    maxPossible: 240,
    minWarning: 90,
    maxWarning: 140,
    unit: 'mmHg',
  },
  diastolicBP: {
    minPossible: 35,
    maxPossible: 150,
    minWarning: 60,
    maxWarning: 90,
    unit: 'mmHg',
  },
};

/**
 * Validates and normalizes incoming telemetry payloads
 */
export function validatePhysiologicalTelemetry(raw: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: ['Telemetry payload must be a non-null JSON object'],
      warnings: [],
      dataQuality: 'MISSING',
    };
  }

  // 1. Mandatory Identity Fields
  if (!raw.astronautId || typeof raw.astronautId !== 'string' || !raw.astronautId.trim()) {
    errors.push("Missing required field 'astronautId'");
  }

  // 2. Timestamp Validation
  let timestampStr = raw.timestamp;
  if (!timestampStr) {
    timestampStr = new Date().toISOString();
    warnings.push("Timestamp was not provided; assigned current UTC timestamp");
  } else {
    const parsedDate = new Date(timestampStr);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Invalid timestamp format '${timestampStr}'. Must be valid ISO-8601.`);
    } else {
      const now = Date.now();
      const measuredTime = parsedDate.getTime();
      // Clock skew allowance: max 5 minutes in future
      if (measuredTime > now + 5 * 60 * 1000) {
        errors.push(`Measurement timestamp is in the future (${timestampStr}) beyond acceptable 5-minute clock drift.`);
      }
      // Stale record detection: older than 365 days
      if (measuredTime < now - 365 * 24 * 60 * 60 * 1000) {
        warnings.push(`Record timestamp is older than 365 days (${timestampStr}); flagging as archived telemetry.`);
      }
    }
  }

  // 3. Heart Rate Validation
  let hr = Number(raw.heartRate);
  if (raw.heartRate === undefined || raw.heartRate === null || isNaN(hr)) {
    errors.push("Required metric 'heartRate' is missing or non-numeric");
  } else if (hr < PHYSIOLOGICAL_BOUNDS.heartRate.minPossible || hr > PHYSIOLOGICAL_BOUNDS.heartRate.maxPossible) {
    errors.push(
      `Heart rate of ${hr} BPM is physiologically impossible (${PHYSIOLOGICAL_BOUNDS.heartRate.minPossible} - ${PHYSIOLOGICAL_BOUNDS.heartRate.maxPossible} BPM). Sensor artifact suspected.`
    );
  } else if (hr < PHYSIOLOGICAL_BOUNDS.heartRate.minWarning || hr > PHYSIOLOGICAL_BOUNDS.heartRate.maxWarning) {
    warnings.push(`Heart rate ${hr} BPM exceeds normal clinical resting envelope.`);
  }

  // 4. SpO2 Validation
  let spo2 = Number(raw.spo2);
  if (raw.spo2 === undefined || raw.spo2 === null || isNaN(spo2)) {
    errors.push("Required metric 'spo2' is missing or non-numeric");
  } else if (spo2 < PHYSIOLOGICAL_BOUNDS.spo2.minPossible || spo2 > PHYSIOLOGICAL_BOUNDS.spo2.maxPossible) {
    errors.push(
      `SpO2 of ${spo2}% is invalid. Values must be between ${PHYSIOLOGICAL_BOUNDS.spo2.minPossible}% and ${PHYSIOLOGICAL_BOUNDS.spo2.maxPossible}%.`
    );
  } else if (spo2 < PHYSIOLOGICAL_BOUNDS.spo2.minWarning) {
    warnings.push(`SpO2 ${spo2}% indicates potential hypoxic event (< 95.0%).`);
  }

  // 5. Body Temperature Validation (Auto-converts Fahrenheit if user submitted F)
  let temp = Number(raw.bodyTemperature);
  if (raw.bodyTemperature !== undefined && raw.bodyTemperature !== null && !isNaN(temp)) {
    // If entered in Fahrenheit (e.g., 97-104), convert to Celsius
    if (temp >= 90.0 && temp <= 110.0) {
      temp = Math.round(((temp - 32) * 5 / 9) * 100) / 100;
      warnings.push(`Body temperature was provided in Fahrenheit; automatically converted to ${temp}°C`);
    }

    if (temp < PHYSIOLOGICAL_BOUNDS.bodyTemperature.minPossible || temp > PHYSIOLOGICAL_BOUNDS.bodyTemperature.maxPossible) {
      errors.push(
        `Body temperature of ${temp}°C is physiologically impossible (${PHYSIOLOGICAL_BOUNDS.bodyTemperature.minPossible} - ${PHYSIOLOGICAL_BOUNDS.bodyTemperature.maxPossible}°C).`
      );
    } else if (temp < PHYSIOLOGICAL_BOUNDS.bodyTemperature.minWarning || temp > PHYSIOLOGICAL_BOUNDS.bodyTemperature.maxWarning) {
      warnings.push(`Body temperature ${temp}°C is outside nominal circadian range (35.8 - 37.8°C).`);
    }
  } else {
    temp = 36.6; // Default standard baseline
  }

  // 6. Blood Pressure Validation (Optional)
  let bp = raw.bloodPressure;
  if (bp && typeof bp === 'object') {
    const sys = Number(bp.systolic);
    const dia = Number(bp.diastolic);
    if (!isNaN(sys) && !isNaN(dia)) {
      if (sys < dia) {
        errors.push(`Systolic blood pressure (${sys}) cannot be lower than diastolic blood pressure (${dia}).`);
      }
      if (sys < PHYSIOLOGICAL_BOUNDS.systolicBP.minPossible || sys > PHYSIOLOGICAL_BOUNDS.systolicBP.maxPossible) {
        errors.push(`Systolic BP ${sys} mmHg is outside physical envelope.`);
      }
      if (dia < PHYSIOLOGICAL_BOUNDS.diastolicBP.minPossible || dia > PHYSIOLOGICAL_BOUNDS.diastolicBP.maxPossible) {
        errors.push(`Diastolic BP ${dia} mmHg is outside physical envelope.`);
      }
    }
  }

  // Determine Data Quality Status
  let dataQuality: DataQualityStatus = 'VERIFIED';
  if (errors.length > 0) {
    dataQuality = 'DEGRADED';
  } else if (raw.isSimulated || raw.provenance === 'SIMULATED_TELEMETRY') {
    dataQuality = 'SIMULATED';
  } else if (warnings.length > 0) {
    dataQuality = 'ESTIMATED';
  }

  // Determine Provenance
  const provenance: ProvenanceType = raw.provenance || (raw.isSimulated ? 'SIMULATED_TELEMETRY' : 'USER_ENTERED');

  const sanitized: Partial<IPhysiologicalTelemetry> = {
    astronautId: raw.astronautId,
    missionId: raw.missionId || 'artemis-gateway-04',
    timestamp: timestampStr,
    heartRate: hr,
    spo2: spo2,
    bodyTemperature: temp,
    hrv: raw.hrv ? Number(raw.hrv) : undefined,
    bloodPressure: bp ? { systolic: Number(bp.systolic), diastolic: Number(bp.diastolic) } : undefined,
    respiratoryRate: raw.respiratoryRate ? Number(raw.respiratoryRate) : 14,
    perfusionIndex: raw.perfusionIndex ? Number(raw.perfusionIndex) : 3.8,
    dataQuality: dataQuality,
    provenance: provenance,
    dataSource: raw.dataSource || 'Telemetry-Ingest-Stream',
    units: {
      heartRate: 'BPM',
      spo2: '%',
      bodyTemperature: '°C',
      hrv: 'ms',
    },
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized,
    dataQuality,
  };
}
