// src/features/jobs/JobForm.jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect } from "react";
import toast from "react-hot-toast";

const schema = yup
  .object()
  .shape({
    title: yup.string().required("Title is required"),
    tags: yup.string().required("Tags are required (comma-separated)"),
  })
  .required();

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

  useEffect(() => {
    if (jobToEdit) {
      reset({ ...jobToEdit, tags: jobToEdit.tags.join(", ") });
    } else {
      reset({ title: "", tags: "" });
    }
  }, [jobToEdit, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: saveJob,
    // THE FIX: Make onSuccess async and await the invalidation
    onSuccess: async () => {
      toast.success(
        jobToEdit ? "Job updated successfully!" : "Job created successfully!"
      );
      // Wait for the query to be invalidated before proceeding
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      onSuccess(); // Now, close the modal
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const onSubmit = (data) => {
    const jobData = {
      ...data,
      tags: data.tags.split(",").map((tag) => tag.trim()),
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
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : jobToEdit ? "Update Job" : "Save Job"}
      </button>
    </form>
  );
}

JobForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  jobToEdit: PropTypes.object,
};

export default JobForm;
