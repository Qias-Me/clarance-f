import React from "react";
import { useFormContext } from "../Formcontext"; // Adjust import path as needed
import {
  FormQuestion,
  QuestionType,
  ApplicantFormValues,
  FormSection,
  AnswerValue,
} from "../../../../../api/interfaces2.0/formDefinition"; // Ensure imports match your file structure


interface DynamicFormSectionComponentProps {
  sectionId: keyof ApplicantFormValues;
}

function getAnswerValue(
  sectionId: keyof ApplicantFormValues,
  questionId: string,
  formValues: ApplicantFormValues
): AnswerValue {
  const section = formValues[sectionId];
  if (!section) return undefined;

  // Check if the value is null and return undefined in that case
  const value = section[questionId as keyof typeof section];
  return value !== null ? value : undefined;
}

const DynamicFormSectionComponent: React.FC<
  DynamicFormSectionComponentProps
> = ({ sectionId }) => {
  const { formValues, setFormValue, processedFormConfig } = useFormContext();

  const section = processedFormConfig.formSections.find(
    (sec) => sec.id === sectionId
  );

  if (!section) return <p>Section not found</p>;

  function resetDependentValues(
    sectionId: keyof ApplicantFormValues,
    questionId: string,
    sections: FormSection[]
  ) {
    // A utility function to find and reset dependents within a given section
    const findAndResetDependents = (
      sec: FormSection,
      qId: string,
      sourceSectionId: keyof ApplicantFormValues
    ) => {
      sec.questions.forEach((q) => {
        if (q.condition && q.condition.dependsOn === qId) {
          // Reset the dependent question's value
          setFormValue(
            sourceSectionId,
            q.id as keyof (typeof formValues)[typeof sectionId],
            undefined
          ); // Adjust reset logic as needed
          // Recursively reset values for questions dependent on this dependent question
          resetDependentValues(sourceSectionId, q.id, sections);
        }
      });
    };

    // Iterating over all sections to handle cross-section dependencies
    sections.forEach((sec) => {
      // Reset dependents in the current section
      if (sec.id === sectionId) {
        findAndResetDependents(sec, questionId, sectionId);
      } else {
        // Check for cross-section dependencies
        // This assumes that a question in one section can depend on a question in another section
        // Adjust logic here based on your form's specific cross-section dependency rules
        findAndResetDependents(
          sec,
          questionId,
          sec.id as keyof ApplicantFormValues
        );
      }
    });
  }

  const handleInputChange = (questionId: string, value: AnswerValue) => {
    // Set the current question's value
    console.log("Setting value for", sectionId, questionId, value);
    setFormValue(
      sectionId,
      questionId as keyof (typeof formValues)[typeof sectionId],
      value
    );

    // Assuming 'sections' is available and holds all section definitions
    // This initiates the recursive reset for dependents
    resetDependentValues(
      sectionId,
      questionId,
      processedFormConfig.formSections
    );
  };

  return (
    <div>
      <h3>{section.title}</h3>
      {section.questions.map((question) => (
        <div key={question.id}>
          {renderQuestion(
            question,
            getAnswerValue(sectionId, question.id, formValues),
            handleInputChange
          )}
        </div>
      ))}
    </div>
  );
};

// Render question elements based on their type
const renderQuestion = (
  question: FormQuestion,
  answer: AnswerValue,
  handleInputChange: (questionId: string, value: AnswerValue) => void
) => {
  const baseInputClasses =
    "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 sm:text-sm border rounded-md shadow-sm";
  const checkboxClasses =
    "focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded";

  switch (question.type) {
    case QuestionType.Text:
      return (
        <div className="flex items-center flex-col">
          <label htmlFor={question.id}>{question.label}</label>

          <input
            type="text"
            id={question.id}
            name={question.id}
            className={`${baseInputClasses}`}
            value={(answer as string) || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        </div>
      );
    case QuestionType.Checkbox:
      return (
        <div className="flex items-center flex-col">
          <label htmlFor={question.id}>{question.label}</label>

          <input
            type="checkbox"
            id={question.id}
            name={question.id}
            className={`${checkboxClasses}`}
            checked={!!answer}
            onChange={(e) => handleInputChange(question.id, e.target.checked)}
          />
        </div>
      );
    case QuestionType.Dropdown:
      return (
        <div className="flex items-center flex-col">
          <label htmlFor={question.id}>{question.label}</label>
          <select
            id={question.id} // No need for template literals here
            name={question.id}
            className={`${baseInputClasses}`}
            value={(answer as string) || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          >
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );

    case QuestionType.Radio:
      return (
        <div className="flex items-center flex-row">
        <span>{question.label}</span>
        {question.options?.map((option, index) => (
          <div key={index} className="inline-flex items-center ml-4"> {/* Adjusted margin left for spacing */}
            <input
              type="radio"
              id={`${question.id}-${option}`} // Ensuring unique ID for each radio button
              name={question.id}
              className="form-radio w-5 text-gray-600"
              checked={answer === (option === "Yes")}
              onChange={() =>
                handleInputChange(question.id, option === "Yes")
              }
            />
            <label
              htmlFor={`${question.id}-${option}`} // Matching htmlFor with input id
              className="ml-2 text-gray-700"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
      
      );

    default:
      return null;
  }
};

export default DynamicFormSectionComponent;
