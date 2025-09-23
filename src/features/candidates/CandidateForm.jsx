// src/features/candidates/CandidateForm.jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

// Validation schema
const schema = yup
  .object()
  .shape({
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Must be a valid email")
      .required("Email is required"),
  })
  .required();

// API call function
const saveCandidate = async (candidateData) => {
  const response = await fetch("/candidates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidateData),
  });
  if (!response.ok) throw new Error("Failed to save candidate");
  return response.json();
};

function CandidateForm({ onSuccess }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: saveCandidate,
    onSuccess: () => {
      // Invalidate both candidate queries to refetch the list and the kanban board
      toast.success("Candidate created successfully!");
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["allCandidates"] });
      onSuccess(); // Close the modal
    },
    onError: (error) => {
      // Error toast for creating a candidate
      toast.error(`Error: ${error.message}`);
    },
  });

  return (
    // Add spacing between form elements
    <form onSubmit={handleSubmit(mutate)} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <input
          id="name"
          {...register("name")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <p className="mt-1 text-sm text-red-600">{errors.name?.message}</p>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <input
          id="email"
          {...register("email")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
      >
        {isPending ? "Saving..." : "Create Candidate"}
      </button>
    </form>
  );
}

CandidateForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};

export default CandidateForm;
