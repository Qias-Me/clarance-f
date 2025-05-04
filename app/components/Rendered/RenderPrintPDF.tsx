import React from "react";
import { Form, useActionData } from "react-router";
import { useEmployee } from "~/state/contexts/new-context";
import  {type ApplicantFormValues } from "../../../api/interfaces/formDefinition";
import DynamicService from "api/service/dynamicService";

interface FormProps {
  data: ApplicantFormValues;
}

interface ActionData {
  success: boolean;
  message: string;
}

const RenderPrintPDF: React.FC<FormProps> = () => {
  const actionData = useActionData<ActionData>();
  const { data } = useEmployee();

  // Convert data to JSON string for the hidden input field
  const dataJSON = JSON.stringify(data);

  const ClearForm = async () => {
    // Clear the form data from the IndexedDB
    const dynamicService = new DynamicService();
    await dynamicService.deleteFormData();

    window.location.reload();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        {actionData?.message}
      </h1>
      {actionData?.message && (
        <p className="text-gray-600 mb-6">{actionData.message}</p>
      )}

      <Form method="post" action="/printPDF">
        <input type="hidden" name="data" value={dataJSON} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Form Actions
        </h2>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <button
            type="submit"
            name="actionType"
            value="generatePDF"
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-150 ease-in-out shadow-md"
          >
            Generate PDF
          </button>
          <button
            type="submit"
            name="actionType"
            value="generateJSON"
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-150 ease-in-out shadow-md"
          >
            Generate JSON
          </button>
          <button
            type="submit"
            name="actionType"
            value="mapToMulti"
            className="px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition duration-150 ease-in-out shadow-md"
          >
           Map to: Excel | CSV | JSON
          </button>
          <button
            onClick={() => ClearForm()}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-150 ease-in-out shadow-md"
          >
            Clear IndexDB
          </button>
        </div>
      </Form>
    </div>
  );
};

export { RenderPrintPDF };
