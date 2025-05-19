import React from 'react';
import CitizenshipInfoWrapper from '../../components/citizenship/CitizenshipInfoWrapper';

/**
 * Route for the Citizenship section of the form (Section 9)
 * This route renders the citizenship information form using the CitizenshipInfoWrapper
 * which provides the CitizenshipInfo context to the RenderCitizenshipInfo component
 */
const CitizenshipRoute: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Section 9: Citizenship</h1>
      <CitizenshipInfoWrapper />
    </div>
  );
};

export default CitizenshipRoute; 