"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { InboxIcon, Loader2 } from "lucide-react";
import React, { Fragment, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";

const FileUpload = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      fileKey,
      fileName,
    }: {
      fileKey: string;
      fileName: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        fileKey,
        fileName,
      });
      return response.data;
    },
  });

  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      const file = acceptedFiles[0];

      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb
        toast.error("File to large");
        return;
      }
      try {
        const data = await uploadToS3(file);
        if (!data?.fileKey || !data.fileName) {
          alert("Please upload a smaller file");
          return;
        }
        mutate(data, {
          onSuccess: (data) => {
            toast.success(data.message);
          },
          onError: () => {
            toast.error("Error creating the chat");
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <Fragment>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling your tea to GPT
            </p>
          </Fragment>
        ) : (
          <Fragment>
            <InboxIcon className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
