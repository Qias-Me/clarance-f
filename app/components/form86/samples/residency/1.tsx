// import { ApplicantResidency } from "api_v2/interfaces/form3";

// interface StandardAddressComponentProps {
//   residency: ApplicantResidency;
//   updateResidencyDetail: <T extends keyof ApplicantResidency>(
//     index: number,
//     field: T,
//     value: ApplicantResidency[T]
//   ) => void;
//   index: number;
// }

// const StandardAddressComponent: React.FC<StandardAddressComponentProps> = ({
//   residency,
//   updateResidencyDetail,
//   index,
// }) => {
//   // Implementation...
//   return (
//     <div>
//       <label>
//         Street:
//         <input
//           type="text"
//           value={residency.residenceAddress.street}
//           onChange={(e) =>
//             updateResidencyDetail(index, "residenceAddress", {
//               ...residency.residenceAddress,
//               street: e.target.value,
//             })
//           }
//         />
//       </label>

//       <label>
//         City:
//         <input
//           type="text"
//           value={residency.residenceAddress.city}
//           onChange={(e) =>
//             updateResidencyDetail(index, "residenceAddress", {
//               ...residency.residenceAddress,
//               city: e.target.value,
//             })
//           }
//         />
//       </label>

//       <label>
//         State:
//         <input
//           type="text"
//           value={residency.residenceAddress.state}
//           onChange={(e) =>
//             updateResidencyDetail(index, "residenceAddress", {
//               ...residency.residenceAddress,
//               state: e.target.value,
//             })
//           }
//         />
//       </label>

//       <label>
//         Zip:
//         <input
//           type="text"
//           value={residency.residenceAddress.zip}
//           onChange={(e) =>
//             updateResidencyDetail(index, "residenceAddress", {
//               ...residency.residenceAddress,
//               zip: e.target.value,
//             })
//           }
//         />
//       </label>

//       <label>
//         Country:
//         <input
//           type="text"
//           value={residency.residenceAddress.country}
//           onChange={(e) =>
//             updateResidencyDetail(index, "residenceAddress", {
//               ...residency.residenceAddress,
//               country: e.target.value,
//             })
//           }
//         />
//       </label>

//       <label>
//         Has APO/FPO?
//         <input
//           type="checkbox"
//           checked={residency.residenceAddress.hasAPOOrFPO}
//           onChange={(e) =>
//             updateResidencyDetail(index, "residenceAddress", {
//               ...residency.residenceAddress,
//               hasAPOOrFPO: e.target.checked,
//             })
//           }
//         />
//       </label>
//     </div>
//   );
// };


// export default StandardAddressComponent;