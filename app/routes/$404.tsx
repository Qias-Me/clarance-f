import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Page Not Found - 404" },
    { name: "description", content: "The page you are looking for does not exist." },
  ];
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">
        Oops! The page you are looking for could not be found.
      </p>
      <Link
        to="/"
        className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700"
      >
        Go Back to Home
      </Link>
    </div>
  );
}
