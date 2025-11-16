
export interface FormData {
  drug_list: string;
  otc_herbal: string;
  indications: string;
  age: string;
  sex: string;
  pregnancy_lactation: string;
  weight_bmi: string;
  renal_function: string;
  hepatic_function: string;
  comorbidities: string;
  allergies: string;
  baseline_tests: string;
  region: string;
  audience: 'clinician' | 'patient';
  summary_level: 'brief' | 'detailed';
  language: string;
}

export enum Severity {
  Contraindicated = 'contraindicated',
  Major = 'major',
  Moderate = 'moderate',
  Minor = 'minor',
  None = 'none',
}

export interface Interaction {
  pair_or_cluster: string;
  severity: Severity;
  evidence_level: string;
  mechanism: string;
  expected_clinical_effect: string;
  time_course: string;
  management: string;
  monitoring: string[];
}

export interface Alternative {
  target_issue: string;
  current_drug: string;
  proposed_alternative: string;
  rationale: string;
  notes: string;
}

export interface MonitoringPlan {
  labs: string[];
  vitals_ecg: string[];
  symptoms_to_watch: string[];
  follow_up: string;
}

export interface AnalysisResponse {
  patient_context: {
    age: number | null;
    sex: string | null;
    pregnancy_lactation: string | null;
    renal_function: string | null;
    hepatic_function: string | null;
    comorbidities: string[];
    allergies: string[];
    region: string | null;
  };
  inputs: {
    drugs: string[];
    otc_herbal_substances: string[];
    indications: string[];
  };
  assumptions: string[];
  summary: {
    highest_severity_found: Severity;
    interaction_count: number;
    top_risks: Interaction[];
    red_flags: string[];
  };
  detailed_findings: {
    drug_drug: Interaction[];
    drug_disease: Interaction[];
    drug_food: Interaction[];
    drug_herbal_otc: Interaction[];
    duplicate_therapy: Interaction[];
  };
  alternatives: Alternative[];
  monitoring_plan: MonitoringPlan;
  patient_counseling_points: string[];
  sources_to_verify: string[];
  disclaimer: string;
  markdown_summary: string;
}
