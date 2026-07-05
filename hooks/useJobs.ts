import type { Job } from "@/types";
import { jobs } from "@/mocks/jobs";

export function useJobs(): Job[] {
  return jobs;
}
