/**
 * Section 29 Test Route
 *
 * Simple test route to verify the Section 29 component works properly
 * without the complex dependencies that are causing issues in the main form.
 */

import type { Route } from "./+types/section29.test";
import { useState } from "react";
// import { Section29Provider } from "~/state/contexts/sections/section29"; // Temporarily commented out
// import { CompleteSF86FormProvider } from "~/state/contexts/SF86FormContext"; // Temporarily commented out
import Section29Component from "~/components/sections/Section29Component";
import type { Section29 } from "api/interfaces/sections2.0/section29";

// ============================================================================
// ROUTE FUNCTIONS
// ============================================================================

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Section 29 Test - SF-86 Associations" },
    { name: "description", content: "Test implementation of Section 29 (Associations) component" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  return {
    timestamp: new Date().toISOString(),
    environment: "test"
  };
}

// ============================================================================
// SECTION 29 TEST COMPONENT
// ============================================================================

export default function Section29Test() {
  const [testData, setTestData] = useState<Section29 | undefined>(undefined);
  const [showValidation, setShowValidation] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const handleDataUpdate = (data: Section29) => {
    setTestData(data);
    console.log('Section 29 data updated:', data);
  };

  const handleReset = () => {
    setTestData(undefined);
    console.log('Section 29 data reset');
  };

  const handleExport = () => {
    if (testData) {
      const dataStr = JSON.stringify(testData, null, 2);
      console.log('Section 29 export:', dataStr);

      // Create downloadable file
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'section29-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="section29-test-page">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Section 29 Test Environment
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Testing the Section 29 (Associations) component implementation
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Environment: Test
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Controls */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Controls</h2>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  data-testid="reset-button"
                >
                  Reset Data
                </button>

                <button
                  onClick={handleExport}
                  disabled={!testData}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  data-testid="export-button"
                >
                  Export Data
                </button>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showValidation}
                    onChange={(e) => setShowValidation(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    data-testid="show-validation-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Validation</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isReadOnly}
                    onChange={(e) => setIsReadOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    data-testid="read-only-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-700">Read Only Mode</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Section 29 Component */}
              <div className="lg:col-span-2">
                <Section29Component
                  data={testData}
                  onUpdate={handleDataUpdate}
                  isReadOnly={isReadOnly}
                  showValidation={showValidation}
                />
              </div>

              {/* Data Preview */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6" data-testid="data-preview">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Data
                  </h3>

                  {testData ? (
                    <div className="space-y-4">
                      <div className="text-sm">
                        <h4 className="font-medium text-gray-700 mb-2">Summary:</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>
                            Terrorism Member: {testData.subsectionA?.hasAssociation?.value ? 'Yes' : 'No'}
                          </li>
                          <li>
                            Acts of Terrorism: {testData.subsectionB?.hasAssociation?.value ? 'Yes' : 'No'}
                          </li>
                          <li>
                            Overthrow Advocacy: {testData.subsectionC?.hasAssociation?.value ? 'Yes' : 'No'}
                          </li>
                          <li>
                            Violent Organization: {testData.subsectionD?.hasAssociation?.value ? 'Yes' : 'No'}
                          </li>
                          <li>
                            Terrorism Association: {testData.subsectionE?.hasAssociation?.value ? 'Yes' : 'No'}
                          </li>
                        </ul>
                      </div>

                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                          View Raw Data
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                          {JSON.stringify(testData, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No data yet. Start filling out the form to see data appear here.
                    </p>
                  )}
                </div>

                {/* Test Instructions */}
                <div className="mt-6 bg-blue-50 rounded-lg shadow-lg p-6" data-testid="test-instructions">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Test Instructions
                  </h3>

                  <div className="space-y-3 text-sm text-blue-800">
                    <div>
                      <h4 className="font-medium">1. Basic Testing:</h4>
                      <p>Answer Yes/No to each question and verify the data updates correctly.</p>
                    </div>

                    <div>
                      <h4 className="font-medium">2. Subsection Testing:</h4>
                      <p>When you answer "Yes", additional detail sections should appear.</p>
                    </div>

                    <div>
                      <h4 className="font-medium">3. Validation Testing:</h4>
                      <p>Use the validation controls to test form validation features.</p>
                    </div>

                    <div>
                      <h4 className="font-medium">4. Read-Only Testing:</h4>
                      <p>Enable read-only mode to test the disabled state.</p>
                    </div>

                    <div>
                      <h4 className="font-medium">5. Data Export:</h4>
                      <p>Use the export button to download the current form data as JSON.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
  );
}
