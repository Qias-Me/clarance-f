import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { ContactInfo, ContactNumber } from 'api/interfaces/sections/contact';
import { contactInfo as initialContactInfo } from './contactInfo';

// Define actions for the contact info reducer
export enum ContactInfoActionType {
  SET_HOME_EMAIL = 'SET_HOME_EMAIL',
  SET_WORK_EMAIL = 'SET_WORK_EMAIL',
  UPDATE_CONTACT_NUMBER = 'UPDATE_CONTACT_NUMBER',
  ADD_CONTACT_NUMBER = 'ADD_CONTACT_NUMBER',
  REMOVE_CONTACT_NUMBER = 'REMOVE_CONTACT_NUMBER',
  IMPORT_CONTACT_INFO = 'IMPORT_CONTACT_INFO'
}

// Define the action interfaces
interface SetHomeEmailAction {
  type: ContactInfoActionType.SET_HOME_EMAIL;
  payload: string;
}

interface SetWorkEmailAction {
  type: ContactInfoActionType.SET_WORK_EMAIL;
  payload: string;
}

interface UpdateContactNumberAction {
  type: ContactInfoActionType.UPDATE_CONTACT_NUMBER;
  payload: {
    id: number;
    field: keyof Omit<ContactNumber, '_id'>;
    subfield?: string;
    value: any;
  };
}

interface AddContactNumberAction {
  type: ContactInfoActionType.ADD_CONTACT_NUMBER;
  payload: Omit<ContactNumber, '_id'>;
}

interface RemoveContactNumberAction {
  type: ContactInfoActionType.REMOVE_CONTACT_NUMBER;
  payload: number; // id of the contact number to remove
}

interface ImportContactInfoAction {
  type: ContactInfoActionType.IMPORT_CONTACT_INFO;
  payload: ContactInfo;
}

// Union of all action types
type ContactInfoAction = 
  | SetHomeEmailAction 
  | SetWorkEmailAction 
  | UpdateContactNumberAction 
  | AddContactNumberAction 
  | RemoveContactNumberAction
  | ImportContactInfoAction;

// Context type definition including both state and dispatch
interface ContactInfoContextType {
  state: ContactInfo;
  dispatch: React.Dispatch<ContactInfoAction>;
}

// Create the context with a default value
const ContactInfoContext = createContext<ContactInfoContextType | undefined>(undefined);

// Contact info reducer function
function contactInfoReducer(state: ContactInfo, action: ContactInfoAction): ContactInfo {
  switch (action.type) {
    case ContactInfoActionType.SET_HOME_EMAIL:
      return {
        ...state,
        homeEmail: {
          ...state.homeEmail,
          value: action.payload
        }
      };
      
    case ContactInfoActionType.SET_WORK_EMAIL:
      return {
        ...state,
        workEmail: {
          ...state.workEmail,
          value: action.payload
        }
      };
      
    case ContactInfoActionType.UPDATE_CONTACT_NUMBER: {
      const { id, field, subfield, value } = action.payload;
      return {
        ...state,
        contactNumbers: state.contactNumbers.map(number => {
          if (number._id !== id) return number;
          
          // Handle nested field updates
          if (subfield) {
            return {
              ...number,
              [field]: {
                ...number[field],
                [subfield]: value
              }
            };
          }
          
          // Handle direct field updates
          return {
            ...number,
            [field]: value
          };
        })
      };
    }
    
    case ContactInfoActionType.ADD_CONTACT_NUMBER: {
      // Find the next available ID
      const maxId = Math.max(0, ...state.contactNumbers.map(n => n._id));
      return {
        ...state,
        contactNumbers: [
          ...state.contactNumbers,
          {
            _id: maxId + 1,
            ...action.payload
          }
        ]
      };
    }
    
    case ContactInfoActionType.REMOVE_CONTACT_NUMBER:
      return {
        ...state,
        contactNumbers: state.contactNumbers.filter(number => number._id !== action.payload)
      };
    
    case ContactInfoActionType.IMPORT_CONTACT_INFO:
      return action.payload;
      
    default:
      return state;
  }
}

// Provider component
interface ContactInfoProviderProps {
  children: ReactNode;
  initialState?: ContactInfo;
}

export function ContactInfoProvider({ 
  children, 
  initialState = initialContactInfo 
}: ContactInfoProviderProps) {
  const [state, dispatch] = useReducer(contactInfoReducer, initialState);
  
  return (
    <ContactInfoContext.Provider value={{ state, dispatch }}>
      {children}
    </ContactInfoContext.Provider>
  );
}

// Custom hook for using the contact info context
export function useContactInfo() {
  const context = useContext(ContactInfoContext);
  if (context === undefined) {
    throw new Error('useContactInfo must be used within a ContactInfoProvider');
  }
  return context;
}

// Utility functions for common operations
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatPhoneNumber(phone: string): string {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format U.S. phone number (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original value if not a standard US phone number
  return phone;
} 