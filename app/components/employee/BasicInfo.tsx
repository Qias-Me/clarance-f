import  {type ApplicantFormValues } from "../../../api/interfaces2.0/formDefinition";

interface BasicInfoProps {
  user: ApplicantFormValues;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ user }: BasicInfoProps) => {
  const { personalInfo } = user;

  return (
    <section className=" py-8">
      <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
        {personalInfo && (
          <>
            <div className="md:col-span-3 lg:col-span-6 text-center md:text-left flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900">
                Welcome Back:
              </h2>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                {`${personalInfo.firstName.value}`}
                {personalInfo.middleName.value &&
                  ` ${personalInfo.middleName.value}`}
                {` ${personalInfo.lastName.value}`}
                {personalInfo.suffix.value && `, ${personalInfo.suffix.value}`}
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                {`ID: ${personalInfo.applicantID}`}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BasicInfo;
