# Personalized Baseline Methodology & Statistical Validation
**SPACE HEALTH MONITO — NASA Space Apps Challenge 2026**  
**Document Reference:** `SHM-DOC-METH-2026-02`

---

## 1. The Core Scientific Premise

In terrestrial medicine, physiological vitals are frequently evaluated against **generalized population reference ranges** (e.g., standard adult resting heart rate 60–100 BPM). In human spaceflight, population averages are clinically inadequate and potentially hazardous:

1. **Astronaut Physical Conditioning:** Astronauts represent an exceptionally conditioned cohort; resting heart rates of 48–56 BPM and high vagal HRV tones are common nominal setpoints.
2. **Microgravity Cephalad Fluid Shift:** Weightlessness redistributes approximately 1.5 to 2.0 liters of venous blood and interstitial fluid towards the head and thorax, triggering central baroreceptor recalibration, decreased plasma volume, and adaptive resting tachycardia (+10–15%).
3. **Spacecraft Environmental Convection:** Impaired natural thermal convection in microgravity elevates resting core body temperatures by ~1.0°C ("space fever", Stahn et al., 2017).

Consequently, **individualized, longitudinal baseline modeling** is a non-negotiable architectural requirement.

---

## 2. Longitudinal Three-Phase Baseline Architecture

SPACE HEALTH MONITO establishes three distinct baseline epochs for every crew member:

```text
┌────────────────────────────────┐     ┌────────────────────────────────┐     ┌────────────────────────────────┐
│   Phase 1: Pre-Flight Norms    │     │    Phase 2: In-Flight Shift    │     │   Phase 3: Post-Flight Target  │
│         (L-90 to L-1)          │ ──► │            (T+142)             │ ──► │             (R+30)             │
│  Terrestrial Setpoints (1G)    │     │  Microgravity Reconditioned    │     │    Terrestrial Readaptation    │
│  HR: 56.0 ± 6.2 BPM            │     │  HR: 62.4 ± 5.8 BPM (+11.4%)   │     │  Target: 58.0 ± 6.0 BPM        │
└────────────────────────────────┘     └────────────────────────────────┘     └────────────────────────────────┘
```

---

## 3. Mathematical Formulation of Adaptive Z-Scores

### 3.1. Standardized Deviation Score
For any physiological metric $x_i$ observed at time $t$:

$$Z_i = \frac{x_i - \mu_{\text{baseline}}}{\sigma_{\text{baseline}}}$$

Where:
- $\mu_{\text{baseline}}$ is the sample mean of verified observations during the baseline window.
- $\sigma_{\text{baseline}}$ is the sample standard deviation.

### 3.2. Safe Zero-Variance Handling
In static sensors or homogeneous testing windows, sample variance $s^2$ may approach zero ($\sigma \to 0$), which would cause catastrophic division-by-zero errors. SPACE HEALTH MONITO enforces a **biophysically grounded minimum variance floor** ($\sigma_{\min}$):

$$\sigma_{\text{effective}} = \max\left(\sigma_{\text{computed}}, \sigma_{\min}\right)$$

Where $\sigma_{\min}$ values are calibrated from published NASA cohort norms:
- **Heart Rate:** $\sigma_{\min} = 2.0\text{ BPM}$
- **SpO2:** $\sigma_{\min} = 0.5\%$
- **Core Body Temperature:** $\sigma_{\min} = 0.15^\circ\text{C}$
- **HRV RMSSD:** $\sigma_{\min} = 3.0\text{ ms}$

### 3.3. Contamination Protection During In-Flight Updates
Baselines are **never updated** during periods marked by:
1. Active medical alerts (`Critical` or `Warning` status).
2. Recent strenuous exercise ($< 90\text{ minutes}$ post-ARED/CEVIS).
3. Degraded sensor quality flags (`POTENTIAL_SENSOR_ARTIFACT` or `UNUSUAL_OBSERVATION`).
4. Epistemic uncertainty penalties ($\lambda_{\text{impute}} < 0.70$).

This guarantees that physiological anomalies are not absorbed into the baseline, preventing "normalization of deviance."

---

## 4. Minimum Observation Sample Size Requirements

To prevent spurious statistical alerts caused by inadequate sample sizes:
- **Terrestrial Pre-Flight Baseline:** Requires a minimum of $N \ge 30$ distinct resting observation windows (spanning both circadian active and rest cycles).
- **In-Flight Rolling Baseline:** Requires $N \ge 14$ consecutive valid sols.
- **Insufficient Data Warning:** If $N < 14$, the system emits an explicit warning badge: `INSUFFICIENT_BASELINE_DATA` and disables automated Z-score thresholding until sufficient verified observations accumulate.

---

## 5. Clinical Decision Support Disclaimer

> **MANDATORY AEROSPACE MEDICAL NOTICE:**  
> A statistical deviation ($|Z| \ge 2.0\sigma$) is **not** inherently a medical emergency. Transient physiological deviations routinely occur in response to circadian phase shifts, high-workload EVA tasks, sleep phase awakenings, and habitat temperature fluctuations.  
> 
> SPACE HEALTH MONITO provides decision support triage to guide structured clinician review; it does not replace the clinical judgment of the assigned Flight Surgeon or Space Medicine Operations Division.
