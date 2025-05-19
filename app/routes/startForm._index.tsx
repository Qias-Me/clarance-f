import type { Route } from "./+types/startForm._index";
import { Form } from "react-router";
import { useState, Suspense, useEffect } from "react";
import { useEmployee } from "~/state/contexts/new-context";
import { useDispatch, useTypedSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { closeModal, openModal } from "~/state/user/userSlice";
import DynamicService from "../../api/service/dynamicService";
import { RenderPrintPDF } from "~/components/RenderPrintPDF";
import type { FormEvent } from "react";
import type { ApplicantFormValues } from "api/interfaces/formDefinition";
import DynamicForm3 from "~/utils/formHandler";
import { SuffixOptions } from "api/interfaces/FormInfo";

export function loader({}: Route.LoaderArgs) {
  try {
    return { isLoading: false };
  } catch (e) {
    console.error("Failed to load employee data:", e);
    return { isLoading: false };
  }
}

export default function EmployeeIDPage({ loaderData }: Route.ComponentProps) {
  const [personalInfoVisible, setPersonalInfoVisible] = useState(false);
  const dispatch = useDispatch();
  const routeContextData = loaderData;
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  const isModalOpen = useTypedSelector(
    (state: RootState) => state.user.value.context.isModalOpen
  );

  const { loadEmployee, isLoading, data, getChanges } = useEmployee();

  // Add a timeout for loading state to prevent infinite loading
  useEffect(() => {
    console.log("Current loading state:", isLoading);
    console.log("Current data state:", data ? "has data" : "no data");
    
    // Force loading to be complete after timeout
    const timeoutId = setTimeout(() => {
      setLoadingTimedOut(true);
      console.log("Loading timed out, showing UI anyway");
    }, 3000); // 3 seconds timeout

    return () => clearTimeout(timeoutId);
  }, []);  // Run only once on component mount

  const handleStartClick = async () => {
    if (!data) return;
    
    const newUserID = crypto.randomUUID();
    const updatedData = {
      ...data,
      personalInfo: {
        applicantID: newUserID,
        ...data.personalInfo,
      },
    };

    try {
      const dynamicService = new DynamicService();
      await dynamicService.saveUserFormData(
        "applicantData",
        updatedData as ApplicantFormValues
      );

      console.log("Data saved to IndexedDB successfully");
      await loadEmployee();
      setPersonalInfoVisible(true);
      dispatch(openModal());
    } catch (error) {
      console.error("Failed to save data to IndexedDB:", error);
    }
  };

  // Debug render
  console.log("Rendering component. loadingTimedOut:", loadingTimedOut, "isLoading:", isLoading);
  
  // Always show the application UI after initial mount
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Form 86 Application</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">Start your Form 86 application by clicking the button below:</p>
        <button
          onClick={handleStartClick}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
        >
          Start New Application
        </button>
        
        {data?.personalInfo?.applicantID && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Your Application</h2>
            <p className="mb-4">Application ID: {data.personalInfo.applicantID}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => dispatch(openModal())}
                className="px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600"
              >
                Edit Application
              </button>
              {data && <RenderPrintPDF data={data} actionData={routeContextData?.action} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}