import React, { useState, useEffect } from 'react';
import { useFormState } from '../../state/hooks';
import { 
  SubsectionValidator, 
  SubsectionValidationReport, 
  createSubsectionValidator 
} from '../../utils/validation/SubsectionValidator';

interface SectionSummaryProps {
  sectionId: string;
  total: number;
  mapped: number;
  unmapped: number;
}

const SectionSummary: React.FC<SectionSummaryProps> = ({ sectionId, total, mapped, unmapped }) => {
  const coverage = Math.round((mapped / total) * 100);
  const coverageClass = coverage < 50 ? 'text-red-500' : 
                        coverage < 80 ? 'text-yellow-500' : 
                        'text-green-500';
  
  return (
    <div className="border rounded p-3 mb-2">
      <h3 className="text-lg font-semibold">Section {sectionId}</h3>
      <div className="grid grid-cols-4 gap-2 mt-2 text-center">
        <div>
          <div className="text-sm text-gray-500">Total</div>
          <div className="font-medium">{total}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Mapped</div>
          <div className="font-medium text-green-500">{mapped}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Unmapped</div>
          <div className="font-medium text-red-500">{unmapped}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Coverage</div>
          <div className={`font-medium ${coverageClass}`}>{coverage}%</div>
        </div>
      </div>
    </div>
  );
};

interface IssueItemProps {
  issue: {
    level: 'warning' | 'error';
    message: string;
    subsectionId?: string;
    suggestion?: string;
  };
}

