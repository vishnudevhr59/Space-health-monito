/**
 * SPACE HEALTH MONITO - Autonomous Telemetry Streaming Engine
 * Continuous 1,000ms multi-variate streaming loop with progressive drift algorithms,
 * physiological micro-variations, automatic voice alerts, and audit trail logging.
 */

import { AnomalyInjectionState, NOMINAL_HEALTH_STATE } from '../components/SimulationAnomalyPanel';
import { voiceAlertService } from './voiceAlertService';
import { missionAuditTrailService } from './missionAuditTrailService';

export interface TelemetryFrame {
  timestamp: string;
  heartRate: number;
  spo2: number;
  bodyTemperature: number;
  systolicBP: number;
  diastolicBP: number;
  hrv: number;
  respiratoryRate: number;
  cabinPressurePsi: number;
  cabinCo2MmHg: number;
  vestibularConflictScore: number;
  eclssOgaPercent: number;
  trishRecoveryScore: number;
  severity: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  anomalyName: string;
}

type FrameSubscriber = (frame: TelemetryFrame) => void;

class TelemetryStreamEngine {
  private timerId: any = null;
  private currentFrame: TelemetryFrame;
  private targetState: AnomalyInjectionState;
  private subscribers: Set<FrameSubscriber> = new Set();
  private tickCount: number = 0;
  private lastAlertSeverity: string = 'NOMINAL';

  constructor() {
    this.targetState = { ...NOMINAL_HEALTH_STATE };
    this.currentFrame = {
      timestamp: new Date().toISOString(),
      heartRate: 64,
      spo2: 98.4,
      bodyTemperature: 36.6,
      systolicBP: 114,
      diastolicBP: 72,
      hrv: 64,
      respiratoryRate: 14,
      cabinPressurePsi: 14.7,
      cabinCo2MmHg: 2.2,
      vestibularConflictScore: 1.4,
      eclssOgaPercent: 21.0,
      trishRecoveryScore: 86,
      severity: 'NOMINAL',
      anomalyName: 'Nominal Operations',
    };

    this.startStreaming();
  }

  public setTargetState(newState: AnomalyInjectionState) {
    const isNewCritical = newState.severity === 'CRITICAL' && this.targetState.anomalyName !== newState.anomalyName;
    const isNewWarning = newState.severity === 'WARNING' && this.targetState.anomalyName !== newState.anomalyName;

    this.targetState = { ...newState };

    // Log judge-injected anomaly into mission audit trail
    if (newState.isAnomalyActive) {
      missionAuditTrailService.logEvent({
        metTimestamp: this.formatCurrentMet(),
        eventType: 'ANOMALY_INJECTED',
        severity: newState.severity,
        title: `Anomaly Injected: ${newState.anomalyName}`,
        description: newState.etiology,
        actor: 'Hackathon Flight Simulator / Judge Console',
        telemetrySnapshot: {
          heartRate: newState.heartRate,
          spo2: newState.spo2,
          bodyTemperature: newState.bodyTemperature,
          systolicBP: newState.bloodPressure.systolic,
          diastolicBP: newState.bloodPressure.diastolic,
          respiratoryRate: newState.respiratoryRate,
          cabinPressurePsi: newState.cabinPressurePsi,
          cabinCo2MmHg: newState.cabinCo2MmHg,
          vestibularConflictScore: newState.vestibularConflictScore,
        },
      });

      // Verbal voice callout via Web Speech API
      if (isNewCritical) {
        voiceAlertService.speakCriticalAlert(
          newState.anomalyName,
          `Pathology: ${newState.etiology.split('.')[0]}`
        );
      } else if (isNewWarning) {
        voiceAlertService.speakWarningAlert(
          newState.anomalyName,
          `Environmental drift detected.`
        );
      }
    } else {
      // Nominal restoration logged
      missionAuditTrailService.logEvent({
        metTimestamp: this.formatCurrentMet(),
        eventType: 'SYSTEM_NOMINAL_RESTORED',
        severity: 'NOMINAL',
        title: 'System Restored to Nominal Baseline',
        description: 'All physiological and environmental vectors recalibrated to Gaussian 1.5σ setpoints.',
        actor: 'Flight Surgeon Clinical Directive',
      });
    }
  }

  public getCurrentFrame(): TelemetryFrame {
    return { ...this.currentFrame };
  }

