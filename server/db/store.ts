import {
  IUser,
  IAstronautProfile,
  IHealthMeasurement,
  ISleepRecord,
  IActivityRecord,
  IRadiationExposureRecord,
  IHealthAlert,
  IAIAnalysisResult,
  IWellnessAssessment,
  IResearchReference,
} from './models.js';

export class SpaceHealthStore {
  users: IUser[] = [];
  astronauts: IAstronautProfile[] = [];
  measurements: IHealthMeasurement[] = [];
  sleepRecords: ISleepRecord[] = [];
  activityRecords: IActivityRecord[] = [];
  radiationRecords: IRadiationExposureRecord[] = [];
  alerts: IHealthAlert[] = [];
  aiAnalyses: IAIAnalysisResult[] = [];
  wellnessAssessments: IWellnessAssessment[] = [];
  researchReferences: IResearchReference[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Initial Users
    this.users = [
      {
        id: 'usr-1',
        email: 'sarah.chen@spacehealth.nasa.gov',
        passwordHash: 'sha256_placeholder_token_astronaut_chen',
        fullName: 'CDR Sarah Chen, Ph.D.',
        role: 'Astronaut',
        assignedCrewId: 'astro-1',
        badgeNumber: 'EXP-72-CDR',
        createdAt: '2026-01-15T00:00:00.000Z',
      },
      {
        id: 'usr-2',
        email: 'flight.surgeon@spacehealth.nasa.gov',
        passwordHash: 'sha256_placeholder_token_med_specialist',
        fullName: 'Dr. Evelyn Reed, M.D.',
        role: 'Mission Health Specialist',
        badgeNumber: 'JSC-FLTSURG-09',
        createdAt: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'usr-3',
        email: 'flight.director@spacehealth.nasa.gov',
        passwordHash: 'sha256_placeholder_token_admin',
        fullName: 'Marcus Vance',
        role: 'Administrator',
        badgeNumber: 'NASA-ADMIN-01',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    // 2. Astronaut Profiles
    this.astronauts = [
      {
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
      {
        id: 'astro-2',
        userId: 'usr-4',
        name: 'Liam Davies',
        callsign: 'Atlas',
        mission: 'Artemis Gateway Expedition 04',
        destination: 'Lunar Orbital Gateway',
        missionDay: 142,
        totalDaysInSpace: 142,
        bloodType: 'A-Positive',
        age: 42,
        heightCm: 184,
        weightKg: 81.2,
        baselineVitals: {
          restingHeartRate: 62,
          systolicBP: 118,
          diastolicBP: 76,
          spo2: 98.1,
          bodyTempC: 36.7,
          hrvMs: 54,
        },
        radiationCumulativeMSv: 82.1,
        radiationMissionLimitMSv: 250.0,
        boneDensityLossRatePercentPerMonth: 1.15,
        currentStatus: 'Under Observation',
      },
      {
        id: 'astro-3',
        userId: 'usr-5',
        name: 'Amina Al-Mansoor',
        callsign: 'Starlight',
        mission: 'Mars Transit Habitat Simulation',
        destination: 'Mars Transit Habitat',
        missionDay: 218,
        totalDaysInSpace: 412,
        bloodType: 'B-Positive',
        age: 36,
        heightCm: 168,
        weightKg: 59.0,
        baselineVitals: {
          restingHeartRate: 55,
          systolicBP: 110,
          diastolicBP: 70,
          spo2: 98.8,
          bodyTempC: 36.5,
          hrvMs: 72,
        },
        radiationCumulativeMSv: 112.5,
        radiationMissionLimitMSv: 300.0,
        boneDensityLossRatePercentPerMonth: 0.65,
        currentStatus: 'Nominal',
      },
    ];

    // 3. Historical Telemetry Measurements (7-day timeline hourly & current)
    const baseDate = new Date();
    this.measurements = [];

    // Generate 7 days of 6-hour interval measurements for astro-1
    for (let i = 28; i >= 0; i--) {
      const time = new Date(baseDate.getTime() - i * 6 * 3600 * 1000);
      const isRecent = i <= 2;
      // Slight circadian cycle + exercise spikes
      const hourOfDay = time.getUTCHours();
      const circadianHrMod = Math.sin((hourOfDay - 6) * (Math.PI / 12)) * 8;
      const noise = (Math.random() - 0.5) * 4;
      
      const hr = Math.round(62 + circadianHrMod + noise);
      const spo2 = +(98.2 + (Math.random() - 0.5) * 0.8).toFixed(1);
      const temp = +(36.6 + (Math.random() - 0.5) * 0.3).toFixed(2);
      const sys = Math.round(114 + (Math.random() - 0.5) * 6);
      const dia = Math.round(74 + (Math.random() - 0.5) * 4);
      const hrv = Math.round(64 + (Math.random() - 0.5) * 12);
      const resp = Math.round(14 + (Math.random() - 0.5) * 2);

      this.measurements.push({
        id: `meas-${i}`,
        astronautId: 'astro-1',
        timestamp: time.toISOString(),
        heartRate: hr,
        spo2: Math.min(100, Math.max(94, spo2)),
        bodyTemperature: temp,
        bloodPressure: { systolic: sys, diastolic: dia },
        hrv,
        respiratoryRate: resp,
        perfusionIndex: +(3.8 + (Math.random() - 0.5) * 0.6).toFixed(2),
        isSimulated: true,
        dataQuality: isRecent ? 'High' : (i === 14 ? 'Partial Missing' : 'High'),
      });
    }

    // 4. Sleep Records (Past 14 Days)
    this.sleepRecords = [];
    for (let d = 14; d >= 0; d--) {
      const dt = new Date(baseDate.getTime() - d * 24 * 3600 * 1000);
      const dateStr = dt.toISOString().split('T')[0];
      const duration = +(6.2 + Math.random() * 1.8).toFixed(1);
      const efficiency = Math.round(82 + Math.random() * 14);

      this.sleepRecords.push({
        id: `slp-${d}`,
        astronautId: 'astro-1',
        date: dateStr,
        totalDurationHours: duration,
        deepSleepPercent: Math.round(18 + Math.random() * 8),
        remSleepPercent: Math.round(22 + Math.random() * 6),
        lightSleepPercent: Math.round(50 + Math.random() * 8),
        awakeningsCount: Math.floor(Math.random() * 4),
        circadianPhaseShiftHours: +((Math.random() - 0.5) * 1.4).toFixed(2),
        efficiencyPercent: efficiency,
        qualityRating: efficiency > 90 ? 5 : (efficiency > 80 ? 4 : 3),
        subjectiveRestfulness: duration >= 7.0 ? 'Restorative rest in sleep pod' : 'Mild disruption from ventilation acoustic resonance',
      });
    }

    // 5. Activity Records (ARED, CEVIS, T2 Treadmill)
    this.activityRecords = [];
    const exerciseTypes: Array<'ARED Resistive' | 'T2 Treadmill' | 'CEVIS Cycle Ergometer'> = [
      'ARED Resistive',
      'T2 Treadmill',
      'CEVIS Cycle Ergometer',
    ];

    for (let a = 14; a >= 0; a--) {
      const dt = new Date(baseDate.getTime() - a * 24 * 3600 * 1000);
      const dateStr = dt.toISOString().split('T')[0];
      const exType = exerciseTypes[a % 3];

      this.activityRecords.push({
        id: `act-${a}`,
        astronautId: 'astro-1',
        date: dateStr,
        exerciseType: exType,
        durationMinutes: exType === 'ARED Resistive' ? 65 : 45,
        caloriesBurned: exType === 'ARED Resistive' ? 480 : 420,
        peakHeartRate: exType === 'ARED Resistive' ? 148 : 162,
        averageHeartRate: exType === 'ARED Resistive' ? 122 : 138,
        workloadJoules: exType === 'ARED Resistive' ? 145000 : 180000,
        completionRatePercent: a === 3 ? 85 : 100,
        countermeasureAdherence: true,
      });
    }

    // 6. Radiation Exposure Records (Dosimeter timeline)
    this.radiationRecords = [];
    for (let r = 7; r >= 0; r--) {
      const dt = new Date(baseDate.getTime() - r * 24 * 3600 * 1000);
      const isSpeDay = r === 2; // Simulated small solar enhancement
      const doseRate = isSpeDay ? 38.5 : 18.2 + Math.random() * 4;

      this.radiationRecords.push({
        id: `rad-${r}`,
        astronautId: 'astro-1',
        timestamp: dt.toISOString(),
        sensorLocation: r % 2 === 0 ? 'Crew Quarters' : 'Personal Dosimeter',
        doseRateMicroSvPerHour: +doseRate.toFixed(1),
        accumulatedDailyMSv: +(doseRate * 24 / 1000).toFixed(3),
        cumulativeMissionMSv: +(74.0 + (7 - r) * 0.55).toFixed(2),
        solarActivityIndex: isSpeDay ? 'Minor SPE' : 'Quiet',
        shieldingFactor: 0.78,
      });
    }

    // 7. Health Alerts
    this.alerts = [
      {
        id: 'alt-101',
        astronautId: 'astro-1',
        astronautName: 'Sarah Chen',
        timestamp: new Date(baseDate.getTime() - 2.5 * 3600 * 1000).toISOString(),
        indicator: 'Heart Rate Variability (HRV)',
        severity: 'Warning',
        observedValue: '41 ms RMSSD',
        configuredThreshold: '< 48 ms baseline',
        title: 'Parasympathetic Tone Attenuation',
        reason: 'HRV dropped 28% below 14-day rolling baseline following consecutive shortened sleep cycles and high physical workload.',
        suggestedAction: 'Prioritize 30-minute scheduled rest pod downtime; review hydration volume (+500 mL electrolyte intake) and reduce evening screen exposure.',
        status: 'Active',
      },
      {
        id: 'alt-102',
        astronautId: 'astro-1',
        astronautName: 'Sarah Chen',
        timestamp: new Date(baseDate.getTime() - 14 * 3600 * 1000).toISOString(),
        indicator: 'Radiation Dosimeter Alert',
        severity: 'Advisory',
        observedValue: '38.5 μSv/h',
        configuredThreshold: '> 30.0 μSv/h',
        title: 'Transient GCR / Solar Particle Event Flux Spike',
        reason: 'Personal dosimeter detected elevation during passage through orbital high-latitude radiation sector.',
        suggestedAction: 'Remain in shielded Central Habitat Core during high-flux window. Mission radiation budget remains within Artemis cumulative safety limit (78.4 / 250 mSv).',
        status: 'Acknowledged',
        acknowledgedBy: 'Dr. Evelyn Reed (Flight Surgeon)',
        acknowledgedAt: new Date(baseDate.getTime() - 12 * 3600 * 1000).toISOString(),
      },
      {
        id: 'alt-103',
        astronautId: 'astro-2',
        astronautName: 'Liam Davies',
        timestamp: new Date(baseDate.getTime() - 8 * 3600 * 1000).toISOString(),
        indicator: 'Bone Density Biomarker (NTx)',
        severity: 'Warning',
        observedValue: '1.15% loss/mo projected',
        configuredThreshold: '> 1.00% loss/mo',
        title: 'Elevated Bone Resorption Rate',
        reason: 'Urine NTx cross-link assays indicate osteoclastic activity exceeding countermeasure mitigation threshold.',
        suggestedAction: 'Increase ARED heel-strike axial load protocol by 15%; verify bisphosphonate/calcitriol regimen compliance with Flight Surgeon.',
        status: 'Active',
      },
      {
        id: 'alt-104',
        astronautId: 'astro-1',
        astronautName: 'Sarah Chen',
        timestamp: new Date(baseDate.getTime() - 36 * 3600 * 1000).toISOString(),
        indicator: 'Biotelemetry Continuity',
        severity: 'Advisory',
        observedValue: '18 min packet loss',
        configuredThreshold: '> 15 min gap',
        title: 'Ground Station Handover Telemetry Gap',
        reason: 'Temporary Deep Space Network (DSN) antenna repointing caused missing vitals window.',
        suggestedAction: 'Local wearable storage successfully backfilled records. Data integrity restored.',
        status: 'Resolved',
      },
    ];

    // 8. AI Analysis Results (Anomaly detection & Explainable AI)
    this.aiAnalyses = [
      {
        id: 'ai-ana-01',
        astronautId: 'astro-1',
        timestamp: new Date(baseDate.getTime() - 1 * 3600 * 1000).toISOString(),
        overallRiskScore: 24,
        riskCategory: 'Low',
        anomaliesDetected: [
          {
            id: 'anom-1',
            metric: 'Heart Rate Recovery (Post-ARED)',
            deviationZScore: 2.14,
            baselineComparison: 'Recovery time: 4m 12s vs 2m 45s personal baseline',
            explanation: 'Post-exercise cardiovascular return to baseline was delayed by 87 seconds compared to the 30-day running average.',
            potentialRisk: 'Mild cumulative systemic fatigue or sub-clinical fluid redistribution shift (cephalad fluid shift typical in microgravity).',
            recommendedCountermeasure: 'Adjust next day cycle ergometer session to active recovery tempo (60% VO2 max); monitor orthostatic pressure.',
            evidenceConfidence: 0.89,
          },
          {
            id: 'anom-2',
            metric: 'Circadian Core Body Temp Rhythm',
            deviationZScore: 1.82,
            baselineComparison: 'Circadian phase acrophase shifted +1.2 hours forward',
            explanation: 'Core body temperature nadir shifted from 04:30 UTC to 05:45 UTC, matching ISS artificial 90-minute orbital sunrise/sunset cues.',
            potentialRisk: 'Sleep phase delay syndrome and daytime alertness latency.',
            recommendedCountermeasure: 'Enforce 460nm blue-enriched LED lighting protocol in workstation module from 08:00 to 16:00 UTC.',
            evidenceConfidence: 0.94,
          },
        ],
        correlations: [
          {
            factors: ['Sleep Duration (< 6.5h)', 'Next-Day Resting Heart Rate (+6 BPM)'],
            correlationCoefficient: 0.78,
            clinicalSignificance: 'Strong inverse coupling: Reduced sleep duration strongly predicts autonomic sympathetic overdrive next morning.',
          },
          {
            factors: ['ARED Resistive Force', 'Serum Osteocalcin'],
            correlationCoefficient: 0.86,
            clinicalSignificance: 'Positive countermeasure validation: High resistive loading stimulates osteoblast markers, attenuating microgravity bone demineralization.',
          },
        ],
        trendProjections: [
          {
            parameter: 'Bone Mineral Density (Lumbar Spine)',
            sevenDayProjection: 'Loss rate stable at 0.85%/mo (within target < 1.0%/mo with ARED)',
            trajectory: 'Stable',
          },
          {
            parameter: 'Cardiovascular Conditioning (VO2 Peak)',
            sevenDayProjection: 'Projected 94.2% of pre-flight baseline across next 30 days',
            trajectory: 'Improving',
          },
        ],
      },
    ];

    // 9. Wellness Assessments
    this.wellnessAssessments = [
      {
        id: 'well-1',
        astronautId: 'astro-1',
        timestamp: new Date(baseDate.getTime() - 24 * 3600 * 1000).toISOString(),
        moodScore: 8,
        stressLevel: 3,
        cognitiveFatigue: 4,
        confinementPerception: 3,
        socialCohesionScore: 9,
        notes: 'Good crew morale after successful payload relocation. Earth observation cupola time helped decompression.',
      },
      {
        id: 'well-2',
        astronautId: 'astro-1',
        timestamp: new Date(baseDate.getTime() - 72 * 3600 * 1000).toISOString(),
        moodScore: 7,
        stressLevel: 5,
        cognitiveFatigue: 6,
        confinementPerception: 4,
        socialCohesionScore: 8,
        notes: 'Demanding maintenance schedule on Environmental Control and Life Support System (ECLSS) CO2 scrubbers.',
      },
    ];

    // 10. Research References (Verified NASA HRP, OSDR, GeneLab, NTRS)
    this.researchReferences = [
      {
        id: 'nasa-ref-1',
        title: 'NASA Human Research Program: Risk of Microgravity-Induced Bone Loss and Early-Onset Osteoporosis',
        source: 'NASA Human Research Program',
        category: 'Microgravity & Bone/Muscle',
        url: 'https://humanresearchroadmap.nasa.gov/risks/risk.aspx?i=106',
        year: 2024,
        authors: 'NASA Human Research Program / Bone Discipline',
        summary: 'In weightlessness, astronauts lose an average of 1% to 1.5% of bone mineral density per month in weight-bearing bones (lumbar spine, proximal femur, calcaneus) without countermeasures. Advanced Resistive Exercise Device (ARED) combined with antiresorptive bisphosphonates reduces bone demineralization significantly.',
        keyFindings: [
          'Monthly bone mineral density loss of 1.0-1.5% without intensive resistive loading.',
          'ARED mechanical strain restores osteoblast mechanotransduction signaling.',
          'Serum NTx cross-links and pyridinoline serve as real-time indicators of bone resorption rate.',
        ],
        relevanceToAstronautMonitoring: 'Grounding for our Bone and Muscle tracking algorithms and automated alerts when bone resorption markers exceed configured thresholds.',
      },
      {
        id: 'nasa-ref-2',
        title: 'NASA Twins Study: Multi-Omics, Physiological, and Cognitive Analysis of a Year-Long Human Spaceflight',
        source: 'NASA Technical Reports (NTRS)',
        category: 'Cardiovascular',
        url: 'https://ntrs.nasa.gov/citations/20190013723',
        year: 2019,
        authors: 'Garrett-Bakelman, F. E., et al. (Science / NASA Twins Study)',
        summary: 'Comprehensive molecular and physiological comparison of identical twin astronauts (Scott and Mark Kelly) during a 340-day ISS mission. Observed carotid artery wall thickening, persistent sub-clinical inflammation, telomere dynamics, and mild post-flight cognitive processing deceleration.',
        keyFindings: [
          'Cardiovascular stiffening observed via intima-media thickness ultrasound.',
          'Sub-clinical immune activation and persistent cytokine fluctuations during spaceflight.',
          'Majority of genetic and physiological perturbations returned to baseline within 6 months post-landing.',
        ],
        relevanceToAstronautMonitoring: 'Provides clinical baseline curves for cardiovascular remodeling, arterial elasticity, and immune-inflammatory telemetry interpretation.',
      },
      {
        id: 'nasa-ref-3',
        title: 'NASA Space Radiation Risk Assessment: Galactic Cosmic Rays and Solar Particle Events in Deep Space Exploration',
        source: 'NASA Space Radiation Research',
        category: 'Space Radiation',
        url: 'https://www.nasa.gov/hrp/elements/radiation/',
        year: 2025,
        authors: 'Cucinotta, F. A., Kim, M. H., & NASA Space Radiation Laboratory (NSRL)',
        summary: 'Deep space missions outside low-Earth orbit (outside the protective geomagnetic magnetosphere) subject crews to High-Z and High-Energy (HZE) Galactic Cosmic Rays and unpredictable Solar Particle Events (SPE). Career and mission Permissible Exposure Limits (PEL) are calculated to prevent Radiation Carcinogenesis and Acute Radiation Syndrome.',
        keyFindings: [
          'Typical interplanetary dose rate: ~1.5 to 2.0 mSv/day during solar minimum.',
          'Cumulative 3-year Mars mission estimate: 1,000 mSv equivalent dose without habitat shielding storm shelters.',
          'Active polyethylene and hydrogen-rich water wall shielding attenuate secondary neutron backscatter.',
        ],
        relevanceToAstronautMonitoring: 'Underpins our Space Environment & Dosimeter Alert thresholds with real-time exposure accumulation calculations.',
      },
      {
        id: 'nasa-ref-4',
        title: 'NASA OSDR (Open Science Data Repository): Spaceflight-Induced Transcriptomic and Mitochondrial Dysregulation',
        source: 'NASA OSDR',
        category: 'Immune System',
        url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-137',
        year: 2024,
        authors: 'NASA GeneLab Multi-Omics Consortium / da Silveira, W. A., et al.',
        summary: 'Analysis of mammalian and human astronaut tissues across 59 spaceflight missions revealed systemic mitochondrial dysfunction, oxidative stress, and lipid metabolism reprogramming as central biological responses to spaceflight hazards.',
        keyFindings: [
          'Downregulation of mitochondrial electron transport chain complexes during long-duration flight.',
          'Oxidative stress markers correlate with high space radiation dosage and microgravity fluid shift.',
          'Targeted nutritional and pharmacological antioxidants show promising cellular protection.',
        ],
        relevanceToAstronautMonitoring: 'Informs predictive health risk scoring and mitochondrial fatigue indicators derived from metabolic and biotelemetry data.',
      },
      {
        id: 'nasa-ref-5',
        title: 'Behavioral Health and Performance: Confinement, Sleep Loss, and Circadian Desynchronization in Exploration Missions',
        source: 'Human Research Roadmap',
        category: 'Sleep & Behavioral',
        url: 'https://humanresearchroadmap.nasa.gov/evidence/reports/Sleep.pdf',
        year: 2023,
        authors: 'NASA Behavioral Health and Performance (BHP) Research Element',
        summary: 'Astronauts on orbit average less than 6.0 hours of sleep per night compared to 7.5 hours pre-flight, driven by circadian disruption, microgravity posture, elevated cabin CO2, and operational noise. Chronic sleep deficits reduce cognitive throughput, response latency, and emotional regulation.',
        keyFindings: [
          'Circadian phase shifting due to 16 orbital sunrises every 24 hours on ISS.',
          'Subjective sleep efficiency drops below 80% without strict sleep hygiene protocols.',
          'Dynamic solid-state light cues (blue-depleted light prior to sleep) improve REM latency and sleep continuity.',
        ],
        relevanceToAstronautMonitoring: 'Direct basis for our Sleep & Mental Wellness module, Pittsburgh Sleep Quality Index (PSQI) integration, and circadian guidance.',
      },
    ];
  }
}

export const store = new SpaceHealthStore();
