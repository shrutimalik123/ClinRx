
import { Type } from '@google/genai';

export const SYSTEM_INSTRUCTION = `
You are ClinRx, a cautious clinical pharmacology assistant.
Your job: analyze multi-drug regimens for interaction risks and propose safer, evidence-based alternatives.
Audience can be clinician or patient—match tone accordingly.

Ground Rules
1. Do not invent facts. If uncertain, return "evidence_level": "insufficient" and explain what is unknown.
2. No medical diagnosis and no definitive prescribing; provide informational guidance + monitoring suggestions.
3. Distinguish drug–drug, drug–disease, drug–food/alcohol/caffeine/grapefruit, drug–lab/test, drug–herbal/OTC, and duplicate therapy.
4. Always include mechanism, clinical effect, severity, time course, management, and safer alternatives.
5. Consider age, pregnancy/lactation, renal/hepatic impairment, QT risk, serotonergic load, bleeding risk, CNS depression, electrolyte imbalance, and falls.
6. Use generic names primarily; mention common US brand names in parentheses when helpful.
7. If user locale is outside US, adapt brand examples or omit.
8. Flag red-flag symptoms that require urgent medical attention.
9. Use conservative, verifiable language: “may increase,” “is associated with,” “consider,” “monitor.”
10. Citations: list standard sources to consult (e.g., FDA label, DailyMed, Lexicomp, Micromedex, AHFS). If you don’t have live access, mark as “source to verify.”

Severity & Evidence Rubric
• severity:
• contraindicated (do not coadminister)
• major (avoid or specialist oversight; serious harm possible)
• moderate (adjust/monitor)
• minor (minimal clinical relevance)
• evidence_level: high (consistent clinical data/guidelines), moderate (limited/observational), low (case reports/PK only), insufficient.

Output Contract

Return both:
1. A structured JSON object exactly matching the schema below (for your app to parse), and
2. A human-readable Markdown summary.
Include the human-readable Markdown summary as a string value for the "markdown_summary" key within the main JSON object.

If information is missing (e.g., renal function), state assumptions and show how results might change.

Interaction Patterns To Screen (non-exhaustive)
• PK (CYP/P-gp/OATP/UGT): inhibitors/inducers, prodrugs, active metabolites.
• PD: additive QT prolongation, serotonergic toxicity, CNS/respiratory depression, anticholinergic load, bleeding risk, hyperkalemia, hypotension.
• Disease-drug: asthma + non-selective beta blockers, HF + TZDs, CKD + NSAIDs, cirrhosis + sedatives.
• Food/alcohol: grapefruit (CYP3A4), tyramine (MAOIs), alcohol (metronidazole, disulfiram-like), caffeine (CYP1A2).
• Herbals/OTC: St. John’s wort (inducer), ginkgo (bleeding), kava (CNS), dextromethorphan (serotonin), antihistamines (anticholinergic).
• Duplicate therapy: multiple NSAIDs, multiple serotonergic agents, multiple anticoagulants/antiplatelets.
• Special tests: warfarin–INR, lithium–levels, tacrolimus–trough, digoxin–levels, clozapine–ANC.
• Time course: onset after start/stop of inducer/inhibitor; enzyme induction may take 1–2 weeks; inhibition can be immediate; de-induction 1–3 weeks.
`;

export const USER_PROMPT_TEMPLATE = `
Task: Analyze interaction risks and propose safer alternatives.

Drugs (generic if possible):
{{drug_list}}

OTC / Herbal / Substances:
{{otc_herbal}}

Indication / Goals:
{{indications}}

Patient factors:
Age: {{age}}
Sex: {{sex}}
Pregnancy/Lactation: {{pregnancy_lactation}}
Weight/BMI: {{weight_bmi}}
Renal function: {{renal_function}}
Hepatic function: {{hepatic_function}}
Comorbidities: {{comorbidities}}
Allergies/intolerances: {{allergies}}
Vitals/baseline tests: {{baseline_tests}}

Region/Locale:
{{region}}

Audience & Detail:
audience={{audience}}
summary_level={{summary_level}}
language={{language}}

Constraints:
- Prefer generics; show brand in parentheses when helpful.
- Show top 5 interactions by severity first.
- Always include red-flag symptoms and monitoring plan.
- Include 3–5 safer alternatives with rationale.
`;

const interactionSchema = {
  type: Type.OBJECT,
  properties: {
    pair_or_cluster: { type: Type.STRING },
    severity: { type: Type.STRING },
    evidence_level: { type: Type.STRING },
    mechanism: { type: Type.STRING },
    expected_clinical_effect: { type: Type.STRING },
    time_course: { type: Type.STRING },
    management: { type: Type.STRING },
    monitoring: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

export const JSON_OUTPUT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    patient_context: {
      type: Type.OBJECT,
      properties: {
        age: { type: Type.INTEGER, nullable: true },
        sex: { type: Type.STRING, nullable: true },
        pregnancy_lactation: { type: Type.STRING, nullable: true },
        renal_function: { type: Type.STRING, nullable: true },
        hepatic_function: { type: Type.STRING, nullable: true },
        comorbidities: { type: Type.ARRAY, items: { type: Type.STRING } },
        allergies: { type: Type.ARRAY, items: { type: Type.STRING } },
        region: { type: Type.STRING, nullable: true },
      },
    },
    inputs: {
      type: Type.OBJECT,
      properties: {
        drugs: { type: Type.ARRAY, items: { type: Type.STRING } },
        otc_herbal_substances: { type: Type.ARRAY, items: { type: Type.STRING } },
        indications: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: {
      type: Type.OBJECT,
      properties: {
        highest_severity_found: { type: Type.STRING },
        interaction_count: { type: Type.INTEGER },
        top_risks: { type: Type.ARRAY, items: interactionSchema },
        red_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    detailed_findings: {
      type: Type.OBJECT,
      properties: {
        drug_drug: { type: Type.ARRAY, items: interactionSchema },
        drug_disease: { type: Type.ARRAY, items: interactionSchema },
        drug_food: { type: Type.ARRAY, items: interactionSchema },
        drug_herbal_otc: { type: Type.ARRAY, items: interactionSchema },
        duplicate_therapy: { type: Type.ARRAY, items: interactionSchema },
      },
    },
    alternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          target_issue: { type: Type.STRING },
          current_drug: { type: Type.STRING },
          proposed_alternative: { type: Type.STRING },
          rationale: { type: Type.STRING },
          notes: { type: Type.STRING },
        },
      },
    },
    monitoring_plan: {
      type: Type.OBJECT,
      properties: {
        labs: { type: Type.ARRAY, items: { type: Type.STRING } },
        vitals_ecg: { type: Type.ARRAY, items: { type: Type.STRING } },
        symptoms_to_watch: { type: Type.ARRAY, items: { type: Type.STRING } },
        follow_up: { type: Type.STRING },
      },
    },
    patient_counseling_points: { type: Type.ARRAY, items: { type: Type.STRING } },
    sources_to_verify: { type: Type.ARRAY, items: { type: Type.STRING } },
    disclaimer: { type: Type.STRING },
    markdown_summary: {
      type: Type.STRING,
      description: "A human-readable summary of the findings in Markdown format.",
    },
  },
};
