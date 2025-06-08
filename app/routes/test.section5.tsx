/**
 * Test route for Section 5: Other Names Used
 * 
 * This route provides a testing environment for Section 5 component
 * to verify the new functionality of limiting entries to 4 maximum.
 */

import React from 'react';
import { Section5Provider } from '../state/contexts/sections2.0/section5';
import { Section5Component } from '../components/Rendered2.0/Section5Component';
import { CompleteSF86FormProvider } from '../state/contexts/SF86FormContext';

const Section5TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Section 5 Test Environment
          </h1>
          <p className="text-gray-600">
            Testing Section 5: Other Names Used with maximum 4 entries limit
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Test Scenarios:</h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Select "Yes" - should show 1 entry initially</li>
              <li>Add more entries - should allow up to 4 total</li>
              <li>Try to add 5th entry - button should be disabled</li>
              <li>Remove entries - should allow adding again</li>
            </ul>
          </div>
        </div>

        {/* Section 5 Component */}
        <Section5Component
          className="mb-8"
          onValidationChange={(isValid) => {
            console.log('Section 5 validation changed:', isValid);
          }}
          onNext={() => {
            console.log('Section 5 submitted successfully');
          }}
        />

        {/* Debug Information */}
        <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug Information</h3>
          <p className="text-sm text-gray-600">
            Check the browser console for detailed logs about Section 5 operations.
            Use the debug=true query parameter to see additional debug information in the component.
          </p>
          <div className="mt-2">
            <a
              href="/test/section5?debug=true"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Enable Debug Mode
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section5TestPage: React.FC = () => {
  return (
    <CompleteSF86FormProvider>
      <Section5Provider>
        <Section5TestComponent />
      </Section5Provider>
    </CompleteSF86FormProvider>
  );
};

export default Section5TestPage;
