import React from 'react';
// FIX: The `Severity` enum is used as a value, so it must be imported separately from the type-only imports.
import { Severity as SeverityEnum } from '../types';
import type { AnalysisResponse, Interaction, Alternative, MonitoringPlan } from '../types';
import { AlertTriangle, CheckCircle, Info, XCircle, FileText, Stethoscope, Pill, ListChecks, MessageSquare, BookOpen, Shield } from './IconComponents';

interface ResultsDisplayProps {
  result: AnalysisResponse;
}

const severityConfig: { [key in SeverityEnum]: { color: string; icon: React.ReactNode; label: string } } = {
  [SeverityEnum.Contraindicated]: { color: 'red-600', icon: <XCircle className="w-5 h-5" />, label: 'Contraindicated' },
  [SeverityEnum.Major]: { color: 'orange-600', icon: <AlertTriangle className="w-5 h-5" />, label: 'Major' },
  [SeverityEnum.Moderate]: { color: 'yellow-600', icon: <Info className="w-5 h-5" />, label: 'Moderate' },
  [SeverityEnum.Minor]: { color: 'blue-600', icon: <CheckCircle className="w-5 h-5" />, label: 'Minor' },
  [SeverityEnum.None]: { color: 'green-600', icon: <CheckCircle className="w-5 h-5" />, label: 'None' },
};

const SeverityBadge: React.FC<{ severity: SeverityEnum }> = ({ severity }) => {
  const config = severityConfig[severity] || severityConfig.minor;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color.split('-')[0]}-100 text-${config.color}`}>
      <span className="mr-1.5">{config.icon}</span>
      {config.label}
    </span>
  );
};

const InteractionCard: React.FC<{ interaction: Interaction }> = ({ interaction }) => (
  <div className="p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50/50">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-bold text-gray-800">{interaction.pair_or_cluster}</h4>
      <SeverityBadge severity={interaction.severity} />
    </div>
    <div className="space-y-2 text-sm text-gray-600">
      <p><strong className="font-medium text-gray-700">Mechanism:</strong> {interaction.mechanism}</p>
      <p><strong className="font-medium text-gray-700">Effect:</strong> {interaction.expected_clinical_effect}</p>
      <p><strong className="font-medium text-gray-700">Management:</strong> {interaction.management}</p>
    </div>
  </div>
);

const ResultSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = true }) => {
  return (
    <details className="group border-b border-gray-200 last:border-b-0" open={defaultOpen}>
      <summary className="flex items-center gap-3 w-full py-4 font-semibold text-lg text-left cursor-pointer list-none text-brand-dark">
        {icon}
        <span>{title}</span>
        <span className="ml-auto transition-transform duration-200 ease-in-out group-open:rotate-180">
          <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </span>
      </summary>
      <div className="pb-4 pl-8 text-gray-700">
        {children}
      </div>
    </details>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const allFindings = [
    ...result.detailed_findings.drug_drug,
    ...result.detailed_findings.drug_disease,
    ...result.detailed_findings.drug_food,
    ...result.detailed_findings.drug_herbal_otc,
    ...result.detailed_findings.duplicate_therapy,
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <ResultSection title="Markdown Summary" icon={<FileText className="w-6 h-6 text-brand-primary"/>} defaultOpen={true}>
        <div className="prose prose-sm max-w-none p-4 bg-blue-50/50 border border-blue-200 rounded-md">
          {result.markdown_summary.split('\n').map((line, index) => {
              if (line.startsWith('•')) {
                  return <p key={index} className="my-1">{line}</p>;
              }
              return <p key={index} className="my-1">{line}</p>;
          })}
        </div>
      </ResultSection>

      <ResultSection title="Top Risks & Red Flags" icon={<AlertTriangle className="w-6 h-6 text-red-500"/>} defaultOpen={true}>
        {result.summary.top_risks.map((risk, i) => <InteractionCard key={`top-risk-${i}`} interaction={risk} />)}
        {result.summary.red_flags.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-bold text-red-800 mb-2">Red Flags (Urgent Attention Required)</h4>
            <ul className="list-disc list-inside space-y-1 text-red-700">
              {result.summary.red_flags.map((flag, i) => <li key={`flag-${i}`}>{flag}</li>)}
            </ul>
          </div>
        )}
      </ResultSection>
      
      {allFindings.length > 0 && (
          <ResultSection title="All Interaction Findings" icon={<ListChecks className="w-6 h-6 text-brand-primary"/>}>
              {allFindings.map((finding, i) => <InteractionCard key={`finding-${i}`} interaction={finding} />)}
          </ResultSection>
      )}

      {result.alternatives.length > 0 && (
        <ResultSection title="Safer Alternatives" icon={<Pill className="w-6 h-6 text-brand-primary"/>}>
          <div className="space-y-3">
            {result.alternatives.map((alt, i) => (
              <div key={`alt-${i}`} className="p-3 border border-gray-200 rounded-md">
                <h5 className="font-semibold">{alt.proposed_alternative} for {alt.target_issue}</h5>
                <p className="text-sm text-gray-600"><strong className="font-medium">Rationale:</strong> {alt.rationale}</p>
                {alt.notes && <p className="text-xs text-gray-500 mt-1">Note: {alt.notes}</p>}
              </div>
            ))}
          </div>
        </ResultSection>
      )}

      <ResultSection title="Monitoring Plan" icon={<Stethoscope className="w-6 h-6 text-brand-primary"/>}>
        <div className="space-y-2 text-sm">
          {result.monitoring_plan.labs.length > 0 && <p><strong className="font-medium">Labs:</strong> {result.monitoring_plan.labs.join(', ')}</p>}
          {result.monitoring_plan.vitals_ecg.length > 0 && <p><strong className="font-medium">Vitals/ECG:</strong> {result.monitoring_plan.vitals_ecg.join(', ')}</p>}
          {result.monitoring_plan.symptoms_to_watch.length > 0 && <p><strong className="font-medium">Symptoms to Watch:</strong> {result.monitoring_plan.symptoms_to_watch.join(', ')}</p>}
          {result.monitoring_plan.follow_up && <p><strong className="font-medium">Follow-up:</strong> {result.monitoring_plan.follow_up}</p>}
        </div>
      </ResultSection>
      
      {result.patient_counseling_points.length > 0 && (
        <ResultSection title="Patient Counseling Points" icon={<MessageSquare className="w-6 h-6 text-brand-primary"/>}>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {result.patient_counseling_points.map((point, i) => <li key={`counsel-${i}`}>{point}</li>)}
          </ul>
        </ResultSection>
      )}

       <ResultSection title="Sources & Disclaimer" icon={<BookOpen className="w-6 h-6 text-brand-primary"/>}>
          <div className="text-xs text-gray-500 space-y-3">
              <p><strong className="font-medium text-gray-600">Sources to Verify:</strong> {result.sources_to_verify.join(', ')}.</p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                <p>{result.disclaimer}</p>
              </div>
          </div>
       </ResultSection>

    </div>
  );
};