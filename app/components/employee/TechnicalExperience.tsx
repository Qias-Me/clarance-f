import { EmployeeSkillType } from "api_v2/interfaces/employee";
import React, { useState } from "react";

const TechnicalExperience: React.FC<{ skills: EmployeeSkillType[] }> = ({
  skills,
}) => {
  const [openSkillIndex, setOpenSkillIndex] = useState<number | null>(null);

  const toggleSkillOpen = (index: number) => {
    // Toggle logic: close if already open, open otherwise
    setOpenSkillIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <section className="container mx-auto p-4  rounded-lg">
      <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        Technical Experience
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, index) => (
          <div
            key={skill.skill_id}
            className=" rounded-md shadow-sm overflow-hidden"
          >
            <button
              className="cursor-pointer w-full text-left px-4 py-2 sm:px-5 sm:py-3 font-semibold text-base sm:text-lg flex justify-between items-center text-gray-800 hover:bg-gray-50"
              onClick={() => toggleSkillOpen(index)}
              aria-expanded={openSkillIndex === index}
            >
              <span>{skill.skill_name}</span>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 transform transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  transform:
                    openSkillIndex === index
                      ? "rotate(-180deg)"
                      : "rotate(0deg)",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </button>
            <div
              className={`transition-height duration-500 ease-in-out ${
                openSkillIndex === index ? "max-h-screen" : "max-h-0"
              }`}
              style={{ overflow: "hidden" }}
            >
              {openSkillIndex === index && (
                <ul className="px-5 sm:px-8 py-4 text-gray-700 bg-gray-50 border-t border-gray-200">
                  {skill.subskills.map((details) => (
                    <li
                      key={details.subskill_id}
                      className="mb-2 last:mb-0 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <span className="font-medium text-gray-900">
                        {details.subskill_name}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        [{details.years} years]
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(TechnicalExperience);