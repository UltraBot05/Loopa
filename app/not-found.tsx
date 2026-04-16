import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 border rounded-lg shadow-sm max-w-md w-full">
        <h2 className="text-4xl font-black text-gray-900 mb-2">404</h2>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Page Not Found</h3>
        <p className="text-gray-600 mb-8 text-sm">
          Oops! The page or resource you are looking for does not exist or might have been removed.
        </p>
        <Link
          href="/"
          className="inline-block w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition shadow-sm"
        >
          Return to Feed
        </Link>
      </div>
    </div>
  );
}
