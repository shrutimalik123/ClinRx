
import React from 'react';
import { Severity as SeverityEnum } from '../types';
import type { AnalysisResponse, Interaction, Alternative } from '../types';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  FileText, 
  Stethoscope, 
  Pill, 
  ListChecks, 
  MessageSquare, 
  BookOpen, 
  Shield, 
  ArrowRight,
  ChevronDown
} from './IconComponents';

interface ResultsDisplayProps {
  result: AnalysisResponse;
}

// Helper to clean and format markdown text (removes **, #, etc and applies styles)
const renderFormattedText = (text: string) => {
  if (!text) return null;
  return text.split('\n').filter(line => line.trim() !== '').map((line, i) => {
    // Remove headings hashes
    let content = line.replace(/^#+\s*/, '');
    
    // Handle bullet points
    const isBullet = /^\s*[\*\-]\s/.test(content);
    if (isBullet) {
        content = content.replace(/^\s*[\*\-]\s+/, '');
    }
    
    // Parse bolding **text**
    const parts = content.split(/(\*\*.*?\*\*)/);
    const children = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-brand-dark">{part.slice(2, -2)}</strong>;
        }
        return part;
    });

    return (
        <div key={i} className={`mb-2 ${isBullet ? 'flex items-start gap-2 ml-4' : ''}`}>
            {isBullet && <span className="text-brand-primary mt-1.5 text-xs">●</span>}
            <p className={`${isBullet ? 'flex-1' : ''} text-gray-700 leading-relaxed`}>{children}</p>
        </div>
    );
  });
};

// Helper to determine styling based on severity
const getSeverityStyles = (severity: SeverityEnum) => {
  switch (severity) {
    case SeverityEnum.Contraindicated:
      return { 
        bg: 'bg-red-50', 
        border: 'border-red-500', 
        text: 'text-red-800', 
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        badge: 'bg-red-100 text-red-800'
      };
    case SeverityEnum.Major:
      return { 
        bg: 'bg-orange-50', 
        border: 'border-orange-500', 
        text: 'text-orange-800', 
        icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
        badge: 'bg-orange-100 text-orange-800'
      };
    case SeverityEnum.Moderate:
      return { 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-500', 
        text: 'text-yellow-800', 
        icon: <Info className="w-5 h-5 text-yellow-600" />,
        badge: 'bg-yellow-100 text-yellow-800'
      };
    case SeverityEnum.Minor:
      return { 
        bg: 'bg-blue-50', 
        border: 'border-blue-500', 
        text: 'text-blue-800', 
        icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
        badge: 'bg-blue-100 text-blue-800'
      };
    case SeverityEnum.None:
      return { 
        bg: 'bg-green-50', 
        border: 'border-green-500', 
        text: 'text-green-800', 
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        badge: 'bg-green-100 text-green-800'
      };
    default:
      return { 
        bg: 'bg-gray-50', 
        border: 'border-gray-500', 
        text: 'text-gray-800', 
        icon: <Info className="w-5 h-5 text-gray-600" />,
        badge: 'bg-gray-100 text-gray-800'
      };
  }
};

const SeverityBadge: React.FC<{ severity: SeverityEnum }> = ({ severity }) => {
  const styles = getSeverityStyles(severity);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles.badge}`}>
      {severity}
    </span>
  );
};

const StatusBanner: React.FC<{ summary: AnalysisResponse['summary'] }> = ({ summary }) => {
  const styles = getSeverityStyles(summary?.highest_severity_found || SeverityEnum.None);
  const redFlagsCount = (summary?.red_flags || []).length;
  
  return (
    <div className={`rounded-lg border p-4 mb-6 ${styles.bg} ${styles.border} border-l-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${styles.text} opacity-80 mb-1`}>Analysis Status</h3>
          <div className="flex items-center gap-2">
            {styles.icon}
            <span className={`text-xl font-bold ${styles.text}`}>
              Highest Risk: {(summary?.highest_severity_found || 'Unknown').charAt(0).toUpperCase() + (summary?.highest_severity_found || 'unknown').slice(1)}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
            <div className="text-center bg-white/60 p-2 rounded-md min-w-[80px]">
                <div className="text-2xl font-bold text-gray-800">{summary?.interaction_count || 0}</div>
                <div className="text-xs font-medium text-gray-600">Interactions</div>
            </div>
             <div className="text-center bg-white/60 p-2 rounded-md min-w-[80px]">
                <div className={`text-2xl font-bold ${redFlagsCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>{redFlagsCount}</div>
                <div className="text-xs font-medium text-gray-600">Red Flags</div>
            </div>
        </div>
      </div>
    </div>
  );
};

