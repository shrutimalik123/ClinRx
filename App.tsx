
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeDrugInteractions } from './services/geminiService';
import type { FormData, AnalysisResponse } from './types';
import { AlertCircle } from './components/IconComponents';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setFormData(data);

    try {
      const result = await analyzeDrugInteractions(data);
      if (result) {
        setAnalysisResult(result);
      } else {
        setError('Failed to get a valid analysis from the AI. The response was empty.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4 xl:col-span-4 mb-8 lg:mb-0">
            <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-8 xl:col-span-8">
            <div className="bg-white rounded-xl shadow-md p-6 min-h-[calc(100vh-200px)]">
              {isLoading && <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="mt-4 text-gray-600">ClinRx is analyzing the regimen...</p></div>}
              {error && (
                <div className="flex flex-col items-center justify-center h-full text-center text-red-600">
                  <AlertCircle className="w-16 h-16 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
                  <p className="max-w-md">{error}</p>
                </div>
              )}
              {!isLoading && !error && !analysisResult && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  <h2 className="text-2xl font-bold text-gray-700">Awaiting Analysis</h2>
                  <p className="mt-2 max-w-lg">Enter patient and medication details in the form and click "Analyze" to view the ClinRx interaction report here.</p>
                </div>
              )}
              {analysisResult && <ResultsDisplay result={analysisResult} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
