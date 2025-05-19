import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { createSubsectionValidator, type SubsectionValidationReport } from '../../utils/validation/SubsectionValidator';
import type { FieldHierarchy } from '../../../api/interfaces/FieldMetadata';
import { useFormState } from '../../state/hooks';

// Component styling
const styles: Record<string, CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
  },
  header: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  summary: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '15px',
    marginBottom: '20px',
  },
  summaryItem: {
    padding: '10px 15px',
    borderRadius: '4px',
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100px',
  },
  issuesContainer: {
    marginBottom: '20px',
  },
  issuesList: {
    backgroundColor: '#fff',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '15px',
  },
  issueItem: {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  issueIcon: {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  errorIcon: {
    backgroundColor: '#dc3545',
  },
  warningIcon: {
    backgroundColor: '#ffc107',
  },
  sectionTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    textAlign: 'left' as const,
    padding: '12px 15px',
    borderBottom: '1px solid #dee2e6',
    color: '#495057',
  },
  tableCell: {
    padding: '12px 15px',
    borderBottom: '1px solid #dee2e6',
    color: '#212529',
  },
  tabButton: {
    padding: '10px 15px',
    border: 'none',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    marginRight: '5px',
    borderBottom: '2px solid transparent',
  },
  activeTabButton: {
    borderBottom: '2px solid #007bff',
    backgroundColor: '#e9ecef',
    fontWeight: 'bold',
  },
  tabContent: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '0 4px 4px 4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  detailsAccordion: {
    marginBottom: '10px',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  accordionHeader: {
    padding: '12px 15px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  accordionContent: {
    padding: '15px',
    backgroundColor: '#fff',
  },
  progressBar: {
    height: '8px',
    width: '100%',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '5px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666',
  }
};

// Status badge colors
const statusColors = {
  mapped: '#28a745',
  unmapped: '#dc3545',
  orphaned: '#ffc107',
  low: '#6c757d',
};

interface SubsectionValidationDashboardProps {
  fieldHierarchy?: FieldHierarchy | null;
  refreshInterval?: number; // refresh interval in milliseconds
}

