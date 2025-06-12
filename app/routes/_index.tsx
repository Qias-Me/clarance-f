/**
 * SF-86 Form Start Page - Index Route
 *
 * This is the main entry point for the SF-86 form using our new
 * Form Architecture 2.0 with all the components we've built.
 */

import { useEffect, useState } from 'react';
import { CompleteSF86FormProvider, useSF86Form } from "~/state/contexts/sections2.0/SF86FormContext";
import SF86FormMain from "~/components/Rendered2.0/SF86FormMain";
import LoadingSpinner from '~/components/LoadingSpinner';



export function meta() {
  return [
    { title: "ICM's SF-86 Form Tool" },
    { name: "description", content: "SF-86 Questionnaire for National Security Positions" },
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
      <SF86FormMain />
    </CompleteSF86FormProvider>
  );
}