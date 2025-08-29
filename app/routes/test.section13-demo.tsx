/**
 * Test route for Section 13 Field Demonstration
 */

import type { Route } from "./+types/test.section13-demo";
import { CompleteSF86FormProvider } from "~/state/contexts/sections2.0/SF86FormContext";
import { Section13Provider } from "~/state/contexts/sections2.0/section13";
import Section13FullRenderer from "~/components/Rendered2.0/Section13FullRenderer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Section 13 Full Coverage Demo - SF-86" },
    { name: "description", content: "Full 1086 field demonstration of Section 13" }
  ];
}

export default function Section13DemoRoute() {
  return (
    <CompleteSF86FormProvider>
      <Section13Provider>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <Section13FullRenderer />
          </div>
        </div>
      </Section13Provider>
    </CompleteSF86FormProvider>
  );
}