const SubsectionValidationDashboard: React.FC<SubsectionValidationDashboardProps> = ({
  fieldHierarchy = null,
  refreshInterval = 0, // 0 means no auto-refresh
}) => {
  const [report, setReport] = useState<SubsectionValidationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'issues' | 'details'>('summary');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Get form state for context data
  const formState = useFormState();
  
  useEffect(() => {
    // Generate validation report
    const generateReport = () => {
      setLoading(true);
      try {
        const validator = createSubsectionValidator(fieldHierarchy, formState);
        const validationReport = validator.validateAllSubsections();
        setReport(validationReport);
      } catch (error) {
        console.error('Error generating validation report:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Generate report initially
    generateReport();
    
    // Set up auto-refresh if interval is provided
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(generateReport, refreshInterval);
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fieldHierarchy, formState, refreshInterval]);
  
  const toggleSectionExpansion = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
  };
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        Generating validation report...
      </div>
    );
  }
  
  if (!report) {
    return (
      <div style={styles.loadingContainer}>
        No validation data available. Please check field hierarchy and context data.
      </div>
    );
  }
  
  // Calculate percentages for summary
  const mappedPercentage = Math.round((report.mappedSubsections / report.totalSubsections) * 100) || 0;
  const unmappedPercentage = Math.round((report.unmappedSubsections / report.totalSubsections) * 100) || 0;
  const orphanedPercentage = Math.round((report.orphanedSubsections / report.totalSubsections) * 100) || 0;
  
  const errorIssues = report.issues.filter(issue => issue.level === 'error');
  const warningIssues = report.issues.filter(issue => issue.level === 'warning');
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Subsection Validation Report</h1>
        <p>Generated: {new Date(report.timestamp).toLocaleString()}</p>
      </div>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'summary' ? styles.activeTabButton : {}) }}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'issues' ? styles.activeTabButton : {}) }}
          onClick={() => setActiveTab('issues')}
        >
          Issues ({report.issues.length})
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'details' ? styles.activeTabButton : {}) }}
          onClick={() => setActiveTab('details')}
        >
          Section Details
        </button>
      </div>
      
      {/* Tab Content */}
      <div style={styles.tabContent}>
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <>
            <div style={styles.summary}>
              <div style={{ ...styles.summaryItem, backgroundColor: '#e8f4fc' } as CSSProperties}>
                <div style={{ fontSize: '32px' }}>{report.totalSubsections}</div>
                <div>Total Subsections</div>
              </div>
              <div style={{ ...styles.summaryItem, backgroundColor: '#e8f8e8' } as CSSProperties}>
                <div style={{ fontSize: '32px' }}>{report.mappedSubsections}</div>
                <div>Mapped ({mappedPercentage}%)</div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${mappedPercentage}%`, backgroundColor: statusColors.mapped }}></div>
                </div>
              </div>
              <div style={{ ...styles.summaryItem, backgroundColor: '#fef0f0' } as CSSProperties}>
                <div style={{ fontSize: '32px' }}>{report.unmappedSubsections}</div>
                <div>Unmapped ({unmappedPercentage}%)</div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${unmappedPercentage}%`, backgroundColor: statusColors.unmapped }}></div>
                </div>
              </div>
              <div style={{ ...styles.summaryItem, backgroundColor: '#fff8e6' } as CSSProperties}>
                <div style={{ fontSize: '32px' }}>{report.orphanedSubsections}</div>
                <div>Orphaned ({orphanedPercentage}%)</div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${orphanedPercentage}%`, backgroundColor: statusColors.orphaned }}></div>
                </div>
              </div>
            </div>
            
            <h2>Section Summary</h2>
            <table style={styles.sectionTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Section</th>
                  <th style={styles.tableHeader}>Total</th>
                  <th style={styles.tableHeader}>Mapped</th>
                  <th style={styles.tableHeader}>Unmapped</th>
                  <th style={styles.tableHeader}>Coverage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.sectionSummary)
                  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                  .map(([sectionId, summary]) => {
                    const coverage = Math.round(summary.mapped / summary.total * 100);
                    let backgroundColor = '#ffffff';
                    if (coverage === 100) backgroundColor = '#f6fff6';
                    else if (coverage <= 50) backgroundColor = '#fff6f6';
                    else backgroundColor = '#fffff6';
                    
                    return (
                      <tr key={sectionId} style={{ backgroundColor }}>
                        <td style={styles.tableCell}>Section {sectionId}</td>
                        <td style={styles.tableCell}>{summary.total}</td>
                        <td style={styles.tableCell}>{summary.mapped}</td>
                        <td style={styles.tableCell}>{summary.unmapped}</td>
                        <td style={styles.tableCell}>
                          <div style={{ fontWeight: 'bold' }}>{coverage}%</div>
                          <div style={styles.progressBar}>
                            <div 
                              style={{
                                ...styles.progressFill,
                                width: `${coverage}%`,
                                backgroundColor: coverage === 100 ? statusColors.mapped : 
                                  coverage < 50 ? statusColors.unmapped : statusColors.orphaned
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </>
        )}
        
        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div style={styles.issuesContainer}>
            <h2>Issues ({report.issues.length})</h2>
            
            {errorIssues.length > 0 && (
              <>
                <h3>Errors ({errorIssues.length})</h3>
                <div style={styles.issuesList}>
                  {errorIssues.map((issue, index) => (
                    <div key={`error-${index}`} style={{ ...styles.issueItem, backgroundColor: '#fff8f8' }}>
                      <div style={{ ...styles.issueIcon, ...styles.errorIcon }}>!</div>
                      <div>
                        <div><strong>{issue.subsectionId}</strong>: {issue.message}</div>
                        {issue.suggestion && <div style={{ marginTop: '5px', color: '#666' }}><em>Suggestion: {issue.suggestion}</em></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {warningIssues.length > 0 && (
              <>
                <h3>Warnings ({warningIssues.length})</h3>
                <div style={styles.issuesList}>
                  {warningIssues.map((issue, index) => (
                    <div key={`warning-${index}`} style={{ ...styles.issueItem, backgroundColor: '#fffdf6' }}>
                      <div style={{ ...styles.issueIcon, ...styles.warningIcon }}>⚠</div>
                      <div>
                        <div><strong>{issue.subsectionId}</strong>: {issue.message}</div>
                        {issue.suggestion && <div style={{ marginTop: '5px', color: '#666' }}><em>Suggestion: {issue.suggestion}</em></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {report.issues.length === 0 && (
              <div style={{ padding: '20px', backgroundColor: '#f6fff6', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
                <div>No issues found. All subsections are properly mapped.</div>
              </div>
            )}
          </div>
        )}
        
        {/* Section Details Tab */}
        {activeTab === 'details' && (
          <div>
            <h2>Subsection Details</h2>
            
            {/* Group by section for readability */}
            {Array.from(new Set(
              Object.keys(report.subsectionDetails).map(id => id.split('.')[0])
            ))
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(sectionId => {
                const isExpanded = expandedSections.has(sectionId);
                const sectionSubsections = Object.entries(report.subsectionDetails)
                  .filter(([id]) => id.startsWith(`${sectionId}.`))
                  .sort((a, b) => {
                    const subA = parseFloat(a[0]);
                    const subB = parseFloat(b[0]);
                    return subA - subB;
                  });
                
                const sectionSummary = report.sectionSummary[sectionId];
                const coverage = Math.round(sectionSummary.mapped / sectionSummary.total * 100);
                
                return (
                  <div key={sectionId} style={styles.detailsAccordion}>
                    <div 
                      style={{
                        ...styles.accordionHeader,
                        backgroundColor: coverage === 100 ? '#f6fff6' : coverage < 50 ? '#fff6f6' : '#fffff6'
                      }}
                      onClick={() => toggleSectionExpansion(sectionId)}
                    >
                      <div>
                        Section {sectionId} 
                        <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                          ({sectionSummary.mapped}/{sectionSummary.total} mapped, {coverage}% coverage)
                        </span>
                      </div>
                      <div>{isExpanded ? '▼' : '▶'}</div>
                    </div>
                    
                    {isExpanded && (
                      <div style={styles.accordionContent}>
                        <table style={styles.sectionTable}>
                          <thead>
                            <tr>
                              <th style={styles.tableHeader}>Subsection</th>
                              <th style={styles.tableHeader}>Fields</th>
                              <th style={styles.tableHeader}>Status</th>
                              <th style={styles.tableHeader}>Issues</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sectionSubsections.map(([subsectionId, details]) => {
                              const statusBadges = [];
                              
                              if (!details.isMapped) {
                                statusBadges.push(
                                  <span 
                                    key="unmapped"
                                    style={{ ...styles.statusBadge, backgroundColor: statusColors.unmapped, marginRight: '5px' }}
                                  >
                                    Unmapped
                                  </span>
                                );
                              }
                              
                              if (details.isOrphaned) {
                                statusBadges.push(
                                  <span 
                                    key="orphaned"
                                    style={{ ...styles.statusBadge, backgroundColor: statusColors.orphaned, marginRight: '5px' }}
                                  >
                                    Orphaned
                                  </span>
                                );
                              }
                              
                              if (details.fieldCount < 3 && details.fieldCount > 0) {
                                statusBadges.push(
                                  <span 
                                    key="low"
                                    style={{ ...styles.statusBadge, backgroundColor: statusColors.low, marginRight: '5px' }}
                                  >
                                    Low Field Count
                                  </span>
                                );
                              }
                              
                              if (details.isMapped && !details.isOrphaned && details.fieldCount >= 3) {
                                statusBadges.push(
                                  <span 
                                    key="mapped"
                                    style={{ ...styles.statusBadge, backgroundColor: statusColors.mapped, marginRight: '5px' }}
                                  >
                                    OK
                                  </span>
                                );
                              }
                              
                              return (
                                <tr key={subsectionId}>
                                  <td style={styles.tableCell}>{subsectionId}</td>
                                  <td style={styles.tableCell}>{details.fieldCount}</td>
                                  <td style={styles.tableCell}>{statusBadges}</td>
                                  <td style={styles.tableCell}>{details.issues.join('; ') || '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubsectionValidationDashboard; 