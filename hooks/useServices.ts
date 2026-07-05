import type { Service } from "@/types";
import { services } from "@/mocks/services";

export function useServices(): Service[] {
  return services;
}
