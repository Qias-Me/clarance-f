/**
 * SF-86 Form Start Page - Index Route
 *
 * Main entry point for the SF-86 form using Form Architecture 2.0.
 * Provides the complete form context and renders the main form component.
 */

import { Outlet } from 'react-router';
import { CompleteSF86FormProvider } from "~/state/contexts/SF86FormContext";
import SF86FormMain from "~/components/Rendered2.0/SF86FormMain";

export function meta() {
  return [
    { title: "SF-86 Form - Questionnaire for National Security Positions" },
    { name: "description", content: "SF-86 Questionnaire for National Security Positions" },
  ];
}

export default function StartFormIndex() {
  return (
    <CompleteSF86FormProvider>
      <SF86FormMain />
      <Outlet />
    </CompleteSF86FormProvider>
  );
}