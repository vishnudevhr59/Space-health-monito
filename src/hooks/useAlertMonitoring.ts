import { useEffect, useRef, useState } from 'react';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
import { voiceAlertService } from '../services/voiceAlertService';

export interface AlertTransitionEvent {
  parameter: string;
  previousLevel: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  currentLevel: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  currentValue: number;
  unit: string;
  message: string;
  timestamp: string;
}

/**
 * useAlertMonitoring Hook
 * Integrates Browser SpeechSynthesis API to trigger verbal aerospace callouts
 * whenever a biomedical or ECLSS telemetry parameter transitions to WARNING or CRITICAL state.
 */
export function useAlertMonitoring() {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => voiceAlertService.isVoiceEnabled());
  const [lastEvent, setLastEvent] = useState<AlertTransitionEvent | null>(null);

  // Keep track of previous severity levels for state-transition detection
  const prevLevelsRef = useRef<{
    heartRate: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    spo2: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    bodyTemp: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    cabinPressure: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    cabinCo2: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    vestibular: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    overall: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  }>({
    heartRate: 'NOMINAL',
    spo2: 'NOMINAL',
    bodyTemp: 'NOMINAL',
    cabinPressure: 'NOMINAL',
    cabinCo2: 'NOMINAL',
    vestibular: 'NOMINAL',
    overall: 'NOMINAL',
  });

  useEffect(() => {
    // Sync voice enabled state
    const unsubscribeVoice = voiceAlertService.subscribe((enabled) => {
      setIsVoiceEnabled(enabled);
    });

    // Subscribe to continuous 1Hz telemetry stream
    const unsubscribeTelemetry = telemetryStreamEngine.subscribe((frame: TelemetryFrame) => {
      const prev = prevLevelsRef.current;

      // 1. Evaluate Heart Rate
      let hrLevel: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
      if (frame.heartRate > 120 || frame.heartRate < 45) hrLevel = 'CRITICAL';
      else if (frame.heartRate > 95 || frame.heartRate < 52) hrLevel = 'WARNING';

      if (hrLevel !== prev.heartRate) {
        if (hrLevel === 'CRITICAL') {
          voiceAlertService.speakCriticalAlert(
            'Heart rate exceeding nominal limits',
            `Biotelemetry indicates ${frame.heartRate} beats per minute`
          );
        } else if (hrLevel === 'WARNING' && prev.heartRate === 'NOMINAL') {
          voiceAlertService.speakWarningAlert(
            'Heart rate elevated',
            `Currently ${frame.heartRate} beats per minute`
          );
        }
        setLastEvent({
          parameter: 'Heart Rate',
          previousLevel: prev.heartRate,
          currentLevel: hrLevel,
          currentValue: frame.heartRate,
          unit: 'BPM',
          message: hrLevel === 'CRITICAL' ? 'Heart rate critical breach' : 'Heart rate warning transition',
          timestamp: new Date().toISOString(),
        });
        prev.heartRate = hrLevel;
      }

      // 2. Evaluate SpO2 Arterial Oxygenation
      let spo2Level: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
      if (frame.spo2 < 88) spo2Level = 'CRITICAL';
      else if (frame.spo2 < 93) spo2Level = 'WARNING';

      if (spo2Level !== prev.spo2) {
        if (spo2Level === 'CRITICAL') {
          voiceAlertService.speakCriticalAlert(
            'Arterial oxygen desaturation detected',
            `Pulse oximeter reading at ${frame.spo2} percent`
          );
        } else if (spo2Level === 'WARNING' && prev.spo2 === 'NOMINAL') {
          voiceAlertService.speakWarningAlert(
            'Arterial oxygen saturation low',
            `Reading is ${frame.spo2} percent`
          );
        }
        setLastEvent({
          parameter: 'SpO2 Saturation',
          previousLevel: prev.spo2,
          currentLevel: spo2Level,
          currentValue: frame.spo2,
          unit: '%',
          message: spo2Level === 'CRITICAL' ? 'Hypoxic desaturation breach' : 'SpO2 low warning',
          timestamp: new Date().toISOString(),
        });
        prev.spo2 = spo2Level;
      }

      // 3. Evaluate Cabin Atmospheric Pressure
      let pressureLevel: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
      if (frame.cabinPressurePsi < 11.5) pressureLevel = 'CRITICAL';
      else if (frame.cabinPressurePsi < 13.5) pressureLevel = 'WARNING';

      if (pressureLevel !== prev.cabinPressure) {
        if (pressureLevel === 'CRITICAL') {
          voiceAlertService.speakCriticalAlert(
            'Cabin atmospheric depressurization',
            `Pressure dropped to ${frame.cabinPressurePsi} psi`
          );
        } else if (pressureLevel === 'WARNING' && prev.cabinPressure === 'NOMINAL') {
          voiceAlertService.speakWarningAlert(
            'Cabin pressure dropping below nominal',
            `Pressure is ${frame.cabinPressurePsi} psi`
          );
        }
        setLastEvent({
          parameter: 'Cabin Pressure',
          previousLevel: prev.cabinPressure,
          currentLevel: pressureLevel,
          currentValue: frame.cabinPressurePsi,
          unit: 'psi',
          message: 'Atmospheric pressure shift',
          timestamp: new Date().toISOString(),
        });
        prev.cabinPressure = pressureLevel;
      }

      // 4. Evaluate Cabin CO2 (Hypercapnia)
      let co2Level: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
      if (frame.cabinCo2MmHg > 5.5) co2Level = 'CRITICAL';
      else if (frame.cabinCo2MmHg > 3.5) co2Level = 'WARNING';

      if (co2Level !== prev.cabinCo2) {
        if (co2Level === 'CRITICAL') {
          voiceAlertService.speakCriticalAlert(
            'Hypercapnic cabin carbon dioxide surge',
            `Partial pressure is ${frame.cabinCo2MmHg} millimeters of mercury`
          );
        } else if (co2Level === 'WARNING' && prev.cabinCo2 === 'NOMINAL') {
          voiceAlertService.speakWarningAlert(
            'Cabin carbon dioxide elevated',
            `${frame.cabinCo2MmHg} millimeters of mercury`
          );
        }
        setLastEvent({
          parameter: 'Cabin CO2',
          previousLevel: prev.cabinCo2,
          currentLevel: co2Level,
          currentValue: frame.cabinCo2MmHg,
          unit: 'mmHg',
          message: 'CO2 scrubber variance',
          timestamp: new Date().toISOString(),
        });
        prev.cabinCo2 = co2Level;
      }

      // 5. Evaluate Core Body Temperature
      let tempLevel: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
      if (frame.bodyTemperature > 38.6) tempLevel = 'CRITICAL';
      else if (frame.bodyTemperature > 37.8) tempLevel = 'WARNING';

      if (tempLevel !== prev.bodyTemp) {
        if (tempLevel === 'CRITICAL') {
          voiceAlertService.speakCriticalAlert(
            'Severe core body pyrexia alert',
            `Core temperature elevated to ${frame.bodyTemperature} degrees Celsius`
          );
        } else if (tempLevel === 'WARNING' && prev.bodyTemp === 'NOMINAL') {
          voiceAlertService.speakWarningAlert(
            'Core temperature rising',
            `${frame.bodyTemperature} degrees Celsius`
          );
        }
        setLastEvent({
          parameter: 'Core Temperature',
          previousLevel: prev.bodyTemp,
          currentLevel: tempLevel,
          currentValue: frame.bodyTemperature,
          unit: '°C',
          message: 'Thermoregulation variance',
          timestamp: new Date().toISOString(),
        });
        prev.bodyTemp = tempLevel;
      }

      // 6. Overall Scenario State Transition
      if (frame.severity !== prev.overall) {
        if (frame.severity === 'CRITICAL') {
          voiceAlertService.speakCriticalAlert(
            `Mission anomaly active: ${frame.anomalyName}`,
            'Immediate countermeasures initiated'
          );
        }
        prev.overall = frame.severity;
      }
    });

    return () => {
      unsubscribeVoice();
      unsubscribeTelemetry();
    };
  }, []);

  const toggleVoice = () => voiceAlertService.toggleVoiceAlerts();
  const testVoice = () => voiceAlertService.testVoiceAnnouncement();

  return {
    isVoiceEnabled,
    toggleVoice,
    testVoice,
    lastEvent,
  };
}
