import {
  ApplicantFormValues,
  EnumMappings,
  FormConfig,
} from "../../../../api/interfaces2.0/formDefinition";

type FormValue = string | boolean | number | string[]; // Align this with your AnswerValue definition

class FormUtils {
  // Utility method to fetch values safely from ApplicantFormValues
  static getDependentValue(
    formValues: ApplicantFormValues,
    sectionId: keyof ApplicantFormValues,
    questionId: string
  ): FormValue | undefined {
    switch (sectionId) {
      case "personalInfo":
        return this.getSectionValue(formValues.personalInfo, questionId);
      case "aknowledgementInfo":
        return this.getSectionValue(formValues.aknowledgementInfo, questionId);
      case "birthInfo":
        return this.getSectionValue(formValues.birthInfo, questionId);
      case "physicalAttributes":
        return this.getSectionValue(formValues.physicalAttributes, questionId);
      case "contactInfo":
        return this.getSectionValue(formValues.contactInfo, questionId);
      case "passportInfo":
        return this.getSectionValue(formValues.passportInfo, questionId);
      case "citizenshipInfo":
        return this.getSectionValue(formValues.citizenshipInfo, questionId);
      case "duelCitizenshipInfo":
        return this.getSectionValue(formValues.duelCitizenshipInfo, questionId);
      case "residencyInfo":
        return this.getSectionValue(formValues.residencyInfo, questionId);
        case "names":
          return this.getSectionValue(formValues.names, questionId)

      // Implement cases for other sections here...
      default:
        console.warn(`Unhandled section: ${sectionId}`);
        return undefined;
    }
  }

  // Generic method to get section value with key type checking
  static getSectionValue<T extends object>(
    section: T,
    questionId: keyof T | string
  ): FormValue | undefined {
    if (questionId in section) {
      const key = questionId as keyof T;
      const value: unknown = section[key];
      if (
        typeof value === "string" ||
        typeof value === "boolean" ||
        typeof value === "number" ||
        Array.isArray(value)
      ) {
        return value as FormValue;
      }
    }
    return undefined;
  }

  static preprocessForm(
    originalFormConfig: FormConfig,
    formValues: ApplicantFormValues
  ): FormConfig {
    return {
      ...originalFormConfig,
      formSections: originalFormConfig.formSections.map((section) => {
        return {
          ...section,
          questions: section.questions
            .filter((question) => {
              if (!question.condition) return true;

              const { dependsOn, equals } = question.condition;
              const dependentValue = this.getDependentValue(
                formValues,
                section.id as keyof ApplicantFormValues,
                dependsOn
              );

              // Adjusting comparison logic to handle both string and boolean 'equals'
              if (typeof equals === "boolean") {
                // For boolean, directly compare
                return dependentValue === equals;
              } else if (typeof equals === "string") {
                // If `equals` is string, ensure `dependentValue` is also string before comparing
                return (
                  typeof dependentValue === "string" &&
                  dependentValue === equals
                );
              }
              // If equals is neither string nor boolean, or no matching case, default to false
              return false;
            })
            .map((question) => ({
              ...question,
              // Dynamically assign options from enums based on enumKey, if present
              options: question.enumKey
                ? Object.values(EnumMappings[question.enumKey])
                : question.options,
            })),
        };
      }),
    };
  }
}

export { FormUtils };