  public subscribe(callback: FrameSubscriber): () => void {
    this.subscribers.add(callback);
    callback({ ...this.currentFrame });
    return () => this.subscribers.delete(callback);
  }

  private startStreaming() {
    if (this.timerId) return;

    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  public stopStreaming() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * 1-Second Telemetry Simulation Step
   * Implements progressive exponential decay / ramp towards targetState over 3-5 seconds
   */
  private tick() {
    this.tickCount++;
    const t = this.tickCount;

    // Subtle natural sinusoidal variability (respiratory sinus arrhythmia, circadian drift)
    const hrJitter = Math.sin(t * 0.4) * 0.8;
    const respJitter = Math.cos(t * 0.3) * 0.3;
    const tempJitter = Math.sin(t * 0.1) * 0.02;

    // Progressive drift smoothing factors (30% step per second toward target)
    const drift = (current: number, target: number, stepRate: number = 0.3): number => {
      const delta = target - current;
      if (Math.abs(delta) < 0.1) return target;
      return current + delta * stepRate;
    };

    const target = this.targetState;
    const nextHr = Math.round(drift(this.currentFrame.heartRate, target.heartRate, 0.35) + hrJitter);
    const nextSpo2 = +(drift(this.currentFrame.spo2, target.spo2, 0.3)).toFixed(1);
    const nextTemp = +(drift(this.currentFrame.bodyTemperature, target.bodyTemperature, 0.25) + tempJitter).toFixed(2);
    const nextSys = Math.round(drift(this.currentFrame.systolicBP, target.bloodPressure.systolic, 0.35));
    const nextDia = Math.round(drift(this.currentFrame.diastolicBP, target.bloodPressure.diastolic, 0.35));
    const nextResp = Math.round(drift(this.currentFrame.respiratoryRate, target.respiratoryRate, 0.3) + respJitter);
    const nextPress = +(drift(this.currentFrame.cabinPressurePsi, target.cabinPressurePsi, 0.25)).toFixed(1);
    const nextCo2 = +(drift(this.currentFrame.cabinCo2MmHg, target.cabinCo2MmHg, 0.25)).toFixed(1);
    const nextVest = +(drift(this.currentFrame.vestibularConflictScore, target.vestibularConflictScore, 0.3)).toFixed(1);
    const nextHrv = Math.round(drift(this.currentFrame.hrv, target.hrv, 0.3));

    // Determine derived severity from actual live values
    let liveSeverity: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
    if (nextHr > 120 || nextSpo2 < 90 || nextPress < 12.0 || nextVest > 7.0 || target.severity === 'CRITICAL') {
      liveSeverity = 'CRITICAL';
    } else if (nextHr > 95 || nextSpo2 < 95 || nextCo2 > 3.5 || nextVest > 4.0 || target.severity === 'WARNING') {
      liveSeverity = 'WARNING';
    }

    this.currentFrame = {
      timestamp: new Date().toISOString(),
      heartRate: nextHr,
      spo2: nextSpo2,
      bodyTemperature: nextTemp,
      systolicBP: nextSys,
      diastolicBP: nextDia,
      hrv: nextHrv,
      respiratoryRate: nextResp,
      cabinPressurePsi: nextPress,
      cabinCo2MmHg: nextCo2,
      vestibularConflictScore: nextVest,
      eclssOgaPercent: 21.0,
      trishRecoveryScore: liveSeverity === 'NOMINAL' ? 86 : 58,
      severity: liveSeverity,
      anomalyName: target.anomalyName,
    };

    // Automated verbal voice announcement if newly transitioned to CRITICAL
    if (liveSeverity === 'CRITICAL' && this.lastAlertSeverity !== 'CRITICAL') {
      voiceAlertService.speakCriticalAlert(
        target.anomalyName,
        `Vitals breach: Heart rate ${nextHr} BPM, Oxygen ${nextSpo2} percent, Cabin Pressure ${nextPress} PSI`
      );
    }
    this.lastAlertSeverity = liveSeverity;

    // Notify all subscribers (Gauges, HUDs, Tickers)
    this.subscribers.forEach((sub) => sub({ ...this.currentFrame }));
  }

  private formatCurrentMet(): string {
    const totalSec = 31345 + this.tickCount;
    const hours = Math.floor(totalSec / 3600) % 24;
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `MET +142d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
}

export const telemetryStreamEngine = new TelemetryStreamEngine();
