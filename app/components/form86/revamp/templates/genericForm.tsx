// GenericFormField.tsx
import React, { ChangeEvent } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface GenericFormFieldProps {
  type: 'text' | 'dropdown' | 'checkbox';
  id: string;
  label: string | { unchecked: string; checked: string };
  value: string | boolean | number;
  onChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => void;
  options?: DropdownOption[] | null;
}

const GenericFormField: React.FC<GenericFormFieldProps> = ({
  type,
  id,
  label,
  onChange,
  value,
  options,
}) => {
  const renderLabel = () => typeof label === 'object' ? (value ? label.checked : label.unchecked) : label;

  const renderInput = () => {
    switch (type) {
      case 'checkbox':
        return <input id={id} type="checkbox" checked={!!value} onChange={onChange} />;
      case 'dropdown':
        return (
          <select id={id} value={value ? String(value) : ''} onChange={onChange}>
            {options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return <input id={id} type="text" value={value ? String(value) : ''} onChange={onChange} />;
    }
  };

  return (
    <div className="form-field">
      <label htmlFor={id}>{renderLabel()}</label>
      {renderInput()}
    </div>
  );
};

export default GenericFormField;
