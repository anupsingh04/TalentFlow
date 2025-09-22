// src/features/candidates/CandidateForm.jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";

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
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["allCandidates"] });
      onSuccess(); // Close the modal
    },
  });

  return (
    <form onSubmit={handleSubmit(mutate)}>
      <div>
        <label>Full Name</label>
        <input {...register("name")} />
        <p style={{ color: "red" }}>{errors.name?.message}</p>
      </div>
      <div>
        <label>Email Address</label>
        <input {...register("email")} />
        <p style={{ color: "red" }}>{errors.email?.message}</p>
      </div>
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Create Candidate"}
      </button>
    </form>
  );
}

CandidateForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};

export default CandidateForm;
