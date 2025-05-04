// import { ApplicantResidency } from "api_v2/interfaces/form3";
// import { useForm } from "../samples/formContext"; // Adjust this path as necessary
// import StandardAddressComponent from "./residency/1";
// import APOAddressComponent from "./residency/2";


// type ResidencyStatus = "Owned" | "Rented" | "Military housing" | "Other";


// const ResidencySection = () => {
//   const { formData, setFormData } = useForm();

//   // Function to handle adding a new residency entry with correct typing
//   const addResidencyDetail = () => {
//     const newResidency: ApplicantResidency = {
//       residenceID: formData.residencyInfo.length + 1, // Assuming auto-generation or correction upon saving
//       applicantID: 0, // Assuming this will be set appropriately
//       residenceStartDate: "",
//       isStartDateEst: false,
//       residenceEndDate: "",
//       isResidenceEndEst: false,
//       isResidencePresent: false,
//       residenceStatus: "Owned", // Correctly typed as per the interface
//       residenceAddress: {
//         street: "",
//         city: "",
//         state: "",
//         zip: "",
//         country: "",
//         hasAPOOrFPO: false,
//         APOOrFPODetails: {
//           hadAPOFPOAddress: false, // Ensure all required fields are included
//         },
//       },
//       contact: {
//         lastname: "",
//         firstname: "",
//         lastContactDate: "",
//         isLastContactEst: false,
//         relationship: "Neighbor", // Correctly typed as per the interface
//         phone: {
//           type: "Evening",
//           knowsNumber: false,
//           isInternationalOrDSN: false,
//         },
//       },
//     };

//     setFormData({
//       ...formData,
//       residencyInfo: [...formData.residencyInfo, newResidency],
//     });
//   };

//   // Add more residency information up to a maximum of 4 entries
//   const handleAddResidencyClick = () => {
//     if (formData.residencyInfo.length < 4) {
//       addResidencyDetail();
//     }
//   };



//   const updateResidencyDetail = (field: keyof ApplicantResidency, value: boolean) => {
//     const updatedFormData = {
//       ...formData,
//       duelCitizenshipInfo: {
//         ...formData.duelCitizenshipInfo,
//         [field]: value,
//       },
//     };

//     setFormData(updatedFormData);
//   };

//   const handleCheckboxChange =
//     (field: keyof DualCitizenshipFormData) =>
//     (event: ChangeEvent<HTMLInputElement>) => {
//       updateResidencyDetail(field, event.target.checked);
//     };


//   return (
//     <div>
//       {formData.residencyInfo.map((residency, index) => (
//         <div key={index} className="residency-info">
//           <h3>Residency Information #{index + 1}</h3>

//           {/* Address Fields */}
//           <label>
//             From Date (Month/Year):
//             <input
//               type="date"
//               value={residency.residenceStartDate}
//               onChange={(e) =>
//                 updateResidencyDetail(
//                   index,
//                   "residenceStartDate",
//                   e.target.value
//                 )
//               }
//             />
//           </label>

//           <label>
//             To Date (Month/Year):
//             <input
//               type="date"
//               value={residency.residenceEndDate}
//               onChange={(e) =>
//                 updateResidencyDetail(index, "residenceEndDate", e.target.value)
//               }
//             />
//           </label>

//           <label>
//             Is Start Date Estimated?
//             <input
//               type="checkbox"
//               checked={residency.isStartDateEst}
//               onChange={(e) =>
//                 updateResidencyDetail(index, "isStartDateEst", e.target.checked)
//               }
//             />
//           </label>
//           <div>
//             <label>
//               Is End Date Estimated?
//               <input
//                 type="checkbox"
//                 checked={residency.isResidenceEndEst}
//                 onChange={(e) =>
//                   updateResidencyDetail(
//                     index,
//                     "isResidenceEndEst",
//                     e.target.checked
//                   )
//                 }
//               />
//             </label>

//             <label>
//               Is Residence Present?
//               <input
//                 type="checkbox"
//                 checked={residency.isResidencePresent}
//                 onChange={(e) =>
//                   updateResidencyDetail(
//                     index,
//                     "isResidencePresent",
//                     e.target.checked
//                   )
//                 }
//               />
//             </label>
//           </div>

//           <label>
//             Residence Status:
//             <select
//               value={residency.residenceStatus}
//               onChange={(e) =>
//                 updateResidencyDetail(
//                   index,
//                   "residenceStatus",
//                   e.target.value as ResidencyStatus
//                 )
//               }
//             >
//               <option value="Owned">Owned</option>
//               <option value="Rented">Rented</option>
//               <option value="Military housing">Military housing</option>
//               <option value="Other">Other</option>
//             </select>
//           </label>

//           {residency.residenceStatus === "Other" && (
//             <label>
//               Reason:
//               <input
//                 type="text"
//                 value={residency.residenceOtherDetails || ""}
//                 onChange={(e) =>
//                   updateResidencyDetail(
//                     index,
//                     "residenceOtherDetails",
//                     e.target.value
//                   )
//                 }
//               />
//             </label>
//           )}


//           {residency.residenceAddress.hasAPOOrFPO ? (
//             <APOAddressComponent
//               residency={residency}
//               updateResidencyDetail={updateResidencyDetail}
//               index={index}
//             />
//           ) : residency.residenceAddress.country && residency.residenceAddress.country !== 'United States' ? (
//             <StandardAddressComponent
//               residency={residency}
//               updateResidencyDetail={updateResidencyDetail}
//               index={index}
//             />
//           ) : null}

//         </div>
//       ))}
//       <button onClick={handleAddResidencyClick}>Add Another Residency</button>
//     </div>
//   );
// };

// export default ResidencySection;