const InteractionCard: React.FC<{ interaction: Interaction }> = ({ interaction }) => {
  const styles = getSeverityStyles(interaction.severity);
  return (
    <div className={`bg-white border rounded-lg shadow-sm p-4 mb-3 border-l-4 ${styles.border} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3 gap-4">
        <h4 className="font-bold text-gray-800 text-lg leading-tight">{interaction.pair_or_cluster}</h4>
        <SeverityBadge severity={interaction.severity} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="space-y-2">
           <div>
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mechanism</span>
             <p className="font-medium text-gray-700">{interaction.mechanism}</p>
           </div>
           <div>
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Clinical Effect</span>
             <p className="text-gray-700">{interaction.expected_clinical_effect}</p>
           </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Management</span>
             <p className="text-gray-800 font-medium">{interaction.management}</p>
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  isOpen: boolean; 
  onToggle: () => void;
  count?: number;
}> = ({ title, icon, isOpen, onToggle, count }) => (
  <button 
    onClick={onToggle}
    className="flex items-center w-full py-4 text-left group focus:outline-none"
  >
    <div className={`p-2 rounded-lg mr-3 transition-colors ${isOpen ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
        {icon}
    </div>
    <span className="text-lg font-bold text-gray-800 flex-grow">{title}</span>
    {count !== undefined && count > 0 && (
      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold mr-3">
        {count}
      </span>
    )}
    <span className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
      <ChevronDown className="w-5 h-5" />
    </span>
  </button>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const [openSections, setOpenSections] = React.useState<Set<string>>(new Set(['summary', 'risks', 'alternatives']));

  const toggleSection = (section: string) => {
    const newSections = new Set(openSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setOpenSections(newSections);
  };

  const allFindings = [
    ...(result.detailed_findings?.drug_drug || []),
    ...(result.detailed_findings?.drug_disease || []),
    ...(result.detailed_findings?.drug_food || []),
    ...(result.detailed_findings?.drug_herbal_otc || []),
    ...(result.detailed_findings?.duplicate_therapy || []),
  ];

  const topRisks = result.summary?.top_risks || [];
  const redFlags = result.summary?.red_flags || [];
  const alternatives = result.alternatives || [];
  const monitoringPlan = result.monitoring_plan || { labs: [], vitals_ecg: [], symptoms_to_watch: [], follow_up: '' };
  const counselingPoints = result.patient_counseling_points || [];
  const sources = result.sources_to_verify || [];

  return (
    <div className="space-y-2 animate-fade-in pb-12">
      <StatusBanner summary={result.summary} />

      {/* Markdown Summary Section */}
      <div className="mb-6">
        <SectionHeader 
          title="Clinical Summary" 
          icon={<FileText className="w-6 h-6"/>} 
          isOpen={openSections.has('summary')}
          onToggle={() => toggleSection('summary')}
        />
        {openSections.has('summary') && (
           <div className="prose prose-sm max-w-none p-5 bg-blue-50/30 border border-blue-100 rounded-xl text-gray-700">
             {renderFormattedText(result.markdown_summary)}
           </div>
        )}
      </div>

      {/* Critical Alerts / Red Flags */}
      {redFlags.length > 0 && (
        <div className="mb-6">
           <div className="bg-red-50 border border-red-200 rounded-xl p-4">
             <div className="flex items-center gap-2 mb-3">
               <AlertTriangle className="w-6 h-6 text-red-600" />
               <h3 className="font-bold text-red-800 text-lg">Red Flags – Urgent Attention Required</h3>
             </div>
             <ul className="space-y-2">
               {redFlags.map((flag, i) => (
                 <li key={i} className="flex items-start gap-2 text-red-700 bg-white/50 p-2 rounded-md">
                   <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                   <span>{flag}</span>
                 </li>
               ))}
             </ul>
           </div>
        </div>
      )}

      {/* Top Risks Section */}
      <div className="border-t border-gray-100">
        <SectionHeader 
            title="Priority Interactions" 
            icon={<AlertTriangle className="w-6 h-6"/>}
            isOpen={openSections.has('risks')}
            onToggle={() => toggleSection('risks')}
            count={topRisks.length}
        />
        {openSections.has('risks') && (
            <div className="space-y-1 mb-6">
                {topRisks.length > 0 ? (
                  topRisks.map((risk, i) => (
                      <InteractionCard key={`top-risk-${i}`} interaction={risk} />
                  ))
                ) : (
                  <p className="text-gray-500 italic px-4">No priority interactions identified.</p>
                )}
            </div>
        )}
      </div>

      {/* Detailed Findings Accordion */}
      {allFindings.length > 0 && (
          <div className="border-t border-gray-100">
              <SectionHeader 
                  title="Detailed Findings" 
                  icon={<ListChecks className="w-6 h-6"/>}
                  isOpen={openSections.has('details')}
                  onToggle={() => toggleSection('details')}
                  count={allFindings.length}
              />
              {openSections.has('details') && (
                  <div className="space-y-1 mb-6">
                      {allFindings.map((finding, i) => (
                          <InteractionCard key={`finding-${i}`} interaction={finding} />
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* Safer Alternatives */}
      {alternatives.length > 0 && (
        <div className="border-t border-gray-100">
          <SectionHeader 
              title="Proposed Alternatives" 
              icon={<Pill className="w-6 h-6"/>}
              isOpen={openSections.has('alternatives')}
              onToggle={() => toggleSection('alternatives')}
              count={alternatives.length}
          />
          {openSections.has('alternatives') && (
            <div className="grid grid-cols-1 gap-4 mb-6">
              {alternatives.map((alt, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:border-brand-primary/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                     <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm font-semibold border border-red-100 line-through decoration-red-400">
                        {alt.current_drug}
                     </div>
                     <ArrowRight className="hidden md:block w-5 h-5 text-gray-400" />
                     <div className="md:hidden text-center text-gray-400">↓</div>
                     <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm font-semibold border border-green-100">
                        {alt.proposed_alternative}
                     </div>
                     <span className="text-sm text-gray-500 md:ml-auto italic">for {alt.target_issue}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="mb-2"><strong className="text-brand-dark">Rationale:</strong> {alt.rationale}</p>
                    {alt.notes && (
                        <p className="text-xs text-gray-500 flex items-start gap-1">
                            <Info className="w-3 h-3 mt-0.5" /> {alt.notes}
                        </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Monitoring & Counseling Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-gray-100 pt-4">
          
          {/* Monitoring Plan */}
          <div>
             <SectionHeader 
                title="Monitoring Plan" 
                icon={<Stethoscope className="w-6 h-6"/>}
                isOpen={true}
                onToggle={() => {}} // Always open for layout balance
             />
             <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full">
                <div className="space-y-4">
                   {(monitoringPlan.labs || []).length > 0 && (
                       <div>
                           <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Labs</h5>
                           <div className="flex flex-wrap gap-2">
                               {monitoringPlan.labs.map((lab, i) => (
                                   <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium border border-gray-200">{lab}</span>
                               ))}
                           </div>
                       </div>
                   )}
                   {(monitoringPlan.vitals_ecg || []).length > 0 && (
                       <div>
                           <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Vitals & ECG</h5>
                           <p className="text-sm text-gray-700">{monitoringPlan.vitals_ecg.join(', ')}</p>
                       </div>
                   )}
                   {(monitoringPlan.symptoms_to_watch || []).length > 0 && (
                       <div>
                           <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Symptoms to Watch</h5>
                           <ul className="text-sm text-gray-700 space-y-1">
                               {monitoringPlan.symptoms_to_watch.map((sym, i) => (
                                   <li key={i} className="flex items-start gap-2">
                                       <span className="text-brand-primary">•</span> {sym}
                                   </li>
                               ))}
                           </ul>
                       </div>
                   )}
                   {(!monitoringPlan.labs?.length && !monitoringPlan.vitals_ecg?.length && !monitoringPlan.symptoms_to_watch?.length) && (
                     <p className="text-sm text-gray-500 italic">No specific monitoring plan provided.</p>
                   )}
                </div>
             </div>
          </div>

          {/* Counseling Points */}
          <div>
            <SectionHeader 
                title="Counseling Points" 
                icon={<MessageSquare className="w-6 h-6"/>}
                isOpen={true}
                onToggle={() => {}}
             />
             <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full">
                <ul className="space-y-3">
                    {counselingPoints.length > 0 ? (
                      counselingPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <div className="mt-0.5 bg-brand-light p-1 rounded-full text-brand-primary">
                                  <CheckCircle className="w-3 h-3" />
                              </div>
                              <span>{point}</span>
                          </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No specific counseling points provided.</li>
                    )}
                </ul>
             </div>
          </div>
      </div>

       {/* Disclaimer Footer */}
       <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col gap-4">
             {sources.length > 0 && (
               <div className="text-xs text-gray-500">
                  <span className="font-bold text-gray-600">Reference Sources to Verify:</span> {sources.join(', ')}
               </div>
             )}
             <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex items-start gap-3 text-xs leading-relaxed">
                <Shield className="w-5 h-5 flex-shrink-0 text-yellow-600"/>
                <p>{result.disclaimer}</p>
             </div>
          </div>
       </div>

    </div>
  );
};
