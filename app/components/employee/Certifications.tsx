import { CertificationType } from "api_v2/interfaces/employee";
import React from "react";

const CertificationCard: React.FC<CertificationType> = ({ logo, titles }) => (
  <div className="flex flex-col items-center w-full px-4 py-6  dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
    <div className="flex justify-center items-center h-12 overflow-hidden">
      <img
        src={logo._url}
        alt={logo._alt}
        title={logo._title}
        className="w-auto h-6 md:h-10 object-contain"
      />
    </div>

    <div className="mt-4">
      {titles.length > 0 ? (
        <ul className="list-none space-y-2">
          {titles.map((title, index) => (
            <li
              key={index}
              className="flex items-center text-gray-700 dark:text-gray-400"
            >
              {/* Icon can be replaced with your choice of SVG or Tailwind CSS Icons */}
              <svg
                className="w-4 h-4 mr-2 fill-current text-gray-700 dark:text-gray-400"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              {title._description}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 dark:text-gray-400">No titles available</p>
      )}
    </div>
  </div>
);

const CertificationsSection: React.FC<{
  certifications: CertificationType[];
}> = ({ certifications }) => {
  if (certifications.length === 0) {
    return (
      <div className="text-center text-gray-700 dark:text-gray-400">
        No certifications available.
      </div>
    );
  }

  return (
    <section className="container mx-auto p-4 md:p-6">
      <h2 className="text-3xl font-semibold mb-10 text-center text-gray-800 dark:text-gray-200">
        Industry Professional Certifications
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {certifications.map((card, index) => (
          <div key={index}>
            <CertificationCard
              key={index}
              logo={card.logo}
              titles={card.titles}
              certification_id={card.certification_id}
              _name={card._name}
              _description={card._description}
              certification_date={card.certification_date}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CertificationsSection;
