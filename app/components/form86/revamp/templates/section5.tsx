// import { useState } from "react";
// import Component1 from "./section1";
// import { GenericFormFieldProps } from "./genericForm";
// import { useForm } from "../../samples/formContext";

// // Usage example within a parent component
// const ParentComponent: React.FC = () => {
//     const { formData, setFormData, currentStep } = useForm();
  
//     const fields: GenericFormFieldProps[] = [
//       {
//         type: 'text',
//         id: 'firstName',
//         label: 'First Name',
//         value: '', // Should be managed state
//         onChange: (event) => console.log(event.target.value),
//       },
//       {
//         type: 'dropdown',
//         id: 'country',
//         label: 'Country',
//         value: '', // Should be managed state
//         onChange: (event) => console.log(event.target.value),
//         options: [
//           { value: 'us', label: 'United States' },
//           { value: 'ca', label: 'Canada' },
//         ],
//       },
//       // Add more fields as needed
//     ];
  
//     return (
//       <Component1 isVisible={isVisible} fields={fields} />
//     );
//   };

  
//   export default ParentComponent;