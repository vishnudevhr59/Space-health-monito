/**
 * SPACE HEALTH MONITO — Database Store Bridge
 * Connects high-level store access directly to the ACID persistent disk engine.
 */

import { db } from './persistence.js';
import {
  IUser,
  IAstronautProfile,
  IPhysiologicalTelemetry,
  ISleepRecord,
  IActivityRecord,
  IRadiationMeasurement,
  IHealthAlert,
  IMLAnalysisResult,
  IWellnessAssessment,
  IResearchReference,
} from './models.js';

export class SpaceHealthStoreBridge {
  get users(): IUser[] {
    return db.data.users;
  }
  set users(val: IUser[]) {
    db.data.users = val;
    db.save();
  }

  get astronauts(): IAstronautProfile[] {
    return db.data.astronauts;
  }
  set astronauts(val: IAstronautProfile[]) {
    db.data.astronauts = val;
    db.save();
  }

  // Maps measurements to telemetry collection in persistent DB
  get measurements(): any[] {
    return db.data.telemetry;
  }
  set measurements(val: any[]) {
    db.data.telemetry = val;
    db.save();
  }

  get sleepRecords(): ISleepRecord[] {
    return db.data.sleepRecords;
  }
  set sleepRecords(val: ISleepRecord[]) {
    db.data.sleepRecords = val;
    db.save();
  }

  get activityRecords(): IActivityRecord[] {
    return db.data.activityRecords;
  }
  set activityRecords(val: IActivityRecord[]) {
    db.data.activityRecords = val;
    db.save();
  }

  get radiationRecords(): any[] {
    return db.data.radiation;
  }
  set radiationRecords(val: any[]) {
    db.data.radiation = val;
    db.save();
  }

  get alerts(): IHealthAlert[] {
    return db.data.alerts;
  }
  set alerts(val: IHealthAlert[]) {
    db.data.alerts = val;
    db.save();
  }

  get aiAnalyses(): any[] {
    return db.data.mlAnalyses;
  }
  set aiAnalyses(val: any[]) {
    db.data.mlAnalyses = val;
    db.save();
  }

  get wellnessAssessments(): IWellnessAssessment[] {
    return db.data.wellnessAssessments;
  }
  set wellnessAssessments(val: IWellnessAssessment[]) {
    db.data.wellnessAssessments = val;
    db.save();
  }

  get researchReferences(): IResearchReference[] {
    return db.data.researchReferences;
  }
  set researchReferences(val: IResearchReference[]) {
    db.data.researchReferences = val;
    db.save();
  }

  public save() {
    return db.save();
  }
}

export const store = new SpaceHealthStoreBridge();
