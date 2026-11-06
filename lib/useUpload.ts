"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { live } from "@/lib/convexApi";

/**
 * useUpload — uploads a file to Convex storage and resolves its storageId, which the
 * caller then passes to the mutation that uses it (the server validates type and size).
 */
export function useUpload() {
  const uploadUrl = useMutation(live.uploadUrl);
  return useCallback(
    async (file: File) => {
      const url = await uploadUrl({});
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!res.ok) throw new Error("upload failed");
      const { storageId } = (await res.json()) as { storageId: string };
      return storageId;
    },
    [uploadUrl],
  );
}
