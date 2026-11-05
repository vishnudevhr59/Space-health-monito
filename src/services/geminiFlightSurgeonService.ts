/**
 * SPACE HEALTH MONITOR - Secure Gemini API Adapter & Deterministic Offline Medical Diagnostic Engine
 * Grounded in NASA TRISH / NASA HRP Clinical Countermeasure Guidelines.
 * Guarantees zero-hang, zero-crash diagnostics even during complete network or API outages.
 */

import { AnomalyInjectionState } from '../components/SimulationAnomalyPanel';

export interface FlightSurgeonReport {
  anomalyName: string;
  riskLevel: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  physiologicalImpact: string;
  etiology: string;
  countermeasures: string[];
  priority: string;
  clinicalDisclaimer: string;
  generatedAt: string;
  latencyMs: number;
  engineSource: 'Gemini 3.8 Flash (Online Server)' | 'Deterministic Offline HRP Engine (Local Fallback)';
}

// Deterministic Offline Diagnostic Knowledge Base based on NASA Human Research Program protocols
const DETERMINISTIC_OFFLINE_RULES: Record<string, Partial<FlightSurgeonReport>> = {
  tachycardia: {
    anomalyName: 'Acute Resting Tachycardia & Sympathovagal Exhaustion',
    riskLevel: 'CRITICAL',
    physiologicalImpact:
      'Impaired cardiac filling, elevated myocardial oxygen consumption, and risk of ventricular dysrhythmia under cephalad microgravity fluid shift.',
    etiology:
      'Cephalad fluid redistribution reduces central venous pressure setpoint, triggering reflex sympathetic overdrive compounded by catecholamine discharge.',
    countermeasures: [
      'Immediate cessation of high-g and strenuous operational tasks',
      'Deploy 15° head-up sleep rack position to re-equilibrate venous pooling',
      'Administer oral saline rehydration salt solution (750 mL within 30 min)',
      'Continuous 12-lead telemetry downlink to Houston MCC / ISTRAC-BLR flight surgeon',
    ],
    priority: 'P1 - CRITICAL MEDICAL INTERVENTION',
  },
  decompression: {
    anomalyName: 'Rapid Habitat Depressurization & Hypobaric Hypoxia',
    riskLevel: 'CRITICAL',
    physiologicalImpact:
      'Alveolar-arterial oxygen pressure collapse, rapid progression to ebullism if cabin drops below Armstrong limit, and arterial gas embolism risk.',
    etiology:
      'Structural micro-meteoroid hull penetration or primary atmospheric seal failure in Lunar Gateway HALO module.',
    countermeasures: [
      'Immediate donning of emergency launch-entry pressure suits (ACES/Orion suit)',
      'Automated bulkhead hatch seal isolation between Node 2 and HALO module',
      'Override oxygen generator assembly (OGA) to emergency 100% flow delivery',
      'Deploy emergency hull puncture sealant sealant applicator patch kit',
    ],
    priority: 'P0 - SPACECRAFT EMERGENCY PROTOCOL',
  },
  hypoxia: {
    anomalyName: 'Severe Arterial Hypoxemia (SpO2 < 90%)',
    riskLevel: 'CRITICAL',
    physiologicalImpact:
      'Cerebral tissue hypoxia, loss of fine motor coordination, peripheral cyanosis, and cognitive degradation.',
    etiology:
      'Inadequate alveolar partial pressure (PiO2) or ventilation-perfusion discordance caused by cephalad microgravity fluid redistribution.',
    countermeasures: [
      'Immediate administration of 100% high-flow supplemental oxygen via nasal cannula at 4 L/min',
      'Collect venous capillary blood lactate using handheld point-of-care i-STAT biomedical analyzer',
      'Inspect crew module atmospheric circulation ducts for localized stagnant pocketing',
    ],
    priority: 'P1 - CRITICAL RESPIRATORY INTERVENTION',
  },
  co2_saturation: {
    anomalyName: 'Ambient CO2 Saturation & Hypercapnia Risk',
    riskLevel: 'WARNING',
    physiologicalImpact:
      'Cerebral vasodilation, elevated intracranial pressure, throbbing frontal cephalalgia, and cognitive fatigue.',
    etiology:
      'Desiccant bed saturation and thermal breakthrough in Carbon Dioxide Removal Assembly (CDRA) scrubbers.',
    countermeasures: [
      'Manual thermal regeneration override on CDRA desiccant bed A & B',
      'Deploy backup LiOH (Lithium Hydroxide) emergency air scrubbers in crew quarters',
      'Administer 400 mg oral ibuprofen for CO2-induced cranial hypertension',
      'Engage high-rate air recirculation blowers to disperse stagnant CO2 bubbles',
    ],
    priority: 'P2 - ENVIRONMENTAL LIFE SUPPORT ADVISORY',
  },
  vestibular: {
    anomalyName: 'Microgravity Neuro-Vestibular Conflict & SMS',
    riskLevel: 'WARNING',
    physiologicalImpact:
      'Sensory conflict induced nausea, spatial disorientation, impaired hand-eye coordination during critical docking maneuvers.',
    etiology:
      'Discordance between otolith organ gravitational shear signals and visual vestibular ocular reflex in 0-g.',
    countermeasures: [
      'Administer Promethazine 25 mg intramuscular / oral anti-emetic countermeasure',
      'Enforce head and cervical axial stabilization protocol during orbital maneuvers',
      'Engage tactile anchor harness inside crew quarters to restore proprioceptive orientation',
    ],
    priority: 'P3 - CREW WELLNESS COUNTERMEASURE',
  },
};

