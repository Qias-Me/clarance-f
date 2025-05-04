// import React from "react";
// import { useForm } from "../samples/formContext"; // Use your context hook
// import GenericFormField from "./templates/genericForm";
// import { ApplicantResidency } from "api_v2/interfaces/Residency";

// const ResidencyForm: React.FC = () => {
//   const { formData, setFormData } = useForm(); // Ensure useForm is correctly typed with ApplicantInfo

//   // Function to update a specific residency entry's field
//   const updateResidencyField = <K extends keyof ApplicantResidency>(
//     residencyIndex: number,
//     field: K,
//     value: ApplicantResidency[K]
//   ) => {
//     const updatedResidencies = formData.residencyInfo.map(
//       (residency, index) => {
//         if (index === residencyIndex) {
//           return { ...residency, [field]: value };
//         }
//         return residency;
//       }
//     );

//     setFormData({
//       ...formData,
//       residencyInfo: updatedResidencies,
//     });
//   };

//   const addResidencyEntry = () => {
//     if (formData.residencyInfo.length < 4) {
//       setFormData({
//         ...formData,
//         residencyInfo: [...formData.residencyInfo],
//       });
//     }
//   };


//   const residencyEntries = formData.residencyInfo?.map(
//     (residency: ApplicantResidency, index) => (
//       <div key={index}>
//         <GenericFormField
//           type="text"
//           label="Street"
//           onChange={(value) =>
//             updateResidencyField(index, "residenceAddress", {
//               ...residency.residenceAddress,
//               street: value,
//             })
//           }
//         />
//         {/* Render other fields similarly */}
//       </div>
//     )
//   ) || [];
  

//   return (
//     <div>
//       {residencyEntries}
//       <button onClick={addResidencyEntry}>Add Another Residency</button>
//     </div>
//   );
// };

// export default ResidencyForm;
