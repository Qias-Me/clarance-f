import React, { memo } from 'react';
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '../../../../utils/constants';

interface FieldGroupProps {
  errors?: Record<string, string>;
  disabled?: boolean;
  required?: boolean;
}

interface AddressFieldGroupProps extends FieldGroupProps {
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  onUpdate: (field: string, value: string) => void;
  prefix?: string;
  includeCountry?: boolean;
}

export const AddressFieldGroup = memo<AddressFieldGroupProps>(({ 
  address, 
  onUpdate, 
  errors = {}, 
  prefix = '',
  disabled = false,
  required = false,
  includeCountry = false
}) => {
  const fieldName = (field: string) => prefix ? `${prefix}.${field}` : field;

  return (
    <div className="address-field-group space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={address.street || ''}
          onChange={(e) => onUpdate('street', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-invalid={!!errors[fieldName('street')]}
        />
        {errors[fieldName('street')] && (
          <p className="mt-1 text-sm text-red-600">{errors[fieldName('street')]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={address.city || ''}
            onChange={(e) => onUpdate('city', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors[fieldName('city')]}
          />
          {errors[fieldName('city')] && (
            <p className="mt-1 text-sm text-red-600">{errors[fieldName('city')]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={address.state || ''}
            onChange={(e) => onUpdate('state', e.target.value)}
            disabled={disabled}
            maxLength={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors[fieldName('state')]}
          />
          {errors[fieldName('state')] && (
            <p className="mt-1 text-sm text-red-600">{errors[fieldName('state')]}</p>
          )}
        </div>
      </div>

      <div className={includeCountry ? "grid grid-cols-2 gap-3" : ""}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={address.zip || ''}
            onChange={(e) => onUpdate('zip', e.target.value)}
            disabled={disabled}
            pattern={VALIDATION_PATTERNS.ZIP.source}
            placeholder="12345 or 12345-6789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors[fieldName('zip')]}
          />
          {errors[fieldName('zip')] && (
            <p className="mt-1 text-sm text-red-600">{errors[fieldName('zip')]}</p>
          )}
        </div>

        {includeCountry && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={address.country || ''}
              onChange={(e) => onUpdate('country', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={!!errors[fieldName('country')]}
            />
            {errors[fieldName('country')] && (
              <p className="mt-1 text-sm text-red-600">{errors[fieldName('country')]}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

AddressFieldGroup.displayName = 'AddressFieldGroup';

interface DateRangeFieldGroupProps extends FieldGroupProps {
  startDate?: string;
  endDate?: string;
  onUpdate: (field: 'startDate' | 'endDate', value: string) => void;
  labels?: {
    start?: string;
    end?: string;
  };
  allowPresent?: boolean;
  minDate?: string;
  maxDate?: string;
}

export const DateRangeFieldGroup = memo<DateRangeFieldGroupProps>(({ 
  startDate,
  endDate,
  onUpdate,
  errors = {},
  disabled = false,
  required = false,
  labels = { start: 'From', end: 'To' },
  allowPresent = false,
  minDate,
  maxDate
}) => {
  return (
    <div className="date-range-field-group">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {labels.start} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => onUpdate('startDate', e.target.value)}
            disabled={disabled}
            min={minDate}
            max={maxDate || endDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors.startDate}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {labels.end} {!required && '(Optional)'}
          </label>
          {allowPresent && !endDate ? (
            <div className="flex items-center h-[42px]">
              <input
                type="checkbox"
                checked={!endDate}
                onChange={(e) => onUpdate('endDate', e.target.checked ? '' : startDate || '')}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Present</label>
            </div>
          ) : (
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => onUpdate('endDate', e.target.value)}
              disabled={disabled}
              min={startDate}
              max={maxDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={!!errors.endDate}
            />
          )}
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      {startDate && endDate && new Date(endDate) < new Date(startDate) && (
        <p className="mt-2 text-sm text-red-600">
          End date cannot be before start date
        </p>
      )}
    </div>
  );
});

DateRangeFieldGroup.displayName = 'DateRangeFieldGroup';

interface PersonContactFieldGroupProps extends FieldGroupProps {
  contact: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  };
  onUpdate: (field: string, value: string) => void;
  includePhone?: boolean;
  includeEmail?: boolean;
  includeRelationship?: boolean;
  includeMiddleName?: boolean;
}

export const PersonContactFieldGroup = memo<PersonContactFieldGroupProps>(({
  contact,
  onUpdate,
  errors = {},
  disabled = false,
  required = false,
  includePhone = true,
  includeEmail = true,
  includeRelationship = false,
  includeMiddleName = true
}) => {
  return (
    <div className="person-contact-field-group space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={contact.firstName || ''}
            onChange={(e) => onUpdate('firstName', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {includeMiddleName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name
            </label>
            <input
              type="text"
              value={contact.middleName || ''}
              onChange={(e) => onUpdate('middleName', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className={includeMiddleName ? "" : "col-span-2"}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={contact.lastName || ''}
            onChange={(e) => onUpdate('lastName', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      {(includePhone || includeEmail) && (
        <div className="grid grid-cols-2 gap-3">
          {includePhone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="tel"
                value={contact.phone || ''}
                onChange={(e) => onUpdate('phone', e.target.value)}
                disabled={disabled}
                pattern={VALIDATION_PATTERNS.PHONE.source}
                placeholder="(123) 456-7890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          )}

          {includeEmail && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                value={contact.email || ''}
                onChange={(e) => onUpdate('email', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          )}
        </div>
      )}

      {includeRelationship && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relationship {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={contact.relationship || ''}
            onChange={(e) => onUpdate('relationship', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors.relationship}
          />
          {errors.relationship && (
            <p className="mt-1 text-sm text-red-600">{errors.relationship}</p>
          )}
        </div>
      )}
    </div>
  );
});

PersonContactFieldGroup.displayName = 'PersonContactFieldGroup';