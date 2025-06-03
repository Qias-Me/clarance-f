/**
 * Section 7: Your Contact Information - Component
 *
 * React component for SF-86 Section 7 using the new Form Architecture 2.0.
 * This component handles collection of contact information including phone
 * numbers, email addresses, and social media accounts.
 */

import React, { useEffect, useState } from 'react';
import { useSection7 } from '~/state/contexts/sections2.0/section7';

interface Section7ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section7Component: React.FC<Section7ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section7Data,
    updatePhoneNumber,
    addPhoneNumber,
    removePhoneNumber,
    phoneNumbers,
    updateHomeEmail,
    updateWorkEmail,
    addEmailAddress,
    removeEmailAddress,
    emailAddresses,
    updateSocialMedia,
    addSocialMedia,
    removeSocialMedia,
    socialMedia,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection7();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section7Data, phoneNumbers, emailAddresses, socialMedia]); // Removed validateSection and onValidationChange to prevent infinite loops

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid && onNext) {
      onNext();
    }
  };

  // Phone type options
  const phoneTypes = [
    { value: 'MOBILE', label: 'Mobile' },
    { value: 'HOME', label: 'Home' },
    { value: 'WORK', label: 'Work' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Social media platform options
  const socialMediaPlatforms = [
    { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'TWITTER', label: 'Twitter/X' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
    { value: 'GITHUB', label: 'GitHub' },
    { value: 'YOUTUBE', label: 'YouTube' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Render a fixed phone number entry (from section7Data.entries)
  const renderFixedPhoneEntry = (phone: any, index: number, phoneType: string) => {
    return (
      <div key={`fixed-phone-${index}`} className="border rounded-lg p-4 mb-4 bg-blue-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">
            {phoneType.charAt(0).toUpperCase() + phoneType.slice(1)} Phone
          </h4>
          <span className="text-sm text-blue-600">Fixed Field</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Phone Number */}
          <div>
            <label
              htmlFor={`fixed-phone-number-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id={`fixed-phone-number-${index}`}
              data-testid={`fixed-phone-number-${index}`}
              value={phone.number?.value || ''}
              onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(123) 456-7890"
            />
            {errors[`section7.entries[${index}].number`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`section7.entries[${index}].number`]}</p>
            )}
          </div>

          {/* Extension */}
          <div>
            <label
              htmlFor={`fixed-phone-extension-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Extension
            </label>
            <input
              type="text"
              id={`fixed-phone-extension-${index}`}
              data-testid={`fixed-phone-extension-${index}`}
              value={phone.extension?.value || ''}
              onChange={(e) => updatePhoneNumber(index, 'extension', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1234"
            />
          </div>
        </div>

        {/* Time preferences and international */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={phone.dayTime?.value || false}
              onChange={(e) => updatePhoneNumber(index, 'dayTime', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Day time</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={phone.nightTime?.value || false}
              onChange={(e) => updatePhoneNumber(index, 'nightTime', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Night time</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={phone.isInternational?.value || false}
              onChange={(e) => updatePhoneNumber(index, 'isInternational', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">International or DSN phone number</span>
          </label>
        </div>
      </div>
    );
  };

  // Render a dynamic phone number entry
  const renderPhoneEntry = (phone: any, index: number) => {
    return (
      <div key={`phone-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Phone #{index + 1}</h4>
          <button
            type="button"
            onClick={() => removePhoneNumber(index)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Remove phone ${index + 1}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Phone Type */}
          <div>
            <label
              htmlFor={`phone-type-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Type <span className="text-red-500">*</span>
            </label>
            <select
              id={`phone-type-${index}`}
              data-testid={`phone-type-${index}`}
              value={phone.type?.value || ''}
              onChange={(e) => updatePhoneNumber(index, 'type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select type</option>
              {phoneTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors[`phoneNumbers[${index}].type`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`phoneNumbers[${index}].type`]}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor={`phone-number-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id={`phone-number-${index}`}
              data-testid={`phone-number-${index}`}
              value={phone.number?.value || ''}
              onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(123) 456-7890"
              required
            />
            {errors[`phoneNumbers[${index}].number`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`phoneNumbers[${index}].number`]}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render an email address entry
  const renderEmailEntry = (email: any, index: number) => {
    return (
      <div key={`email-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Email #{index + 1}</h4>
          <button
            type="button"
            onClick={() => removeEmailAddress(index)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Remove email ${index + 1}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor={`email-address-${index}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id={`email-address-${index}`}
            data-testid={`email-address-${index}`}
            value={email.address?.value || ''}
            onChange={(e) => {
              // For simplicity, update the dynamic email addresses directly
              // This could be enhanced to sync with section7Data if needed
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="example@email.com"
            required
          />
          {errors[`emailAddresses[${index}].address`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`emailAddresses[${index}].address`]}</p>
          )}
        </div>
      </div>
    );
  };

  // Render a social media entry
  const renderSocialMediaEntry = (socialMedia: any, index: number) => {
    return (
      <div key={`social-media-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Social Media #{index + 1}</h4>
          <button
            type="button"
            onClick={() => removeSocialMedia(index)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Remove social media ${index + 1}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Platform */}
          <div>
            <label
              htmlFor={`social-media-platform-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Platform <span className="text-red-500">*</span>
            </label>
            <select
              id={`social-media-platform-${index}`}
              data-testid={`social-media-platform-${index}`}
              value={socialMedia.platform?.value || ''}
              onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select platform</option>
              {socialMediaPlatforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor={`social-media-username-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username/Handle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`social-media-username-${index}`}
              data-testid={`social-media-username-${index}`}
              value={socialMedia.username?.value || ''}
              onChange={(e) => updateSocialMedia(index, 'username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="@username"
              required
            />
          </div>
        </div>

        {/* URL (if platform is OTHER) */}
        {socialMedia.platform?.value === 'OTHER' && (
          <div className="mt-4">
            <label
              htmlFor={`social-media-url-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id={`social-media-url-${index}`}
              data-testid={`social-media-url-${index}`}
              value={socialMedia.url?.value || ''}
              onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/profile"
              required
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section7-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 7: Your Contact Information
        </h2>
        <p className="text-gray-600">
          Provide your contact information including phone numbers, email addresses, and social media accounts.
        </p>
      </div>

      {/* Contact Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Fixed Email Fields Section */}
        <div className="border rounded-lg p-5 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">Primary Email Addresses (PDF Fields)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Email Address
              </label>
              <input
                type="email"
                value={section7Data.section7.homeEmail.value || ''}
                onChange={(e) => updateHomeEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="home@example.com"
              />
              {errors['section7.homeEmail'] && (
                <p className="mt-1 text-sm text-red-600">{errors['section7.homeEmail']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Email Address
              </label>
              <input
                type="email"
                value={section7Data.section7.workEmail.value || ''}
                onChange={(e) => updateWorkEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="work@example.com"
              />
              {errors['section7.workEmail'] && (
                <p className="mt-1 text-sm text-red-600">{errors['section7.workEmail']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Phone Numbers Section */}
        <div className="border rounded-lg p-5 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">Phone Numbers (PDF Fields)</h3>
          <p className="text-sm text-blue-600 mb-4">These are the fixed phone fields that map to the PDF form</p>

          {section7Data.section7.entries && section7Data.section7.entries.length > 0 ? (
            <div className="space-y-4">
              {section7Data.section7.entries.map((phone, index) => {
                const phoneType = index === 0 ? 'home' : index === 1 ? 'work' : 'mobile';
                return renderFixedPhoneEntry(phone, index, phoneType);
              })}
            </div>
          ) : (
            <p className="italic text-gray-500 mb-4">No phone numbers available.</p>
          )}
        </div>

        {/* Dynamic Phone Numbers Section */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Additional Phone Numbers</h3>
          <p className="text-sm text-gray-600 mb-4">Add extra phone numbers beyond the standard home/work/mobile</p>

          {phoneNumbers.length > 0 ? (
            <div className="mb-4">
              {phoneNumbers.map((phone, index) => renderPhoneEntry(phone, index))}
            </div>
          ) : (
            <p className="italic text-gray-500 mb-4">No additional phone numbers added yet.</p>
          )}

          <button
            type="button"
            onClick={addPhoneNumber}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            data-testid="add-phone-button"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Additional Phone Number
          </button>
        </div>

        {/* Dynamic Email Addresses Section */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Additional Email Addresses</h3>
          <p className="text-sm text-gray-600 mb-4">Add extra email addresses beyond home and work</p>

          {emailAddresses.length > 0 ? (
            <div className="mb-4">
              {emailAddresses.map((email, index) => renderEmailEntry(email, index))}
            </div>
          ) : (
            <p className="italic text-gray-500 mb-4">No additional email addresses added yet.</p>
          )}

          <button
            type="button"
            onClick={addEmailAddress}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            data-testid="add-email-button"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Additional Email Address
          </button>
        </div>

        {/* Social Media Section */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Social Media Accounts</h3>
          <p className="text-sm text-gray-600 mb-4">Add your social media accounts (supplementary information)</p>

          {socialMedia.length > 0 ? (
            <div className="mb-4">
              {socialMedia.map((sm, index) => renderSocialMediaEntry(sm, index))}
            </div>
          ) : (
            <p className="italic text-gray-500 mb-4">No social media accounts added yet.</p>
          )}

          <button
            type="button"
            onClick={addSocialMedia}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            data-testid="add-social-media-button"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Social Media Account
          </button>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              data-testid="submit-section-button"
            >
              Submit & Continue
            </button>

            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              data-testid="clear-section-button"
              onClick={resetSection}
            >
              Clear Section
            </button>
          </div>
        </div>

        {/* Validation Status */}
        <div className="mt-4" data-testid="validation-status">
          <div className="text-sm text-gray-600">
            Section Status: <span className={`font-medium ${isDirty ? 'text-orange-500' : 'text-green-500'}`}>
              {isDirty ? 'Modified, needs validation' : 'Ready for input'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Validation: <span className={`font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
              {isValid ? 'Valid' : 'Has errors'}
            </span>
          </div>
        </div>
      </form>

      {/* Section Summary */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Section 7 Data Summary</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Fixed Email Fields:</strong> Home: {section7Data.section7.homeEmail.value ? '✓' : '○'}, Work: {section7Data.section7.workEmail.value ? '✓' : '○'}</p>
          <p><strong>Fixed Phone Fields:</strong> {section7Data.section7.entries?.length || 0} entries configured</p>
          <p><strong>Additional Phone Numbers:</strong> {phoneNumbers.length} added</p>
          <p><strong>Additional Email Addresses:</strong> {emailAddresses.length} added</p>
          <p><strong>Social Media Accounts:</strong> {socialMedia.length} added</p>
          <p className="mt-2 pt-2 border-t border-blue-200">
            <strong>PDF Integration:</strong> Fixed fields map to section-7.json (17 total fields). Additional fields are for supplementary information.
          </p>
        </div>
      </div>

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 7 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section7Data, null, 2)}
            </pre>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Dynamic Arrays:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify({phoneNumbers, emailAddresses, socialMedia}, null, 2)}
            </pre>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Validation Errors:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default Section7Component;