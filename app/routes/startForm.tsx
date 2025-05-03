import type { ActionFunction, MetaFunction } from "@remix-run/cloudflare";
import { json, Outlet, useActionData, useLoaderData } from "@remix-run/react";
import { ApplicantFormValues } from "api/interfaces/formDefinition";
import PdfService from "api/service/pdfService";
import { EmployeeProvider } from "~/state/contexts/new-context";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

interface ActionResponse {
  success: boolean;
  message: string;
}

type ActionType = "generatePDF" | "generateJSON" | "showAllFormFields";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const applicantDataEntry = formData.get("data");
  const actionTypeEntry = formData.get("actionType");

  if (typeof applicantDataEntry !== "string") {
    return json(
      {
        success: false,
        message: "No applicant data provided or data is not a string",
      },
      { status: 400 }
    );
  }

  if (typeof actionTypeEntry !== "string") {
    return json(
      {
        success: false,
        message: "No action type provided or action type is not a string",
      },
      { status: 400 }
    );
  }

  if (
    !["generatePDF", "generateJSON", "showAllFormFields"].includes(
      actionTypeEntry
    )
  ) {
    return json(
      { success: false, message: "Invalid action type" },
      { status: 400 }
    );
  }

  const actionType = actionTypeEntry as ActionType;

  let formValues: ApplicantFormValues;
  try {
    formValues = JSON.parse(applicantDataEntry) as ApplicantFormValues;
  } catch (error) {
    const errorMessage =
      error instanceof SyntaxError && "message" in error
        ? error.message
        : "Invalid JSON format";
    return json(
      { success: false, message: `Invalid applicant data: ${errorMessage}` },
      { status: 400 }
    );
  }

  const pdfService = new PdfService();

  const actionsMap: Record<
    ActionType,
    (data: ApplicantFormValues) => Promise<ActionResponse>
  > = {
    generatePDF: (data) => pdfService.applyValues_toPDF(data),
    generateJSON: (data) => pdfService.generateJSON_fromPDF(data),
    showAllFormFields: (data) => pdfService.showAllFormFields(data),
  };

  const actionHandler = actionsMap[actionType];

  try {
    const response = await actionHandler(formValues);

    console.log({ success: response.success, message: response.message });
    return json({ success: response.success, message: response.message });
  } catch (error) {
    const errorMessage =
      error instanceof Error && "message" in error
        ? error.message
        : "Unknown error";
    return json(
      { success: false, message: `Failed to process request: ${errorMessage}` },
      { status: 500 }
    );
  }
};

interface ActionData {
  success: boolean;
  message: string;
}

interface LoaderData {
  // Define appropriately based on your loader function
}

interface RouteContextData {
  loader: LoaderData;
  action?: ActionData;
}

export default function Index() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  const contextData: RouteContextData = {
    loader: loaderData,
    action: actionData,
  };

  return (
    <EmployeeProvider>
      <Outlet context={contextData} />
    </EmployeeProvider>
  );
}
