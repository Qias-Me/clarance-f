import { ApplicantFormValues } from "../../../api/interfaces2.0/formDefinition";

interface BasicInfoProps {
  user: ApplicantFormValues;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ user }: BasicInfoProps) => {
  const { birthInfo } = user;

  return (
    <section className=" relative">
      <div className="container mx-auto p-4 lg:p-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-6">
        {birthInfo && (
          <>
            <p className="text-sm">{`ID: ${birthInfo.birthCity}`}</p>

            {/* Name and Position */}
            <div className="md:col-span-3 lg:col-span-5 text-center md:text-start row-span-1 flex flex-col justify-center items-center md:items-start">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
                {`First Name:  ${birthInfo.birthCountry}`}
                {birthInfo.birthDate &&
                  ` Middle Name:${birthInfo.birthState}`}
              </h2>
              <p className="text-xl">
                {`Last Name: ${birthInfo.birthState}`}
                {birthInfo.birthDate && `, ${birthInfo.birthDate}`}
              </p>
            </div>         
          </>
        )}
      </div>
    </section>
  );
};

export default BasicInfo;
