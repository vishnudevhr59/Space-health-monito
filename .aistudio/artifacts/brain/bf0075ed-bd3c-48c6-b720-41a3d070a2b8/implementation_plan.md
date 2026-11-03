# SPACE HEALTH MONITO — Advanced AI/ML Health Intelligence Engine

An intelligent, explainable biotelemetry analytics engine for astronaut health monitoring during long-duration space exploration (Artemis Gateway Expedition 04), featuring Python-powered statistical and machine learning algorithms, Isolation Forest anomaly scoring, multi-variate correlation analysis, spaceflight physiological context interpretation, and evidence-grounded decision support.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and model decisions were confirmed during the Phase 1 clarification interview:

- **Confirmed Decision 1 (ML Service Orchestration)**: A dedicated Python REST ML service running on port `8000`, cleanly proxied by the Express backend at `/api/ml/*`, preserving Express as the primary application gateway.
- **Confirmed Decision 2 (Dataset Calibration)**: Anomaly detection models and Isolation Forest tree thresholds calibrated against published **NASA OSDR** (Open Science Data Repository) and **NASA Twins Study** normative distributions.
- **Confirmed Decision 3 (Anomaly Classification & Sensitivity)**: Dynamic sensitivity control ($1.5\sigma$ to $3.0\sigma$, default $2.0\sigma$) powering three non-diagnostic tiers: `NOMINAL`, `ATTENTION`, and `PRIORITY REVIEW`.

---

## 1. Overview & Core Concept

During deep-space transit and orbital gateway stays, communication latency (up to 24 minutes one-way on Mars trajectories) prevents real-time ground control intervention. The **SPACE HEALTH MONITO AI/ML Health Intelligence Engine** equips astronauts and flight surgeons with autonomous biotelemetry interpretation.

### Core Questions Answered by the Engine:
1. **What has changed?** Quantifies shifts in heart rate, HRV (RMSSD), SpO2, core body temperature, sleep architecture, and countermeasure power output.
2. **How does it compare to individual baselines?** Evaluates Z-scores, percentage deviations, and moving-window variance against the astronaut's pre-flight normative measurements.
3. **Are indicators changing together?** Computes bivariate Pearson correlation and cross-channel coupling (e.g., sleep loss predicting subsequent cardiac sympathetic acceleration).
4. **Is the observation anomalous?** Runs multi-dimensional Isolation Forest tree depth evaluations to isolate high-dimensional physiological outliers.
5. **What spaceflight factors are relevant?** Connects findings to microgravity cephalad fluid shifts, cosmic radiation ionizing flux, circadian phase delays, and mechanotransduction loss.
6. **What operational step is needed?** Recommends evidence-grounded non-diagnostic countermeasure adjustments (ARED load, electrolyte rehydration, blue-depleted lighting) and alerts flight surgeons when criteria are met.

---

## 2. User Experience & Visual Design

The UI integrates seamlessly into the existing mission-control design system (`#050816` midnight navy, `#0B1224` console background, `#101B30` glassmorphic cards, `#00E5FF` cyan accent, `#438BFF` electric blue, `#8B5CF6` purple, `#21D4A5` nominal green, `#FFB547` warning amber, and `#FF5368` critical rose).

### Upgrades to Existing Views:

#### A. DashboardPage — Live Physiological Trends Prominence
- Prominently positions the `LivePhysiologicalTrends` component at the apex of the dashboard telemetry stage.
- Plots 24 hours of dual-channel continuous telemetry (Heart Rate and SpO2) using Recharts.
- Shows dashed reference lines representing the astronaut's resting baseline (`58 BPM` and `98.4%`), hypoxia warning boundary (`95.0%`), and a shaded nominal tolerance corridor.
- Displays interactive hover tooltips highlighting exact deviations ($\Delta \text{BPM}$ and $\Delta \text{SpO2}$) and outlier markers for transient excursions.

#### B. AiAnalysisPage — Comprehensive AI Health Intelligence Center
- **Health Intelligence Summary Ribbon**: Displays total measurements analyzed, active anomalies flagged, model sensitivity status, data completeness (e.g., 99.4%), and last inference timestamp.
- **Interactive Z-Score Sensitivity Slider**: Real-time slider from $1.5\sigma$ to $3.0\sigma$ that immediately updates chart outlier flags and triage cards.
- **Multivariate Correlation Matrix**: Heatmap grid showing Pearson $r$ values between Sleep Duration, Resting Heart Rate, Core Temperature, HRV RMSSD, and Daily Exercise Load.
- **Personalized 3-Phase Baseline Visualizer**: Interactive chart comparing health indicators across **Pre-Flight Baseline**, **During Spaceflight (T+142)**, and **Post-Flight Target Range**.
- **Five-Point Explainable AI (XAI) Cards**:
  1. *What Changed?* (biomarker delta and rate of shift)
  2. *Historical Comparison* (z-score against 30-sol baseline)
  3. *Why Was It Flagged?* (statistical algorithm and threshold triggered)
  4. *Spaceflight Context* (biological mechanism and NASA research reference)
  5. *Next Action* (countermeasure recommendation or clinical triage)

