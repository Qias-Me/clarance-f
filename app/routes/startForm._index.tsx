/**
 * SF-86 Form Start Page - Index Route
 *
 * This is the main entry point for the SF-86 form using our new
 * Form Architecture 2.0 with all the components we've built.
 */

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { CompleteSF86FormProvider, useSF86Form } from "~/state/contexts/SF86FormContext";
import SF86FormMain from "~/components/Rendered2.0/SF86FormMain";
import LoadingSpinner from '~/components/LoadingSpinner';

// Debug component to test data collection
function DebugDataCollection() {
  const sf86Form = useSF86Form();

  useEffect(() => {
    // Automatically test data collection after a short delay
    const timer = setTimeout(() => {
      console.log('\n🧪 ===== AUTO DEBUG TEST =====');
      console.log('🔍 Testing data collection...');

      // Test the export function which calls collectAllSectionData
      const exportedData = sf86Form.exportForm();
      console.log('📊 Exported data result:', exportedData);
      console.log('🧪 ===== AUTO DEBUG TEST COMPLETE =====\n');
    }, 2000);

    return () => clearTimeout(timer);
  }, [sf86Form]);

  return null; // This component doesn't render anything
}

export function meta() {
  return [
    { title: "SF-86 Form Architecture 2.0 - Start Form" },
    { name: "description", content: "SF-86 Questionnaire for National Security Positions - New Architecture Implementation" },
  ];
}

export default function StartFormIndex() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate setup time for SF86FormMain or context initialization.
    // Replace with actual readiness check if available.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); 

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <CompleteSF86FormProvider>
      <DebugDataCollection />
      <SF86FormMain />
    </CompleteSF86FormProvider>
  );
}