import type { Route } from "./+types/startForm";
import { Outlet } from "react-router";
import { EmployeeProvider } from "~/state/contexts/new-context";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Form 86 Application" },
    { name: "description", content: "Start your Form 86 application" },
  ];
}

interface ActionResponse {
  success: boolean;
  message: string;
}

type ActionType = "generatePDF" | "generateJSON" | "showAllFormFields";

export function action({ request }: Route.ActionArgs) {
  return request.formData().then((formData) => {
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
      !["generatePDF", "generateJSON", "showAllFormFields"].includes(
        actionTypeEntry
      )
    ) {
      return { success: false, message: "Invalid action type" };
    }

    const actionType = actionTypeEntry as ActionType;

    try {
      const formValues = JSON.parse(applicantDataEntry);
      return { success: true, message: `${actionType} processed successfully` };
    } catch (error) {
      const errorMessage =
        error instanceof SyntaxError && "message" in error
          ? error.message
          : "Invalid JSON format";
      return { success: false, message: `Invalid applicant data: ${errorMessage}` };
    }
  });
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare?.env?.VALUE_FROM_CLOUDFLARE || "Form 86 Application" };
}

export default function StartForm({ loaderData }: Route.ComponentProps) {
  return (
    <EmployeeProvider>
      <Outlet context={loaderData} />
    </EmployeeProvider>
  );
}
