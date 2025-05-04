// import { ApplicantResidency } from "api_v2/interfaces/form3";

// interface APOAddressComponentProps {
//   residency: ApplicantResidency;
//   updateResidencyDetail: <T extends keyof ApplicantResidency>(
//     index: number,
//     field: T,
//     value: ApplicantResidency[T]
//   ) => void;
//   index: number;
// }

// const APOAddressComponent: React.FC<APOAddressComponentProps> = ({
//   residency,
//   updateResidencyDetail,
//   index,
// }) => {
//   return (
//     <div>
//       <h4>APO/FPO Address Details</h4>

//       <label>
//         APO/FPO Street Address:
//         <input
//           type="text"
//           value={
//             residency.residenceAddress.APOOrFPODetails?.APOFPOAddress || ""
//           }
//           onChange={(e) =>
//             updateResidencyDetail(
//               index,
//               "residenceAddress.APOOrFPODetails.APOFPOAddress",
//               e.target.value
//             )
//           }
//         />
//       </label>

//       <label>
//         City/Post Name:
//         <input
//           type="text"
//           value={
//             residency.residenceAddress.APOOrFPODetails?.cityOrPostName || ""
//           }
//           onChange={(e) =>
//             updateResidencyDetail(
//               index,
//               "residenceAddress.APOOrFPODetails.cityOrPostName",
//               e.target.value
//             )
//           }
//         />
//       </label>

//       <label>
//         State/Province/Region:
//         <input
//           type="text"
//           value={residency.residenceAddress.APOOrFPODetails?.state || ""}
//           onChange={(e) =>
//             updateResidencyDetail(
//               index,
//               "residenceAddress.APOOrFPODetails.state",
//               e.target.value
//             )
//           }
//         />
//       </label>

//       <label>
//         ZIP/Postal Code:
//         <input
//           type="text"
//           value={residency.residenceAddress.APOOrFPODetails?.zip || ""}
//           onChange={(e) =>
//             updateResidencyDetail(
//               index,
//               "residenceAddress.APOOrFPODetails.zip",
//               e.target.value
//             )
//           }
//         />
//       </label>

//       <label>
//         Country:
//         <input
//           type="text"
//           value={residency.residenceAddress.APOOrFPODetails?.country || ""}
//           onChange={(e) =>
//             updateResidencyDetail(
//               index,
//               "residenceAddress.APOOrFPODetails.country",
//               e.target.value
//             )
//           }
//         />
//       </label>

//       <label>
//         APO or FPO:
//         <select
//           value={residency.residenceAddress.APOOrFPODetails?.APOOrFPO || ""}
//           onChange={(e) =>
//             updateResidencyDetail(
//               index,
//               "residenceAddress.APOOrFPODetails.APOOrFPO",
//               e.target.value
//             )
//           }
//         >
//           <option value="">Select One</option>
//           <option value="APO">APO</option>
//           <option value="FPO">FPO</option>
//         </select>
//       </label>

//       <label>
//         APO/FPO State Code:
//         <input
//           type="text"
//           value={
//             residency.residenceAddress.APOOrFPODetails?.APOFPOStateCode || ""
//           }
//           onChange={(e) =>
//             updateResidencyDetail(
//               index,
//               "residenceAddress.APOOrFPODetails.APOFPOStateCode",
//               e.target.value
//             )
//           }
//         />
//       </label>

//       <label>
//         APO/FPO ZIP Code:
//         <input
//           type="text"
//           value={residency.residenceAddress.APOOrFPODetails?.APOFPOZip || ""}
//           onChange={(e) =>
//             updateResidencyDetail(
//               index,
//               "residenceAddress.APOOrFPODetails.APOFPOZip",
//               e.target.value
//             )
//           }
//         />
//       </label>
//     </div>
//   );
// };

// export default APOAddressComponent;