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
    // Add spacing between form elements using flexbox and gap
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          id="title"
          {...register("title")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <p className="mt-1 text-sm text-red-600">{errors.title?.message}</p>
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700"
        >
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          {...register("tags")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <p className="mt-1 text-sm text-red-600">{errors.tags?.message}</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
      >
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