#### C. MonitoAiPage — Data-Aware Research Assistant
- Connects MONITO AI directly to the live Python ML inference outputs and the NASA Research Knowledge Base.
- Allows natural-language queries such as:
  - *"Compare my current heart rate with my pre-flight baseline."*
  - *"What anomalies were flagged in the last 24 hours and why?"*
  - *"Explain how microgravity fluid shifts correlate with my recent HRV measurements."*

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Python Service Architecture** | Native Python HTTP microservice on port 8000 using standard library math/statistics/json/socketserver, proxied via Express | Operates with 100% reliability in restricted sandboxes without requiring external pip dependencies; delivers true Python execution | Python script spawn per request (high overhead) or external cloud microservice (network egress / sandbox constraints) |
| **Isolation Forest Engine** | Pure-Python vectorized Isolation Forest tree ensemble ($t=100$ trees, sub-sample size $\psi=256$) | Provides deterministic, zero-dependency anomaly score calculation $s(x,n) = 2^{-\frac{E(h(x))}{c(n)}}$ without heavy C-extension compilation | Scikit-learn binary dependency (not preinstalled in environment) |
| **Scientific Safety Boundary** | Strict non-diagnostic advisory labels; all anomaly tiers categorized as `NOMINAL`, `ATTENTION`, or `PRIORITY REVIEW` | Complies with medical safety standards and NASA Space Apps Challenge research guidelines | Diagnostic claims or simulated treatment prescriptions |
| **Correlation vs Causation** | Prominent visual badge and tooltips labeling all bivariate correlations as *statistical associations* | Prevents cognitive bias and false causal assumptions during mission operations | Unannotated correlation coefficients |

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER FRONTEND (React)                          │
│                                                                             │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────┐  │
│  │ LivePhysiological     │ │ AiAnalysisPage        │ │ MonitoAiPage      │  │
│  │ Trends (Recharts)     │ │ (XAI & Baseline HUD)  │ │ (Grounded Chat)   │  │
│  └───────────┬───────────┘ └───────────┬───────────┘ └─────────┬─────────┘  │
└──────────────┼─────────────────────────┼───────────────────────┼────────────┘
               │                         │                       │
               ▼                         ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS / EXPRESS BACKEND (Port 3000)                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ REST Gateway Routes:                                                  │  │
│  │   /api/telemetry/*  ·  /api/astronauts/*  ·  /api/ai/chat             │  │
│  │   /api/ml/*  --->  Reverse Proxy to Python ML Service                 │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌───────────────────────────────┐  │  ┌─────────────────────────────────┐  │
│  │ In-Memory & MongoDB Store     │  │  │ Background Python Process Mgr   │  │
│  │ (10 collections / 200+ docs)  │  │  │ (Spawns and monitors Port 8000) │  │
│  └───────────────────────────────┘  │  └────────────────┬────────────────┘  │
└─────────────────────────────────────┼───────────────────┼───────────────────┘
                                      │ HTTP Request      │
                                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PYTHON ML SERVICE (Port 8000)                         │
│                                                                             │
│  ┌─────────────────────────────┐     ┌───────────────────────────────────┐  │
│  │ HTTP Request Dispatcher     │     │ Anomaly Detection Engine          │  │
│  │ - POST /api/ml/analyze      │────>│ - Isolation Forest Scoring        │  │
│  │ - POST /api/ml/anomaly      │     │ - Dynamic Z-Score / MAD Filtering │  │
│  │ - POST /api/ml/trends       │     │ - Three-Tier Triage Classification│  │
│  │ - POST /api/ml/correlation  │     └─────────────────┬─────────────────┘  │
│  │ - POST /api/ml/baseline     │                       │                    │
│  │ - GET  /api/ml/model-status │                       ▼                    │
│  └─────────────────────────────┘     ┌───────────────────────────────────┐  │
│                                      │ Spaceflight Context Engine        │  │
│                                      │ - Microgravity / Cephalad Shifts  │  │
│                                      │ - GCR / SPE Dosimetry Exposure    │  │
│                                      │ - Circadian Rhythm Delay          │  │
│                                      │ - Explainable AI (XAI) Synthesis  │  │
│                                      └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### API Endpoints Specification

1. `POST /api/ml/analyze`: Full suite analysis executing baseline deviation, Isolation Forest, trend detection, and correlation.
2. `POST /api/ml/anomaly-detection`: Statistical outlier detection with configurable sensitivity slider threshold ($1.5\sigma$ to $3.0\sigma$).
3. `POST /api/ml/trend-analysis`: Windowed time-series analysis across $24\text{h}$, $7\text{d}$, $14\text{d}$, and $30\text{d}$ with moving averages and slope direction.
4. `POST /api/ml/correlation`: Bivariate Pearson coefficients across physiological and environmental metrics.
5. `POST /api/ml/baseline-comparison`: Tri-phase comparison across Pre-Flight, In-Flight, and Post-Flight ranges.
6. `GET /api/ml/model-status`: Health and calibration status of the Python Isolation Forest and NASA OSDR reference baseline.

---

## 5. Implementation Roadmap

1. **Python ML Engine (`server_ml.py`)**:
   - Create self-contained Python HTTP server on port 8000.
   - Implement pure-Python Isolation Forest ensemble and rolling statistical analytics.
   - Implement NASA OSDR and Twins Study calibration distributions.
   - Implement the Spaceflight Physiological Context generator and 5-point XAI constructor.
2. **Express Backend Proxy & Process Management (`server.ts`)**:
   - Ensure `server.ts` auto-spawns and monitors `python3 server_ml.py`.
   - Mount `/api/ml/*` reverse proxy endpoints with robust fallback handling.
3. **Frontend Integration & Component Enhancements**:
   - Ensure `LivePhysiologicalTrends` in `src/pages/DashboardPage.tsx` actively displays 24h continuous data with dashed baseline reference lines.
   - Wire `src/pages/AiAnalysisPage.tsx` to the live `/api/ml/*` endpoints with the interactive sensitivity slider and 3-phase baseline visualizer.
   - Connect `src/pages/MonitoAiPage.tsx` with ML inference context for grounded assistant dialogues.
4. **Verification**:
   - Test all Python endpoints via curl.
   - Run `lint_applet` (`tsc --noEmit`).
   - Run `compile_applet` (`npm run build`).
