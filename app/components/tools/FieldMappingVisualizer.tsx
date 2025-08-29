/**
 * Visual Field Mapping Tool
 * 
 * Interactive dashboard showing UI-to-PDF field connections
 * Helps developers achieve 100% field mapping coverage
 */

import React, { useState, useEffect } from 'react';
import { getPageFieldMappings, FieldMappingEntry } from '~/state/contexts/sections2.0/section13-field-mapping-enhanced';
import { integratedValidationService } from '../../../api/service/integratedValidationService';

interface FieldConnection {
  uiField: string;
  pdfField: string;
  status: 'mapped' | 'unmapped' | 'error';
  value?: any;
  page: number;
}

export const FieldMappingVisualizer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(17);
  const [fieldConnections, setFieldConnections] = useState<FieldConnection[]>([]);
  const [coverage, setCoverage] = useState(0);
  const [showUnmappedOnly, setShowUnmappedOnly] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Load field mappings for current page
  useEffect(() => {
    loadFieldMappings();
  }, [currentPage]);

  const loadFieldMappings = async () => {
    // Get all mappings for the current page
    const mappings = getPageFieldMappings(currentPage);
    
    // Create connection objects
    const connections: FieldConnection[] = mappings.map(mapping => ({
      uiField: mapping.uiPath,
      pdfField: mapping.pdfFieldName,
      status: 'mapped',
      page: mapping.page
    }));
    
    setFieldConnections(connections);
    calculateCoverage(connections);
  };

  const calculateCoverage = (connections: FieldConnection[]) => {
    const mapped = connections.filter(c => c.status === 'mapped').length;
    const total = connections.length;
    setCoverage(total > 0 ? (mapped / total) * 100 : 0);
  };

  const runValidation = async () => {
    try {
      // Generate a test PDF and validate
      const response = await fetch('/api/pdf-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 13 })
      });
      
      if (response.ok) {
        const { pdfBytes } = await response.json();
        
        // Run validation
        const result = await integratedValidationService.validateSection13Inputs(
          new Uint8Array(pdfBytes),
          {
            targetPage: currentPage,
            extractFields: true,
            validateAgainstExpected: false
          }
        );
        
        setValidationResult(result);
        
        // Update field connections with actual values
        if (result.pageResult?.fields) {
          const pdfFieldMap = new Map(
            result.pageResult.fields.map(f => [f.name, f.value])
          );
          
          setFieldConnections(prev => prev.map(conn => ({
            ...conn,
            value: pdfFieldMap.get(conn.pdfField),
            status: pdfFieldMap.has(conn.pdfField) ? 'mapped' : 'unmapped'
          })));
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mapped': return 'bg-green-100 text-green-800';
      case 'unmapped': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConnections = showUnmappedOnly 
    ? fieldConnections.filter(c => c.status === 'unmapped')
    : fieldConnections;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Field Mapping Visualizer
          </h1>
          <p className="text-gray-600">
            Visual tool for achieving 100% UI-to-PDF field mapping coverage
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Page:
              <select
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="ml-2 px-3 py-1 border border-gray-300 rounded-md"
              >
                {[17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33].map(page => (
                  <option key={page} value={page}>Page {page}</option>
                ))}
              </select>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUnmappedOnly}
                onChange={(e) => setShowUnmappedOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show unmapped only</span>
            </label>
          </div>
          
          <button
            onClick={runValidation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Run Validation
          </button>
        </div>

        {/* Coverage Meter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Field Coverage</span>
            <span className="text-sm font-bold text-gray-900">{coverage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${
                coverage >= 90 ? 'bg-green-600' : coverage >= 70 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${coverage}%` }}
            />
          </div>
        </div>

        {/* Field Connections Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UI Field Path
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PDF Field Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConnections.map((connection, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {connection.uiField}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">
                    {connection.pdfField}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {connection.value || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Validation Results
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Total Fields</div>
                <div className="text-xl font-bold text-gray-900">
                  {validationResult.totalFields}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Fields with Values</div>
                <div className="text-xl font-bold text-green-600">
                  {validationResult.fieldsWithValues}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Empty Fields</div>
                <div className="text-xl font-bold text-red-600">
                  {validationResult.fieldsEmpty}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            How to Achieve 100% Coverage:
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Review unmapped fields (red status) in the table above</li>
            <li>Add missing field mappings to section13-field-mapping-enhanced.ts</li>
            <li>Ensure UI components have corresponding input fields</li>
            <li>Run validation to verify mappings are working correctly</li>
            <li>Repeat for each page until 100% coverage is achieved</li>
          </ol>
        </div>
      </div>
    </div>
  );
};