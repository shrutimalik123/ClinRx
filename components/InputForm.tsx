
import React, { useState } from 'react';
import type { FormData } from '../types';
import { ChevronDown, ChevronUp } from './IconComponents';

interface InputFormProps {
  onAnalyze: (data: FormData) => void;
  isLoading: boolean;
}

const initialFormData: FormData = {
  drug_list: 'sertraline 100 mg daily; sumatriptan 50 mg PRN; ibuprofen 400 mg TID; omeprazole 20 mg daily',
  otc_herbal: 'caffeine ~300 mg/day, melatonin 3 mg HS',
  indications: 'migraine, generalized anxiety, GERD',
  age: '29',
  sex: 'Female',
  pregnancy_lactation: 'none',
  weight_bmi: '',
  renal_function: 'eGFR 100',
  hepatic_function: 'normal',
  comorbidities: 'none',
  allergies: 'NKDA',
  baseline_tests: 'QTc 430 ms',
  region: 'US',
  audience: 'clinician',
  summary_level: 'detailed',
  language: 'English',
};

const FormSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  return (
    <details className="group border-b border-gray-200" open={defaultOpen}>
      <summary className="flex items-center justify-between w-full py-4 font-medium text-left cursor-pointer list-none">
        <span className="text-gray-800">{title}</span>
        <span className="transition-transform duration-200 ease-in-out group-open:rotate-180">
          <ChevronDown className="w-5 h-5" />
        </span>
      </summary>
      <div className="pb-4">
        {children}
      </div>
    </details>
  );
};

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setModifiedFields(prev => new Set(prev).add(name));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    const fieldName = name as keyof FormData;
    // If the field hasn't been modified and still holds example text, clear it.
    if (!modifiedFields.has(fieldName) && formData[fieldName]) {
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
      setModifiedFields(prev => new Set(prev).add(fieldName));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  const getTextFieldClassName = (fieldName: keyof FormData) => {
    const baseClasses = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary";
    if (!modifiedFields.has(fieldName) && formData[fieldName]) {
      return `${baseClasses} text-gray-400`;
    }
    return baseClasses;
  };
  
  const selectClassName = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary";


  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <h2 className="text-xl font-bold text-brand-dark mb-4">Patient & Regimen Details</h2>
      
      <FormSection title="Medications & Substances" defaultOpen={true}>
        <div className="space-y-4">
          <div>
            <label htmlFor="drug_list" className="block text-sm font-medium text-gray-700 mb-1">Prescription Drugs</label>
            <textarea id="drug_list" name="drug_list" rows={4} value={formData.drug_list} onChange={handleChange} onFocus={handleFocus} className={getTextFieldClassName('drug_list')} placeholder="e.g., sertraline 100 mg daily..." />
          </div>
          <div>
            <label htmlFor="otc_herbal" className="block text-sm font-medium text-gray-700 mb-1">OTC / Herbal / Substances</label>
            <textarea id="otc_herbal" name="otc_herbal" rows={3} value={formData.otc_herbal} onChange={handleChange} onFocus={handleFocus} className={getTextFieldClassName('otc_herbal')} placeholder="e.g., St. John’s wort, melatonin..." />
          </div>
        </div>
      </FormSection>

      <FormSection title="Clinical Context">
        <div className="space-y-4">
          <div>
            <label htmlFor="indications" className="block text-sm font-medium text-gray-700 mb-1">Indications / Goals</label>
            <input type="text" id="indications" name="indications" value={formData.indications} onChange={handleChange} onFocus={handleFocus} className={getTextFieldClassName('indications')} placeholder="e.g., migraine, GAD, GERD" />
          </div>
          <div>
            <label htmlFor="comorbidities" className="block text-sm font-medium text-gray-700 mb-1">Comorbidities</label>
            <input type="text" id="comorbidities" name="comorbidities" value={formData.comorbidities} onChange={handleChange} onFocus={handleFocus} className={getTextFieldClassName('comorbidities')} placeholder="e.g., CAD, HF, CKD3" />
          </div>
        </div>
      </FormSection>

       <FormSection title="Patient Demographics & Vitals">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="text" id="age" name="age" value={formData.age} onChange={handleChange} onFocus={handleFocus} className={getTextFieldClassName('age')} />
          </div>
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
            <input type="text" id="sex" name="sex" value={formData.sex} onChange={handleChange} onFocus={handleFocus} className={getTextFieldClassName('sex')} />
          </div>
          <div>
            <label htmlFor="renal_function" className="block text-sm font-medium text-gray-700 mb-1">Renal Function</label>
            <input type="text" id="renal_function" name="renal_function" value={formData.renal_function} onChange={handleChange} onFocus={handleFocus} className={getTextFieldClassName('renal_function')} placeholder="e.g., eGFR 100" />
          </div>
          <div>
            <label htmlFor="hepatic_function" className="block text-sm font-medium text-gray-700 mb-1">Hepatic Function</label>
            <input type="text" id="hepatic_function" name="hepatic_function" value={formData.hepatic_function} onChange={handleChange} onFocus={handleFocus} className={getTextFieldClassName('hepatic_function')} placeholder="e.g., normal" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Audience & Output">
         <div className="grid grid-cols-2 gap-4">
           <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
            <select id="audience" name="audience" value={formData.audience} onChange={handleChange} className={selectClassName}>
              <option value="clinician">Clinician</option>
              <option value="patient">Patient</option>
            </select>
           </div>
            <div>
            <label htmlFor="summary_level" className="block text-sm font-medium text-gray-700 mb-1">Detail Level</label>
            <select id="summary_level" name="summary_level" value={formData.summary_level} onChange={handleChange} className={selectClassName}>
              <option value="detailed">Detailed</option>
              <option value="brief">Brief</option>
            </select>
           </div>
         </div>
      </FormSection>

      <div className="mt-6">
        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isLoading ? 'Analyzing...' : 'Analyze Regimen'}
        </button>
      </div>
    </form>
  );
};
