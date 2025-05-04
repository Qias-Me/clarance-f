import { EducationType } from "api_v2/interfaces/employee";
import React from "react";
import { GiGraduateCap } from "react-icons/gi";

const EducationList: React.FC<{ education: EducationType[] }> = ({ education }) => {

  return (
    <section className="container mx-auto px-4 py-8 items-center">
      <h2 className="text-3xl font-semibold mb-10 text-center text-gray-800">
        Education
      </h2>

      <ul className="space-y-4">
        {education.map((entry, index) => (
          <li key={index} className="flex items-start space-x-4">
            <GiGraduateCap />
            <div className="lg:flex w-full justify-between md:justify-normal">
              <div className="font-semibold text-lg lg:px-5">
                {entry._degree}
              </div>
              <div className="text-gray-600 lg:px-5">{entry._institution} </div>
              <div className="text-gray-600">{entry.grad_year}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default EducationList;
