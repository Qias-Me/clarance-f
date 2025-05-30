/**
 * SF-86 Form Start Page - Index Route
 *
 * This is the main entry point for the SF-86 form using our new
 * Form Architecture 2.0 with all the components we've built.
 */

import React from 'react';
import type { Route } from "./+types/startForm._index";
import { CompleteSF86FormProvider } from "~/state/contexts/SF86FormContext";
import SF86FormMain from "~/components/Rendered2.0/SF86FormMain";

export function meta() {
  return [
    { title: "SF-86 Form Architecture 2.0 - Start Form" },
    { name: "description", content: "SF-86 Questionnaire for National Security Positions - New Architecture Implementation" },
  ];
}

export default function StartFormIndex() {
  return (
    <CompleteSF86FormProvider>
      <SF86FormMain />
    </CompleteSF86FormProvider>
  );
}