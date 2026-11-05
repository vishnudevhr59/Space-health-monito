# SPACE HEALTH MONITO — Demonstration Scenarios & Expected Results Matrix
**Document:** `DEMO_SCENARIO_AND_EXPECTED_RESULTS.md`  
**Classification:** Spaceflight Medical Simulation Reference  
**Mission Habitat:** Lunar Gateway (HALO Module, Node 2)  

---

## 1. Overview

SPACE HEALTH MONITO embeds four deterministic, pre-configured spaceflight simulation scenarios accessible from the persistent **Mission Simulation Bar** (Row 3). This document defines the exact telemetry inputs, expected physiological responses, anomaly detection scores, and clinical alerts triggered across each step of every scenario.

---

## 2. Scenario A: Normal Operations Baseline

- **Scenario Identifier:** `SCENARIO_A`
- **Objective:** Establish the healthy microgravity physiological baseline for CDR Sarah Chen after 142 days in lunar orbit.
- **Max Steps:** 4 steps
- **Comm Link Status:** Continuous `ONLINE` (DSN Ka-Band active)

| Step # | Event Title | Heart Rate | SpO2 | Core Temp | HRV | ML Anomaly Score | Triage Status | Expected Alert |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **0** | Baseline Microgravity Rest | 62 BPM | 98.6% | 36.6°C | 64 ms | 0.08 | `NOMINAL` | None (All nominal) |
| **1** | Post-Prandial Routine Duty | 66 BPM | 98.4% | 36.7°C | 60 ms | 0.12 | `NOMINAL` | None |
| **2** | ARED Exercise Countermeasure | 148 BPM | 97.8% | 37.4°C | 28 ms | 0.22 | `NOMINAL` | None (Expected exercise strain) |
| **3** | Evening Rest & Recovery | 60 BPM | 98.7% | 36.5°C | 68 ms | 0.07 | `NOMINAL` | None |

---

## 3. Scenario B: Gradual Health Measurement Deviation (ACTIVE DEFAULT)

- **Scenario Identifier:** `SCENARIO_B`
- **Objective:** Demonstrate the core value proposition of SPACE HEALTH MONITO: detecting subtle multi-variate autonomic fatigue and resting tachycardia before acute clinical failure occurs.
- **Max Steps:** 6 steps
- **Comm Link Status:** Continuous `ONLINE`

| Step # | Event Title | Heart Rate | SpO2 | Core Temp | HRV | ML Anomaly Score | Triage Status | Triggered Alert & Action |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **0** | Nominal Rest Baseline | 64 BPM | 98.4% | 36.6°C | 62 ms | 0.09 | `NOMINAL` | None |
| **1** | Subtle Sub-Clinical Elevation | 72 BPM | 98.2% | 36.8°C | 52 ms | 0.31 | `ATTENTION` | None (Within ±1.5σ) |
| **2** | Mild Nocturnal Tachycardia | 78 BPM | 98.0% | 36.9°C | 44 ms | 0.54 | `ATTENTION` | Advisory notice in daily briefing |
| **3** | Multi-Sol Cumulative Fatigue | 82 BPM | 97.8% | 37.0°C | 38 ms | 0.72 | `PRIORITY REVIEW` | Advisory: Autonomic fatigue trend |
| **4** | Context Correlation Discovery | 86 BPM | 97.6% | 37.1°C | 35 ms | 0.81 | `PRIORITY REVIEW` | Pearson $r = -0.74$ between sleep deficit & HR |
| **5** | Clinical Triage Alert Triggered | 89 BPM | 97.4% | 37.2°C | 32 ms | 0.88 | `PRIORITY REVIEW` | **Warning Alert:** "Persistent Resting Tachycardia & Autonomic Fatigue". Action: +750mL oral electrolytes, 20-min resonant breathing. |

---

## 4. Scenario C: Sensor Failure & Poor Data Quality

- **Scenario Identifier:** `SCENARIO_C`
- **Objective:** Demonstrate 7-tier telemetry classification, preservation of raw observations without silent deletion, and detection of transducer detachment.
- **Max Steps:** 5 steps
- **Comm Link Status:** Continuous `ONLINE`

| Step # | Event Title | Heart Rate | SpO2 | Perfusion Index | Ingest Classification | Storage Target | Expected System Action |
|:---:|---|:---:|:---:|:---:|---|---|---|
| **0** | Nominal Transducer Signal | 65 BPM | 98.4% | 3.8 | `NOMINAL` | Ingested Telemetry | Verified telemetry stream |
| **1** | Intermittent Coupling Loss | 70 BPM | 95.8% | 0.35 | `UNUSUAL_OBSERVATION` | Ingested Telemetry | Optical signal quality warning |
| **2** | Packet Clock Skew (>6m) | 68 BPM | 96.0% | 0.22 | `STALE_MEASUREMENT` | Ingested Telemetry | Packet timestamp drift flagged |
| **3** | Impossible Sensor Artifact | 245 BPM | 91.0% | 0.10 | `POTENTIAL_SENSOR_ARTIFACT` | **Raw Observations** (`/api/telemetry/raw-observations`) | Rejected from ML inference; **Preserved** in raw store |
| **4** | Transducer Signal Disconnect | 66 BPM | 98.0% | 0.00 | `REQUIRES_HUMAN_REVIEW` | Raw Observations + Alert | **Advisory Alert:** "Pulse Oximeter Transducer Signal Loss". Prompts sensor repositioning. |

---

## 5. Scenario D: Deep-Space Communication Interruption

- **Scenario Identifier:** `SCENARIO_D`
- **Objective:** Demonstrate autonomous edge operation during lunar far-side occultation, local persistent queueing (`PENDING_SYNC`), and seamless recovery sync.
- **Max Steps:** 5 steps

| Step # | Event Title | Comm Status | Link State | Edge Processing Mode | Queue State | Recovery Action |
|:---:|---|:---:|:---:|---|:---:|---|
| **0** | DSN Link Nominal | `ONLINE` | Ka-band locked | Server-side Gemini + Python ML | Empty (0 pending) | Streaming to MCC-Houston |
| **1** | Occultation Ingress | `OFFLINE` | Radio shadow | Edge-autonomous fallback activated | Queue active | UI displays `CACHED (OFFLINE)` |
| **2** | Local Autonomous Mode | `OFFLINE` | Radio shadow | Local Pure-Python Isolation Forest on :5050 | Accumulating | Zero data lost |
| **3** | Local Manual Vital Log | `OFFLINE` | Radio shadow | Idempotency key generated (`offlineSyncService`) | 1+ pending sync | Optimistic UI update |
| **4** | Occultation Egress | `ONLINE` | Ka-band reacquired | Exponential backoff flush triggered | **0 pending (FLUSHED)** | Telemetry synchronized to persistence |
