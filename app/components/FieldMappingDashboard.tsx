import React, { useState } from 'react';
import { ConfidenceLevel } from '../../api/enums/SF86DataEnums';

// Define interface for field mapping report
export interface FieldMappingReport {
  sectionId: number;
  sectionName: string;
  fieldCount: number;
  mappedCount: number;
  confidenceScores: {
    [key: string]: number; // fieldName: confidence score (0-1)
  };
  overallConfidence: number;
}

interface FieldMappingDashboardProps {
  reports: FieldMappingReport[];
}

const FieldMappingDashboard: React.FC<FieldMappingDashboardProps> = ({ reports }) => {
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper function to determine confidence level class
  const getConfidenceLevelClass = (score: number): string => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Helper function to get confidence level label
  const getConfidenceLevelLabel = (score: number): string => {
    if (score >= 0.8) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
  };

  const renderSectionSummary = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div 
            key={report.sectionId}
            className="border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedSection(report.sectionId)}
          >
            <h3 className="text-lg font-medium">Section {report.sectionId}: {report.sectionName}</h3>
            <div className="mt-2 flex justify-between">
              <span>Fields: {report.mappedCount} / {report.fieldCount} mapped</span>
              <span className={`px-2 py-1 rounded text-sm ${getConfidenceLevelClass(report.overallConfidence)}`}>
                {getConfidenceLevelLabel(report.overallConfidence)}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${report.overallConfidence * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDetailView = () => {
    if (!selectedSection) return null;
    
    const report = reports.find(r => r.sectionId === selectedSection);
    if (!report) return null;

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Section {report.sectionId}: {report.sectionName} - Field Mapping Details
          </h2>
          <button 
            onClick={() => setSelectedSection(null)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Summary
          </button>
        </div>
        
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(report.confidenceScores).map(([fieldName, score]) => (
                <tr key={fieldName}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fieldName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(score * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getConfidenceLevelClass(score)}`}>
                      {getConfidenceLevelLabel(score)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Review
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      Edit Mapping
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading field mapping data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Field Mapping Confidence Dashboard</h1>
      
      <div className="mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-blue-700">
            This dashboard shows confidence scores for field mappings between the SF-86 form and the application's data model.
            Higher scores indicate greater confidence in the accuracy of the mapping.
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-4 text-center">
        <div className="bg-gray-100 p-4 rounded">
          <div className="text-2xl font-bold">{reports.length}</div>
          <div className="text-gray-500">Total Sections</div>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <div className="text-2xl font-bold">
            {reports.reduce((sum, report) => sum + report.fieldCount, 0)}
          </div>
          <div className="text-gray-500">Total Fields</div>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <div className="text-2xl font-bold">
            {reports.reduce((sum, report) => sum + report.mappedCount, 0)}
          </div>
          <div className="text-gray-500">Mapped Fields</div>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <div className="text-2xl font-bold">
            {reports.length > 0 
              ? (reports.reduce((sum, report) => sum + report.overallConfidence, 0) / reports.length * 100).toFixed(1) 
              : 0}%
          </div>
          <div className="text-gray-500">Average Confidence</div>
        </div>
      </div>

      {selectedSection ? renderDetailView() : renderSectionSummary()}
    </div>
  );
};

export default FieldMappingDashboard; 