import type { Route } from "./+types/startForm._index";
import { Form } from "react-router";
import { useState, Suspense } from "react";
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

  const isModalOpen = useTypedSelector(
    (state: RootState) => state.user.value.context.isModalOpen
  );

  const { loadEmployee, isLoading, data, getChanges } = useEmployee();

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

  if (isLoading)
    return <div className="animate-pulse flex space-x-4">Loading ...</div>;

  const handleUpdateClick = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const applicantID = data?.personalInfo?.applicantID;
    if (!applicantID) {
      alert("Applicant ID is required.");
      return;
    }

    const changes = await getChanges();

    if (Object.keys(changes).length > 0) {
      try {
        console.log(changes, "Changes being sent");
        const dynamicService = new DynamicService();
        const response = await dynamicService.updateUserData(
          "applicantData",
          changes
        );
        console.log(response.message);

        await loadEmployee();
      } catch (error) {
        console.error("Failed to apply changes:", error);
      }
    } else {
      console.log("No changes to submit.");
    }
  };

  const toggleEditMode = () => {
    dispatch(openModal()); 
    window.scrollTo(0, 0);
  };

  return (
    <Suspense
      fallback={<div className="animate-pulse flex space-x-4">Loading ...</div>}
    >
      {!data?.personalInfo?.applicantID ? (
        <div className="p-4 rounded-lg">
          <button
            onClick={handleStartClick}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
          >
            Start
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-lg">
          {!isModalOpen ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-center">
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-lg font-semibold">Applicant Information</h3>
                  <p>ID: {data?.personalInfo?.applicantID}</p>
                </div>
              </div>
            </div>
          ) : (
            <Form
              method="post"
              onSubmit={handleUpdateClick}
              className="space-y-4"
            >
              <div className="bg-white p-4 rounded shadow">
                {data && (
                  <DynamicForm3 
                    data={data} 
                    onChange={(updatedData) => console.log("Form data updated:", updatedData)} 
                    FormInfo={{
                      employee_id: { 
                        value: 1, // Using a numeric ID as placeholder since the interface requires a number
                        id: data.personalInfo.applicantID,
                        type: "text",
                        label: "Employee ID" 
                      },
                      suffix: SuffixOptions.None
                    }}
                  />
                )}
              </div>

              <button
                type="submit"
                className="py-2 px-4 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition duration-150"
              >
                Update Information
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(closeModal());
                  window.scrollTo(0, 0);
                }}
                className="ml-4 py-2 px-4 bg-gray-500 text-white font-medium rounded hover:bg-gray-600 transition duration-150"
              >
                Cancel
              </button>
            </Form>
          )}
        </div>
      )}
      {data?.personalInfo?.applicantID && !isModalOpen && (
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start w-full p-6 ">
          <div className="w-full sm:w-auto mb-4 sm:mb-0">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Applicant Panel
            </h2>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
              <button
                type="button"
                onClick={toggleEditMode}
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-150 ease-in-out"
              >
                Edit Form
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <RenderPrintPDF data={data} actionData={routeContextData?.action} />
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
}