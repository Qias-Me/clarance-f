import type { Route } from "./+types/startForm";
import { Outlet, useActionData } from "react-router";
import { EmployeeProvider } from "~/state/contexts/new-context";
import { PdfService } from "api/service/pdfService";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Form 86 Application" },
    { name: "description", content: "Start your Form 86 application" },
  ];
}

interface ActionResponse {
  success: boolean;
  message: string;
  response?: {
    pdfId?: string;
    jsonData?: any;
  };
}

type ActionType = "generatePDF" | "generateJSON" | "showAllFormFields" | "submitPDF";

// Helper function to replace the missing json utility
function json(data: any, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
    },
  });
}

export async function action({ request }: Route.ActionArgs): Promise<ActionResponse> {
  const formData = await request.formData();
  const applicantDataEntry = formData.get("data");
  const actionTypeEntry = formData.get("actionType");

  if (typeof applicantDataEntry !== "string") {
    return {
      success: false,
      message: "No applicant data provided or data is not a string",
    };
  }

  if (typeof actionTypeEntry !== "string") {
    return {
      success: false,
      message: "No action type provided or action type is not a string",
    };
  }

  if (
    !["generatePDF", "generateJSON", "showAllFormFields", "submitPDF"].includes(
      actionTypeEntry
    )
  ) {
    return { success: false, message: "Invalid action type" };
  }

  const actionType = actionTypeEntry as ActionType;
  let formValues;

  try {
    formValues = JSON.parse(applicantDataEntry);
  } catch (error: any) {
    return { 
      success: false, 
      message: `Invalid applicant data: ${error.message}` 
    };
  }

  const pdfService = new PdfService();

  try {
    if (actionType === "generatePDF") {
      const response = await pdfService.applyValues_toPDF(formValues);
      return {
        success: true,
        message: "PDF generated successfully.",
        response: {
          pdfId: response.pdfId
        },
      };
    }  else if (actionType === "submitPDF") {
      // Handle PDF submission logic here

      // console.log(formValues, "formvalues")
      const response = await pdfService.applyValues_toPDF(formValues);
      return {
        success: true,
        message: "Form submitted successfully.",
        response: {
          pdfId: response.pdfId
        },
      };
    } else {
      return {
        success: false,
        message: "Invalid action type.",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to process request: ${error.message}`,
    };
  }
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare?.env?.VALUE_FROM_CLOUDFLARE || "Form 86 Application" };
}

export default function StartForm({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<ActionResponse>();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (actionData?.success && actionData.response?.pdfId) {
      // Create download URL for the generated PDF
      setDownloadUrl(`/download-pdf?id=${actionData.response.pdfId}`);
    }
  }, [actionData]);

  return (
    <EmployeeProvider>
      {downloadUrl && (
        <div className="pdf-download-banner">
          <p>Your PDF is ready!</p>
          <a 
            href={downloadUrl} 
            className="download-button" 
            download="sf86-form.pdf"
          >
            Download PDF
          </a>
        </div>
      )}
      <Outlet context={loaderData} />
    </EmployeeProvider>
  );
}
