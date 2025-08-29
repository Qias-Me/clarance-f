import React from 'react';
import { SelectOption } from '../../types/form.types';

// Basic field components
export const TextField: React.FC<any> = ({ value, onChange, ...props }) => (
  <input
    type="text"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    {...props}
  />
);

export const NumberField: React.FC<any> = ({ value, onChange, ...props }) => (
  <input
    type="number"
    value={value || ''}
    onChange={(e) => onChange(e.target.valueAsNumber)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    {...props}
  />
);

export const DateField: React.FC<any> = ({ value, onChange, ...props }) => (
  <input
    type="date"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    {...props}
  />
);

export const SelectField: React.FC<any> = ({ value, onChange, options = [], ...props }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    {...props}
  >
    <option value="">Select...</option>
    {options.map((option: SelectOption) => (
      <option key={option.value} value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    ))}
  </select>
);

export const CheckboxField: React.FC<any> = ({ value, onChange, label, ...props }) => (
  <label className="flex items-center">
    <input
      type="checkbox"
      checked={!!value}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      {...props}
    />
    {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
  </label>
);

export const TextareaField: React.FC<any> = ({ value, onChange, rows = 4, ...props }) => (
  <textarea
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    {...props}
  />
);

// Complex field components
export const AddressField: React.FC<any> = ({ value = {}, onChange, ...props }) => {
  const handleChange = (field: string, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Street Address"
        value={value.street || ''}
        onChange={(e) => handleChange('street', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="City"
          value={value.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          placeholder="State"
          value={value.state || ''}
          onChange={(e) => handleChange('state', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <input
        type="text"
        placeholder="ZIP Code"
        value={value.zip || ''}
        onChange={(e) => handleChange('zip', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  );
};

export const DateRangeField: React.FC<any> = ({ value = {}, onChange, ...props }) => {
  const handleChange = (field: string, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
        <input
          type="date"
          value={value.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">End Date</label>
        <input
          type="date"
          value={value.endDate || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
};

export const EmploymentHistoryField: React.FC<any> = ({ value = [], onChange, ...props }) => {
  const addEmployment = () => {
    onChange([...value, { employer: '', position: '', startDate: '', endDate: '' }]);
  };

  const updateEmployment = (index: number, field: string, fieldValue: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  const removeEmployment = (index: number) => {
    onChange(value.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      {value.map((employment: any, index: number) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md">
          <div className="flex justify-between mb-3">
            <h4 className="text-sm font-medium">Employment #{index + 1}</h4>
            <button
              type="button"
              onClick={() => removeEmployment(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Employer Name"
              value={employment.employer || ''}
              onChange={(e) => updateEmployment(index, 'employer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Position"
              value={employment.position || ''}
              onChange={(e) => updateEmployment(index, 'position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <DateRangeField
              value={{ startDate: employment.startDate, endDate: employment.endDate }}
              onChange={(dates: any) => {
                updateEmployment(index, 'startDate', dates.startDate);
                updateEmployment(index, 'endDate', dates.endDate);
              }}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEmployment}
        className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
      >
        Add Employment
      </button>
    </div>
  );
};

// Field registry mapping field types to components
export const fieldRegistry: Record<string, React.FC<any>> = {
  text: TextField,
  number: NumberField,
  date: DateField,
  select: SelectField,
  checkbox: CheckboxField,
  textarea: TextareaField,
  address: AddressField,
  'date-range': DateRangeField,
  'employment-history': EmploymentHistoryField
};

// Function to register custom field components
export function registerFieldComponent(type: string, component: React.FC<any>): void {
  fieldRegistry[type] = component;
}

// Function to get field component
export function getFieldComponent(type: string): React.FC<any> | null {
  return fieldRegistry[type] || null;
}