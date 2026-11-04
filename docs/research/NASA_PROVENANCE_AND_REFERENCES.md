# NASA Research Provenance, Datasets & Scientific Traceability Registry
**Project:** SPACE HEALTH MONITO  
**Competition:** NASA Space Apps Challenge 2026  
**Document Classification:** Scientific Provenance & Ethical Boundary Registry  

---

## 1. Provenance Classification Standards
SPACE HEALTH MONITO enforces five strict data classifications to prevent misleading claims:

1. **`REAL_RESEARCH_DATA`**: Peer-reviewed, published research data or public NASA repository metrics (e.g., NASA OSDR, NASA GeneLab, NASA Human Research Program open science).
2. **`PUBLISHED_RESEARCH_FINDINGS`**: Established epidemiological or physiological principles documented in peer-reviewed aerospace literature.
3. **`SIMULATED_TELEMETRY`**: Numerically synthesized biotelemetry calibrated with published normal distributions (mean $\mu$, standard deviation $\sigma$) from NASA studies.
4. **`ILLUSTRATIVE_REFERENCE`**: Target clinical guidelines (e.g., resting HR 50–100 BPM) used for baseline comparison.
5. **`USER_ENTERED`**: Manual clinical observations entered directly by an astronaut or flight surgeon.
6. **`AI_GENERATED`**: Algorithmic decision-support suggestions formulated by Isolation Forest or LLM inference.

---

## 2. Verified Research Registry

### Reference 1: NASA Twins Study (Cardiovascular & Telomeric Dynamics)
- **Exact Title:** "The NASA Twins Study: A multidimensional analysis of a year-long human spaceflight"
- **Authors:** Francine E. Garrett-Bakelman, Michael Darshi, et al.
- **Journal & DOI:** *Science*, Vol 364, Issue 6436, eaau8650 (2019). [doi:10.1126/science.aau8650](https://doi.org/10.1126/science.aau8650)
- **NASA Dataset Identifier:** NASA OSDR / GeneLab [OSD-8841](https://osdr.nasa.gov/bio/repo/data/studies/OSD-8841)
- **Variables Used in Application:**
  - Resting Heart Rate: Pre-flight $\mu = 56.0$ BPM, In-flight $\mu = 62.4$ BPM (Units: BPM)
  - Heart Rate Variability (RMSSD): Pre-flight $\mu = 68.0$ ms, In-flight $\mu = 51.2$ ms (Units: ms)
  - Carotid Intima-Media Thickness (IMT): Monitored for vascular stiffness
- **Sample Size:** $N = 2$ (Twin pair: Scott Kelly in-flight, Mark Kelly ground control).
- **Study Limitations:** Very small sample size ($N=1$ flight subject). Findings establish individual longitudinal adaptation rather than broad population norms.
- **Application Utilization:** Calibrates baseline cardiovascular shift in `server.ts` and `server_ml.py`.

### Reference 2: NASA HRP Bone Fracture Risk & Countermeasures
- **Exact Title:** "Risk of Bone Fracture due to Spaceflight-induced changes to bone"
- **Official Source:** NASA Human Research Program (HRP) Evidence Report
- **URL:** [https://humanresearchroadmap.nasa.gov/risks/risk.aspx?i=103](https://humanresearchroadmap.nasa.gov/risks/risk.aspx?i=103)
- **Citation:** Sibonga, J. D., et al. (NASA Human Research Program, Johnson Space Center).
- **Variables Used in Application:**
  - Bone Mineral Density (BMD) Loss Rate: 1.0% to 1.5% per month unmitigated; slowed to 0.85% with Advanced Resistive Exercise Device (ARED).
  - Serum Osteocalcin & Urinary NTx markers.
- **Sample Size:** $N = 84$ long-duration crew members aboard Mir and ISS.
- **Study Limitations:** Resistance loading compliance variability and dietary caloric differences across missions.
- **Application Utilization:** Grounding for `BoneMusclePage.tsx` and bone mitigation projection models.

### Reference 3: Core Body Temperature in Microgravity (ThermoLab)
- **Exact Title:** "Increased core body temperature in astronauts during spaceflight ('Space Fever')"
- **Authors:** Alexander C. Stahn, et al.
- **Journal & DOI:** *Scientific Reports*, 7:16777 (2017). [doi:10.1038/s41598-017-15560-0](https://doi.org/10.1038/s41598-017-15560-0)
- **Variables Used in Application:**
  - Core Body Temperature: Rest elevation $+1.0^\circ\text{C}$ in-flight; Exercise elevation $+2.5^\circ\text{C}$
  - Heat dissipation impairment through convective loss reduction.
- **Sample Size:** $N = 11$ ISS crew members.
- **Study Limitations:** Core temperature monitored via forehead double-sensor heat flux; circadian phase shifts complicate exact circadian nadir identification.
- **Application Utilization:** Calibrates thermoregulatory anomaly detection in `server_ml.py`.

### Reference 4: Space Radiation permissible exposure limits
- **Official Source:** NASA-STD-3001, Vol 1, Revision B (Crew Health Standards)
- **URL:** [https://www.nasa.gov/hhp/standards](https://www.nasa.gov/hhp/standards)
- **Variables Used:** Permissible Exposure Limit (PEL) career and mission limits (250 mSv mission baseline, 600 mSv career limit).
- **Application Utilization:** Calibrates cumulative dosimeter monitoring in `EnvironmentPage.tsx` and Daily Briefing.

---

## 3. Prototype Disclaimer & Ethical Boundary
SPACE HEALTH MONITO is an academic research and technology demonstration prototype developed for the NASA Space Apps Challenge 2026.
It is **NOT** a certified medical diagnostic system, does not possess FDA 510(k) clearance, and is not authorized for autonomous clinical decision-making in spacecraft operations. All alerts and observations represent statistical pattern evaluations intended for flight surgeon review and crew situational awareness.
