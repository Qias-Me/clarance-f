import React, { useState } from "react";
import { DutyType, ExperienceType } from "api_v2/interfaces/employee";

const ProfessionalExperience: React.FC<{ experiences: ExperienceType[] }> = ({
  experiences,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleExperience = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const renderDuty = (duty: DutyType) => {
    return (
      <ul className="list-disc space-y-2 pl-6 text-md text-gray-700">
        <li className="mb-1">{duty._description}</li>
      </ul>
    );
  };

  return (
    <section id="professional-experience" className="container mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        Professional Experience
      </h2>

      <div className="grid grid-cols-1">
        {experiences.map((experience: ExperienceType, index: number) => (
          <React.Fragment key={index}>
            <article
              className={` ${
                openIndex === index ? "border-b py-4 border-gray-300" : "py-4"
              }`}
            >
              <button
                className="cursor-pointer w-full text-left p-4 font-semibold text-xl flex justify-between items-center bg-gray-800 text-white rounded-md"
                onClick={() => toggleExperience(index)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  toggleExperience(index)
                }
                tabIndex={0}
                aria-expanded={openIndex === index ? "true" : "false"}
              >
                <div className="flex flex-col">
                  <span className="text-lg font-semibold  block">
                    {experience.job_title}
                  </span>
                  <span className="text-md font-normal block">
                    {experience.company}
                  </span>

                  <div className="flex flex-row space-x-2">
                    <span className="text-sm font-normal">
                      {new Date(experience.startDate).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" }
                      )}
                    </span>
                    <span className="text-sm font-normal mx-1">-</span>
                    <span className="text-sm font-normal">
                      {experience.endDate
                        ? new Date(experience.endDate).toLocaleDateString(
                            "en-US",
                            { month: "long", year: "numeric" }
                          )
                        : "Current"}
                    </span>
                  </div>
                </div>

                <span>
                  {openIndex === index ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 12H6"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v12m6-6H6"
                      />
                    </svg>
                  )}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-height duration-500 ease-in-out ${
                  openIndex === index ? "max-h-screen" : "max-h-0"
                }`}
              >
                <div className="p-4 text-gray-600">
                  {experience.duties.map((duty: DutyType, index: number) => (
                    <div key={index}>{renderDuty(duty)}</div>
                  ))}
                </div>
              </div>
            </article>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default ProfessionalExperience;
