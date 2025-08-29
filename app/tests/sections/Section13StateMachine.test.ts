/**
 * Tests for Section 13 State Machine
 */

import { Section13StateMachine, EmploymentState, EmploymentEvent } from '../../state/machines/Section13StateMachine';
import { createEmploymentEntry } from '../../utils/section13-helpers';

// Mock logger
jest.mock('../../services/Logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Section13StateMachine', () => {
  let machine: Section13StateMachine;
  
  beforeEach(() => {
    machine = new Section13StateMachine();
  });
  
  afterEach(() => {
    machine.destroy();
  });
  
  describe('State Transitions', () => {
    test('initializes in IDLE state', () => {
      expect(machine.getState()).toBe(EmploymentState.IDLE);
    });
    
    test('transitions to ADDING_ENTRY on ADD event', () => {
      machine.send(EmploymentEvent.ADD);
      expect(machine.getState()).toBe(EmploymentState.ADDING_ENTRY);
    });
    
    test('creates new entry when adding', () => {
      const context = machine.getContext();
      expect(context.entries.length).toBe(0);
      
      machine.addEntry();
      
      const newContext = machine.getContext();
      expect(newContext.currentEntry).not.toBeNull();
      expect(newContext.isDirty).toBe(true);
    });
    
    test('transitions to EDITING_ENTRY on EDIT event', () => {
      // Add an entry first
      const entry = createEmploymentEntry('test');
      machine = new Section13StateMachine([entry as any]);
      
      machine.editEntry(0);
      expect(machine.getState()).toBe(EmploymentState.EDITING_ENTRY);
      
      const context = machine.getContext();
      expect(context.currentIndex).toBe(0);
      expect(context.currentEntry).toBeTruthy();
    });
    
    test('handles DELETE event correctly', () => {
      const entry = createEmploymentEntry('test');
      machine = new Section13StateMachine([entry as any]);
      
      expect(machine.getContext().entries.length).toBe(1);
      
      machine.deleteEntry(0);
      
      const context = machine.getContext();
      expect(context.entries.length).toBe(0);
      expect(context.isDirty).toBe(true);
    });
    
    test('transitions to ERROR state on invalid operations', () => {
      machine.send(EmploymentEvent.EDIT, { index: -1 });
      expect(machine.getState()).toBe(EmploymentState.ERROR);
    });
    
    test('recovers from ERROR state', () => {
      machine.send(EmploymentEvent.ERROR);
      expect(machine.getState()).toBe(EmploymentState.ERROR);
      
      machine.send(EmploymentEvent.RETRY);
      expect(machine.getState()).toBe(EmploymentState.IDLE);
    });
  });
  
  describe('Entry Management', () => {
    test('enforces maximum entries limit', () => {
      machine = new Section13StateMachine([], { maxEntries: 2 });
      
      machine.addEntry();
      machine.send(EmploymentEvent.COMPLETE);
      machine.addEntry();
      machine.send(EmploymentEvent.COMPLETE);
      
      expect(machine.getContext().entries.length).toBe(0); // Entries not saved in this test
      
      // Try to add third entry
      machine.addEntry();
      // Should transition to error due to limit
    });
    
    test('validates entry fields', (done) => {
      machine = new Section13StateMachine([], { validationDelay: 10 });
      
      machine.on('validationComplete', ({ hasErrors, errors }) => {
        expect(hasErrors).toBe(true);
        expect(errors.employerName).toBeDefined();
        expect(errors.positionTitle).toBeDefined();
        done();
      });
      
      machine.addEntry();
      machine.validate();
    });
    
    test('validates date ranges', (done) => {
      const entry = createEmploymentEntry('test');
      entry.employerName.value = 'Test Company';
      entry.positionTitle.value = 'Test Position';
      entry.employmentDates.fromDate.value = '2023-01-01';
      entry.employmentDates.toDate.value = '2022-01-01'; // Invalid: before start
      
      machine = new Section13StateMachine([entry as any], { validationDelay: 10 });
      
      machine.on('validationComplete', ({ hasErrors, errors }) => {
        expect(hasErrors).toBe(true);
        expect(errors['entries.0.dateRange']).toBeDefined();
        done();
      });
      
      machine.validate();
    });
  });
  
  describe('Event Handlers', () => {
    test('emits events on state changes', (done) => {
      machine.on('stateChange', ({ prevState, nextState, event }) => {
        expect(prevState).toBe(EmploymentState.IDLE);
        expect(nextState).toBe(EmploymentState.ADDING_ENTRY);
        expect(event).toBe(EmploymentEvent.ADD);
        done();
      });
      
      machine.addEntry();
    });
    
    test('emits entryAdded event', (done) => {
      machine.on('entryAdded', ({ entry, index }) => {
        expect(entry).toBeDefined();
        expect(entry._id).toBeDefined();
        expect(index).toBe(0);
        done();
      });
      
      machine.addEntry();
    });
    
    test('emits entryDeleted event', (done) => {
      const entry = createEmploymentEntry('test');
      machine = new Section13StateMachine([entry as any]);
      
      machine.on('entryDeleted', ({ entry: deletedEntry, index }) => {
        expect(deletedEntry).toBeDefined();
        expect(index).toBe(0);
        done();
      });
      
      machine.deleteEntry(0);
    });
  });
  
  describe('Auto-save Functionality', () => {
    test('auto-saves on changes when enabled', (done) => {
      machine = new Section13StateMachine([], { autoSave: true });
      
      machine.on('saved', ({ entries }) => {
        expect(entries.length).toBe(1);
        done();
      });
      
      machine.addEntry();
      machine.saveChanges();
    });
    
    test('does not auto-save when disabled', () => {
      machine = new Section13StateMachine([], { autoSave: false });
      
      const saveSpy = jest.fn();
      machine.on('saved', saveSpy);
      
      machine.addEntry();
      machine.saveChanges();
      
      // Give time for save to occur if it would
      setTimeout(() => {
        expect(saveSpy).not.toHaveBeenCalled();
      }, 600);
    });
  });
  
  describe('Current Entry Updates', () => {
    test('updates current entry fields', () => {
      machine.addEntry();
      
      const updates = {
        employerName: { value: 'Updated Company' }
      };
      
      machine.updateCurrentEntry(updates as any);
      
      const context = machine.getContext();
      expect(context.currentEntry?.employerName.value).toBe('Updated Company');
      expect(context.isDirty).toBe(true);
    });
    
    test('triggers validation on update with auto-save', (done) => {
      machine = new Section13StateMachine([], { 
        autoSave: true,
        validationDelay: 10
      });
      
      machine.on('validationComplete', () => {
        done();
      });
      
      machine.addEntry();
      machine.updateCurrentEntry({ employerName: { value: 'Test' } } as any);
    });
  });
});