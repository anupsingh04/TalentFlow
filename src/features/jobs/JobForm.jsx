import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect } from "react";

// Validation schema using Yup
const schema = yup
  .object()
  .shape({
    title: yup.string().required("Title is required"),
    tags: yup.string().required("Tags are required (comma-separated)"),
    status: yup.string().oneOf(["active", "archived"]).required(),
  })
  .required();

// The API call function
const saveJob = async (jobData) => {
  const { id, ...data } = jobData;
  const method = id ? "PATCH" : "POST";
  const url = id ? `/jobs/${id}` : "/jobs";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to save job");
  }
  return response.json();
};

function JobForm({ onSuccess, jobToEdit }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Pre-fill form if we are editing
  useEffect(() => {
    if (jobToEdit) {
      reset({
        ...jobToEdit,
        tags: jobToEdit.tags.join(", "), // Convert array to string for input
      });
    } else {
      reset({ title: "", tags: "", status: "active" }); // Clear form for creation
    }
  }, [jobToEdit, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: saveJob,
    onSuccess: () => {
      // This tells TanStack Query to refetch the 'jobs' query
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      onSuccess(); // This will close the modal
    },
  });

  const onSubmit = (data) => {
    const jobData = {
      ...data,
      tags: data.tags.split(",").map((tag) => tag.trim()), // Convert string back to array
    };
    if (jobToEdit) {
      jobData.id = jobToEdit.id;
    }
    mutate(jobData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Title</label>
        <input {...register("title")} />
        <p style={{ color: "red" }}>{errors.title?.message}</p>
      </div>
      <div>
        <label>Tags (comma-separated)</label>
        <input {...register("tags")} />
        <p style={{ color: "red" }}>{errors.tags?.message}</p>
      </div>
      <div>
        <label>Status</label>
        <select {...register("status")}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <p style={{ color: "red" }}>{errors.status?.message}</p>
      </div>
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : jobToEdit ? "Edit Job" : "Save Job"}
      </button>
    </form>
  );
}

JobForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  jobToEdit: PropTypes.object,
};

export default JobForm;