const IssueItem: React.FC<IssueItemProps> = ({ issue }) => {
  const isError = issue.level === 'error';
  const badgeClass = isError ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
  
  return (
    <div className={`border-l-4 ${isError ? 'border-red-500' : 'border-yellow-500'} p-3 mb-2`}>
      <div className="flex items-start">
        <span className={`${badgeClass} text-xs font-medium px-2 py-0.5 rounded mr-2`}>
          {isError ? 'ERROR' : 'WARNING'}
        </span>
        <div className="flex-1">
          <p className="font-medium">
            {issue.subsectionId && <span className="underline">{issue.subsectionId}</span>}: {issue.message}
          </p>
          {issue.suggestion && (
            <p className="text-sm text-gray-600 mt-1 italic">{issue.suggestion}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface SubsectionDetailRowProps {
  subsectionId: string;
  details: {
    fieldCount: number;
    isMapped: boolean;
    isOrphaned: boolean;
    issues: string[];
  };
}

const SubsectionDetailRow: React.FC<SubsectionDetailRowProps> = ({ subsectionId, details }) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-2 px-3 font-medium">{subsectionId}</td>
      <td className="py-2 px-3 text-center">{details.fieldCount}</td>
      <td className="py-2 px-3 text-center">
        {details.isMapped ? (
          <span className="text-green-500">✓</span>
        ) : (
          <span className="text-red-500">✗</span>
        )}
      </td>
      <td className="py-2 px-3 text-center">
        {!details.isOrphaned ? (
          <span className="text-green-500">✓</span>
        ) : (
          <span className="text-red-500">✗</span>
        )}
      </td>
      <td className="py-2 px-3 text-sm">
        {details.issues.map((issue, idx) => (
          <div key={idx} className="text-gray-600">{issue}</div>
        ))}
      </td>
    </tr>
  );
};

export interface SubsectionValidationReportProps {
  fieldHierarchy: any;
  refreshTrigger?: number;
}

const SubsectionValidationReportComponent: React.FC<SubsectionValidationReportProps> = ({ 
  fieldHierarchy,
  refreshTrigger = 0
}) => {
  const formState = useFormState();
  const [report, setReport] = useState<SubsectionValidationReport | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'issues' | 'details'>('summary');
  const [filterSection, setFilterSection] = useState<string | null>(null);
  
  useEffect(() => {
    if (fieldHierarchy && formState) {
      const validator = createSubsectionValidator(fieldHierarchy, formState.getFormValues());
      const validationReport = validator.validateAllSubsections();
      setReport(validationReport);
    }
  }, [fieldHierarchy, formState, refreshTrigger]);
  
  if (!report) {
    return <div className="p-4 text-center text-gray-500">Loading validation report...</div>;
  }
  
  const sectionIds = Object.keys(report.sectionSummary).sort((a, b) => parseInt(a) - parseInt(b));
  
  // Filter subsections by section if a section filter is applied
  const filteredSubsectionDetails = filterSection 
    ? Object.entries(report.subsectionDetails)
        .filter(([id]) => id.startsWith(`${filterSection}.`))
    : Object.entries(report.subsectionDetails);
  
  // Sort filtered subsections by ID
  const sortedSubsectionDetails = filteredSubsectionDetails
    .sort((a, b) => {
      const idA = a[0].split('.').map(Number);
      const idB = b[0].split('.').map(Number);
      
      if (idA[0] !== idB[0]) {
        return idA[0] - idB[0];
      }
      
      return idA[1] - idB[1];
    });
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Subsection Validation Report</h2>
        <p className="text-sm text-gray-500 mt-1">
          Generated: {new Date(report.timestamp).toLocaleString()}
        </p>
        
        <div className="grid grid-cols-4 gap-6 mt-4 text-center">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">Total Subsections</div>
            <div className="text-xl font-bold">{report.totalSubsections}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-sm text-gray-500">Mapped</div>
            <div className="text-xl font-bold text-green-600">
              {report.mappedSubsections} 
              <span className="text-sm font-normal ml-1">
                ({Math.round(report.mappedSubsections / report.totalSubsections * 100)}%)
              </span>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <div className="text-sm text-gray-500">Unmapped</div>
            <div className="text-xl font-bold text-yellow-600">
              {report.unmappedSubsections}
              <span className="text-sm font-normal ml-1">
                ({Math.round(report.unmappedSubsections / report.totalSubsections * 100)}%)
              </span>
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <div className="text-sm text-gray-500">Orphaned</div>
            <div className="text-xl font-bold text-red-600">
              {report.orphanedSubsections}
              <span className="text-sm font-normal ml-1">
                ({Math.round(report.orphanedSubsections / report.totalSubsections * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex border-b">
        <button 
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('summary')}
        >
          Section Summary
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'issues' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('issues')}
        >
          Issues {report.issues.length > 0 && `(${report.issues.length})`}
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('details')}
        >
          Subsection Details
        </button>
      </div>
      
      <div className="p-4">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-2 gap-4">
            {sectionIds.map(sectionId => (
              <SectionSummary 
                key={sectionId}
                sectionId={sectionId}
                {...report.sectionSummary[sectionId]}
              />
            ))}
          </div>
        )}
        
        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div>
            {report.issues.length === 0 ? (
              <div className="text-center text-green-500 p-4">
                No issues found! All subsections are properly mapped.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {report.issues.filter(i => i.level === 'error').length} Errors, 
                    {' '}{report.issues.filter(i => i.level === 'warning').length} Warnings
                  </h3>
                  
                  {/* Filter by section */}
                  <div className="flex items-center">
                    <label className="text-sm mr-2">Filter by section:</label>
                    <select 
                      className="border rounded p-1 text-sm"
                      value={filterSection || ''}
                      onChange={(e) => setFilterSection(e.target.value || null)}
                    >
                      <option value="">All Sections</option>
                      {sectionIds.map(id => (
                        <option key={id} value={id}>Section {id}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Error issues first */}
                {report.issues
                  .filter(i => i.level === 'error')
                  .filter(i => !filterSection || (i.subsectionId && i.subsectionId.startsWith(`${filterSection}.`)))
                  .map((issue, idx) => (
                    <IssueItem key={`error-${idx}`} issue={issue} />
                  ))
                }
                
                {/* Warning issues second */}
                {report.issues
                  .filter(i => i.level === 'warning')
                  .filter(i => !filterSection || (i.subsectionId && i.subsectionId.startsWith(`${filterSection}.`)))
                  .map((issue, idx) => (
                    <IssueItem key={`warning-${idx}`} issue={issue} />
                  ))
                }
              </>
            )}
          </div>
        )}
        
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Subsection Details</h3>
                
                {/* Filter by section */}
                <div className="flex items-center">
                  <label className="text-sm mr-2">Filter by section:</label>
                  <select 
                    className="border rounded p-1 text-sm"
                    value={filterSection || ''}
                    onChange={(e) => setFilterSection(e.target.value || null)}
                  >
                    <option value="">All Sections</option>
                    {sectionIds.map(id => (
                      <option key={id} value={id}>Section {id}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subsection</th>
                    <th className="py-2 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fields</th>
                    <th className="py-2 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mapped</th>
                    <th className="py-2 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Not Orphaned</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSubsectionDetails.map(([subsectionId, details]) => (
                    <SubsectionDetailRow 
                      key={subsectionId} 
                      subsectionId={subsectionId} 
                      details={details} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubsectionValidationReportComponent; 