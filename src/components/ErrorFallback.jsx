import { useNavigate } from "react-router-dom";

function ErrorFallback({ error }) {
  const navigate = useNavigate();

  return (
    <div role="alert" className="p-8 text-center bg-red-50">
      <h2 className="text-2xl font-semibold text-red-700">
        Something went wrong.
      </h2>
      <pre className="text-sm text-red-500 my-4 whitespace-pre-wrap">
        {error.message}
      </pre>
      <button
        onClick={() => navigate("/")}
        className="rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

export default ErrorFallback;
