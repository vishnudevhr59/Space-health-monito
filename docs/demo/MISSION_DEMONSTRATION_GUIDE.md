# SPACE HEALTH MONITOR — End-to-End Mission Demonstration Guide
**Project:** SPACE HEALTH MONITOR  
**Challenge:** NASA Space Apps Challenge 2026 — Long-Duration Astronaut Health & Decision Support  
**Target Habitat:** Lunar Orbital Gateway (HALO Module, Node 2)  
**Evaluator Target Audience:** NASA Space Apps Challenge Judges, Aerospace Engineers, Biomedical Evaluators  

---

## 1. Executive Summary & Evaluation Philosophy

SPACE HEALTH MONITOR is not an ordinary healthcare dashboard. It is an aerospace-grade **health-monitoring, multi-variate anomaly detection, and autonomous clinical decision-support application** engineered specifically for the extreme conditions of deep-space exploration.

To ensure transparent and rigorous evaluation, the application provides an integrated **7-Stage Guided Mission Tour** that walks judges and evaluators through every operational capability without requiring manual configuration or guesswork.

---

## 2. Accessing the 7-Stage Guided Tour

1. Open the application URL (or local development server at `http://localhost:3000`).
2. Observe the **Cinematic Startup Splash Screen**:
   - Notice authentic, live subsystem connectivity probes executing in real-time (`Express API :3000`, `Python ML Engine :5050`, `Atomic Database`, and `Offline Telemetry Queue`).
   - Click **"Open Mission Control"** or wait for the automatic transition to the **Mission Brief**.
3. In the persistent **Mission Simulation Bar** (Row 3, immediately below the header), click the bright cyan button:  
   `[▶ START 7-STAGE GUIDED TOUR]`
4. Use the **Previous** and **Next Stage** buttons or click any of the 7 stepper dots to step through the entire mission scenario.

---

## 3. Detailed Walkthrough: The 7 Demonstration Stages

### Stage 1: Startup & Mission Initialization
- **Target View:** `Mission Brief` (`landing`)
- **Crew Profile:** Commander Sarah Chen, Ph.D. (`EXP-72-CDR`, Artemis Gateway Expedition 04, Mission Day 142).
- **Key Concepts Highlighted:**
  - Capability Integrity & Honest Labeling: System clearly labels all simulated telemetry streams.
  - Transparent data provenance badges linking to NASA baseline research datasets.
  - Zero mock fallbacks: Real Python microservice and atomic persistence backend are live.

### Stage 2: Mission Brief & Flight Objectives
- **Target View:** `Mission Brief` (`landing`)
- **Key Concepts Highlighted:**
  - Microgravity physiological risk profile: Cardiovascular deconditioning, fluid cephalad shift, bone mineral resorption (-0.85%/month), and galactic cosmic ray exposure (78.4 mSv accumulated against a 250 mSv career limit).
  - Ground station telemetry link parameters (DSN Ka-band vs. Lunar Occultation).

### Stage 3: Mission Dashboard & Live Telemetry
- **Target View:** `Mission Dashboard` (`dashboard`)
- **Key Concepts Highlighted:**
  - Continuous physiological telemetry: Resting Heart Rate (64 BPM), Oxygen Saturation (98.4%), Core Body Temperature (37.1°C), and HRV (58 ms).
  - 7-Tier Telemetry Quality Badges: `VERIFIED`, `ESTIMATED`, `SIMULATED`, `DEGRADED`.
  - Immediate manual vital logging with offline queue support via **Quick Action → Log Vitals**.

### Stage 4: AI Health Analysis & Anomaly Isolation
- **Target View:** `AI Health Analysis` (`ai-analysis`)
- **Active Scenario:** Scenario B (Gradual Health Measurement Deviation).
- **Key Concepts Highlighted:**
  - Pure-Python Vectorized Isolation Forest (`v4.3.0` on port 5050) detects subtle multi-variate deviation (Anomaly Score = 0.84, `PRIORITY REVIEW`).
  - Feature Attribution Decomposition: Z-Score for resting heart rate (+2.6σ) and depressed HRV (-49%).
  - Multi-System Context Correlation Engine: Computes Pearson $r = -0.74$ between cumulative sleep deficit and resting tachycardia.
  - Mandatory Medical Guardrail: Explicit disclaimer that statistical correlation does NOT assert clinical causation.

### Stage 5: Health Alerts & Clinical Human Review
- **Target View:** `Alerts System` (`alerts`)
- **Key Concepts Highlighted:**
  - Prioritized 5-state alert lifecycle (`New` → `Under Review` → `Acknowledged` → `Resolved` / `Dismissed`).
  - Flight Surgeon review workflow: Acknowledge the alert, select structured clinical action (electrolyte hydration, HRV biofeedback), and record non-destructive audit log.

### Stage 6: MONITO AI Clinical Decision Support
- **Target View:** `MONITO AI` (`monito-ai`)
- **Key Concepts Highlighted:**
  - Grounded aerospace medical reasoning powered by Gemini with deterministic offline NASA knowledge fallback.
  - Every insight is referenced to genuine peer-reviewed studies (NASA Twins Study, ESA/NASA ThermoLab core temperature study, NASA HRP Autonomic Regulation).
  - DOIs and dataset identifiers (`NASA OSDR GL-DS-8841`) are verifiable.

### Stage 7: Mission Health Reports & Shift Handover
- **Target View:** `Reports` (`reports`)
- **Key Concepts Highlighted:**
  - Official Mission Medical Intelligence Dossier with printable PDF stylesheet.
  - **Flight Surgeon Shift Handover Briefing**: Access via **Quick Action → Shift Handover Briefing** to review 24h vitals summary, sign off with dual digital physician signatures (Outgoing: Dr. Marcus Vance; Incoming: Dr. Elena Rostova), and generate downloadable markdown briefing notes.

---

## 4. Capability Integrity Demonstration Highlights

1. **Simulated Emergency Beacon Demonstration:**
   - Click **Quick Action → Simulated Emergency Beacon**.
   - Note the prominent capability disclosure banner: *"LOCAL DEMONSTRATION ONLY: No actual connection to NASA Deep Space Network or emergency services."*
   - Click **"GENERATE SIMULATED BEACON PACKET"** to view the formatted CCSDS/NASA-MED-SIM JSON telemetry packet complete with SHA-256 cryptographic checksum.
2. **Astronaut Digital Twin:**
   - Navigate to **Health Monitoring** (`monitoring`).
   - In the header, toggle **"Digital Twin Model"**.
   - Click each organ node (Brain, Heart, Autonomic Axis, Core Thermoregulation, Proximal Femur Bone, Dosimeter) to inspect personalized setpoint shifts, Z-scores, microgravity mechanisms, and active countermeasures.

---

## 5. Verification Checklist for Evaluators

| Verification Item | Expected Observation | Evaluator Check |
|---|---|:---:|
| Startup Probes | Real-time checks for API (:3000), ML (:5050), DB, and Queue | [ ] PASS |
| Scenario B Active | Simulation starts at Scenario B (Gradual Deviation) | [ ] PASS |
| ML Anomaly Output | Isolation Forest score 0.0 - 1.0 with feature weights | [ ] PASS |
| Non-Causation Guardrail | Mandatory disclosure rendered on context correlation | [ ] PASS |
| Shift Handover Workflow | Dual digital sign-off and downloadable markdown note | [ ] PASS |
| Automated Tests | 17 Subsystem Suites (124+ automated tests passing) | [ ] PASS |
