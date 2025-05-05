import React, { useState, useRef, useEffect } from "react";
import type { ApplicantFormValues } from "../../api/interfaces/formDefinition";
import DynamicService from "../../api/service/dynamicService";
import { Form } from "react-router";
import { clientPdfService } from "../../api/service/clientpdfService";

interface ActionData {
  success: boolean;
  message: string;
  response?: {
    pdfId?: string;
    pdfBytes?: Uint8Array;
    jsonData?: any;
  };
}

interface FormProps {
  data: ApplicantFormValues;
  actionData?: ActionData;
}

const RenderPrintPDF: React.FC<FormProps> = ({ data, actionData }) => {
  const [loading, setLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [actionType, setActionType] = useState("");
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const dataJSON = JSON.stringify(data);

  const ClearForm = async () => {
    const dynamicService = new DynamicService();
    await dynamicService.deleteFormData();
    window.location.reload();
  };

  const handleActionClick = async (action: string) => {
    if (loading) return; // Prevent multiple submissions
    setActionType(action);
    setLoading(true);
    setIsCancelled(false);
    setDownloadStatus("");
    
    // For client-side PDF generation, handle it directly without the server
    if (action === "clientPDF") {
      try {
        setDownloadStatus("Loading PDF template...");
        await clientPdfService.loadPdf();
        
        setDownloadStatus("Generating PDF...");
        const pdfBytes = await clientPdfService.generateFilledPdf(data);
        
        setDownloadStatus("Downloading PDF...");
        clientPdfService.downloadPdf(pdfBytes);
        
        setDownloadStatus("PDF downloaded successfully!");
        setTimeout(() => setDownloadStatus(""), 3000);
      } catch (error) {
        console.error("Error generating PDF client-side:", error);
        setDownloadStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
        return; // Skip the rest of the function
      }
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Simulate an async action with a promise (replace with actual logic)
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => resolve(true), 1000); // Reduced timeout for better UX

        abortController.signal.addEventListener("abort", () => {
          clearTimeout(timeoutId);
          reject(new Error("Action cancelled"));
        });
      });

      // After async action completes, submit the form
      if (formRef.current) {
        formRef.current.submit();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Action cancelled") {
          console.log("Action was cancelled by the user.");
        } else {
          console.error("Error during submission:", error.message);
        }
      } else {
        console.error("Unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsCancelled(true);
      setLoading(false);
    }
  };

  // Handle downloading PDF using PDF ID
  const downloadPDFFromId = async (pdfId: string) => {
    try {
      setDownloadStatus("Downloading PDF...");
      
      // Create a direct link to the PDF download endpoint
      const url = `/download-pdf?id=${pdfId}`;
      
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sf86-form.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setDownloadStatus("PDF download initiated!");
      console.log('PDF download initiated with ID:', pdfId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setDownloadStatus("Failed to download PDF");
    }
  };

  // Legacy method for backward compatibility
  const handleDownloadPDF = () => {
    if (actionData?.response?.pdfBytes) {
      try {
        // Convert the pdfBytes to a proper Uint8Array if it's not already
        const pdfData = 
          actionData.response.pdfBytes instanceof Uint8Array 
            ? actionData.response.pdfBytes 
            : new Uint8Array(Object.values(actionData.response.pdfBytes));
        
        const blob = new Blob([pdfData], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filled_form.pdf';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('PDF download initiated successfully');
      } catch (error) {
        console.error('Error downloading PDF:', error);
      }
    } else {
      console.warn('No PDF bytes found in the response');
    }
  };

  // Check if PDF is available to download from the response
  useEffect(() => {
    if (actionData?.success && (actionType === "generatePDF" || actionType === "submitPDF")) {
      if (actionData?.response?.pdfId) {
        console.log('Initiating PDF download using pdfId');
        downloadPDFFromId(actionData.response.pdfId);
      } else if (actionData?.response?.pdfBytes) {
        console.log('Initiating PDF download using legacy pdfBytes');
        handleDownloadPDF();
      } else {
        console.warn('No PDF ID or bytes found in the response');
        setDownloadStatus("No PDF data found");
      }
    }
  }, [actionData, actionType]);

  return (
    <div className="p-4 sm:p-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="col-span-3 sm:col-span-2 md:col-span-full">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-4">
          {actionData?.response?.jsonData}
        </h1>
        {actionData?.message && (
          <p className="text-gray-600 mb-6">{actionData.message}</p>
        )}
        {downloadStatus && (
          <p className="text-blue-600 mb-6">{downloadStatus}</p>
        )}
        {isCancelled && (
          <div className="col-span-3 text-center text-red-500">
            {actionType} was cancelled!
          </div>
        )}

        {loading && (
          <div className="col-span-3 text-center">
            <div className="animate-pulse">Processing...</div>{" "}
          </div>
        )}
      </div>

      <Form
        method="post"
        action="/startForm"
        className="col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-3"
        ref={formRef}
      >
        <input type="hidden" name="data" value={dataJSON} />
        <input type="hidden" name="actionType" value={actionType} />
        <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-4 sm:col-span-3">
          Internal Tools
        </h2>

        {loading ? (
          <div>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-150 ease-in-out shadow-md"
            >
              Cancel Action
            </button>
          </div>
        ) : (
          <>

            <button
              type="button"
              onClick={() => handleActionClick("clientPDF")}
              className="w-full sm:w-auto px-4 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition duration-150 ease-in-out shadow-md"
              title="Process PDF in browser to avoid server timeouts"
            >
              Generate PDF (Client-side)
            </button>
            <div className="col-span-3 sm:col-span-2 text-sm text-gray-500 mb-4">
              <p><strong>Client-side PDF generation:</strong> Use this option if the server-side PDF generation is timing out.</p>
              <p>This processes the form in your browser without sending data to the server. Key benefits:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Avoids worker CPU time limits</li>
                <li>Keeps your data private - never leaves your browser</li>
                <li>Works even with poor network connection</li>
              </ul>
              <p className="mt-1">If you see "Failed to fetch" errors, your browser might be blocking the PDF download due to CORS restrictions.</p>
            </div>

            <button
              type="button"
              onClick={() => handleActionClick("submitPDF")}
              className="w-full sm:w-auto px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-150 ease-in-out shadow-md"
            >
              Submit PDF
            </button>

            <button
              type="button"
              onClick={() => handleActionClick("generatePDF")}
              className="w-full sm:w-auto px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-150 ease-in-out shadow-md"
            >
              Generate PDF
            </button>

            <button
              type="button"
              onClick={() => handleActionClick("generateJSON")}
              className="w-full sm:w-auto px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-150 ease-in-out shadow-md"
            >
              Generate JSON
            </button>

            <button
              type="button"
              onClick={ClearForm}
              className="w-full sm:w-auto px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-150 ease-in-out shadow-md"
            >
              Clear IndexDB
            </button>

            <button
              type="button"
              onClick={() => handleActionClick("showAllFormFields")}
              className="w-full sm:w-auto px-4 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition duration-150 ease-in-out shadow-md"
            >
              Map Raw Form to JSON
            </button>
          </>
        )}
      </Form>
    </div>
  );
};

export { RenderPrintPDF };