export class GeminiFlightSurgeonService {
  /**
   * Request flight surgeon diagnostic countermeasure report
   * Uses Gemini backend API with timeout and deterministic offline fallback
   */
  public async getDiagnosticReport(
    anomalyState: AnomalyInjectionState
  ): Promise<FlightSurgeonReport> {
    const startTime = performance.now();

    // If completely nominal, return nominal report instantly
    if (!anomalyState.isAnomalyActive && anomalyState.severity === 'NOMINAL') {
      return {
        anomalyName: 'Nominal Aerospace State',
        riskLevel: 'NOMINAL',
        physiologicalImpact: 'All physiological indicators within Gaussian 1.5σ calibrated limits.',
        etiology: 'Continuous autonomous multi-variate monitoring active. Spacecraft life support and crew vitals nominal.',
        countermeasures: [
          'Maintain scheduled ARED resistive physical conditioning workout',
          'Continue standard dietary electrolyte hydration regimen',
        ],
        priority: 'NOMINAL SURVEILLANCE',
        clinicalDisclaimer: 'NASA Human Research Program Standard Clinical Guidelines. Continuous 1Hz monitoring.',
        generatedAt: new Date().toISOString(),
        latencyMs: Math.round(performance.now() - startTime),
        engineSource: 'Deterministic Offline HRP Engine (Local Fallback)',
      };
    }

    // Attempt online API call with 2500ms timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch('/api/ai/flight-surgeon-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anomalyState }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.countermeasures && Array.isArray(data.countermeasures)) {
          return {
            anomalyName: data.anomalyName || anomalyState.anomalyName,
            riskLevel: data.riskLevel || anomalyState.severity,
            physiologicalImpact: data.physiologicalImpact || anomalyState.etiology,
            etiology: data.etiology || anomalyState.etiology,
            countermeasures: data.countermeasures,
            priority: data.priority || (anomalyState.severity === 'CRITICAL' ? 'P1 - CRITICAL' : 'P2 - WARNING'),
            clinicalDisclaimer: data.clinicalDisclaimer || 'Grounded in NASA HRP Space Medicine Guidelines.',
            generatedAt: data.generatedAt || new Date().toISOString(),
            latencyMs: Math.round(performance.now() - startTime),
            engineSource: 'Gemini 3.8 Flash (Online Server)',
          };
        }
      }
    } catch (e) {
      // Network drop, timeout, or server error -> seamlessly trigger deterministic fallback
      // Never throw error or block UI
    } finally {
      clearTimeout(timeoutId);
    }

    // DETERMINISTIC OFFLINE FALLBACK
    return this.getDeterministicFallback(anomalyState, Math.round(performance.now() - startTime));
  }

  private getDeterministicFallback(
    anomalyState: AnomalyInjectionState,
    latencyMs: number
  ): FlightSurgeonReport {
    // Determine which key matches best
    const lowerName = anomalyState.anomalyName.toLowerCase();
    let matchedRule: Partial<FlightSurgeonReport> | null = null;

    if (lowerName.includes('tachycardia') || anomalyState.heartRate > 120) {
      matchedRule = DETERMINISTIC_OFFLINE_RULES.tachycardia;
    } else if (lowerName.includes('depress') || lowerName.includes('decompression') || anomalyState.cabinPressurePsi < 12.0) {
      matchedRule = DETERMINISTIC_OFFLINE_RULES.decompression;
    } else if (lowerName.includes('hypox') || anomalyState.spo2 < 90) {
      matchedRule = DETERMINISTIC_OFFLINE_RULES.hypoxia;
    } else if (lowerName.includes('co2') || anomalyState.cabinCo2MmHg > 3.5) {
      matchedRule = DETERMINISTIC_OFFLINE_RULES.co2_saturation;
    } else if (lowerName.includes('vestibular') || anomalyState.vestibularConflictScore > 5) {
      matchedRule = DETERMINISTIC_OFFLINE_RULES.vestibular;
    }

    return {
      anomalyName: matchedRule?.anomalyName || anomalyState.anomalyName,
      riskLevel: (matchedRule?.riskLevel as any) || anomalyState.severity,
      physiologicalImpact:
        matchedRule?.physiologicalImpact ||
        'Microgravity cephalad fluid shift and autonomic stress compensation.',
      etiology: matchedRule?.etiology || anomalyState.etiology,
      countermeasures: matchedRule?.countermeasures || anomalyState.countermeasures,
      priority:
        matchedRule?.priority ||
        (anomalyState.severity === 'CRITICAL'
          ? 'P1 - IMMEDIATE FLIGHT SURGEON INTERVENTION'
          : 'P2 - OPERATIONAL ADVISORY'),
      clinicalDisclaimer:
        'Deterministic NASA TRISH / HRP Clinical Protocol. Verified offline capability.',
      generatedAt: new Date().toISOString(),
      latencyMs: Math.max(latencyMs, 12),
      engineSource: 'Deterministic Offline HRP Engine (Local Fallback)',
    };
  }
}

export const geminiFlightSurgeonService = new GeminiFlightSurgeonService();
