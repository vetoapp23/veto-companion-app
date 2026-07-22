import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addVisitService,
  completeVisit,
  createVisit,
  getVisit,
  listVisits,
  removeVisitService,
  updateVisit,
  updateVisitService,
  type CreateVisitInput,
  type VisitStatus,
} from "@/lib/visits";
import { appointmentKeys } from "@/hooks/useDatabase";

export const visitKeys = {
  all: ["visits"] as const,
  lists: () => [...visitKeys.all, "list"] as const,
  list: (status?: VisitStatus) => [...visitKeys.lists(), status ?? "all"] as const,
  detail: (id: string) => [...visitKeys.all, "detail", id] as const,
};

export function useVisits(status?: VisitStatus) {
  return useQuery({
    queryKey: visitKeys.list(status),
    queryFn: () => listVisits(status),
  });
}

export function useVisit(id: string | undefined) {
  return useQuery({
    queryKey: visitKeys.detail(id || ""),
    queryFn: () => getVisit(id!),
    enabled: !!id,
  });
}

export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVisitInput) => createVisit(input),
    onSuccess: (visit) => {
      qc.invalidateQueries({ queryKey: visitKeys.lists() });
      qc.setQueryData(visitKeys.detail(visit.id), visit);
      qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

export function useUpdateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Parameters<typeof updateVisit>[1];
    }) => updateVisit(id, patch),
    onSuccess: (visit) => {
      qc.invalidateQueries({ queryKey: visitKeys.lists() });
      qc.setQueryData(visitKeys.detail(visit.id), visit);
    },
  });
}

export function useCompleteVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeVisit(id),
    onSuccess: (visit) => {
      qc.invalidateQueries({ queryKey: visitKeys.lists() });
      qc.setQueryData(visitKeys.detail(visit.id), visit);
      qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

export function useAddVisitService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitId,
      service,
    }: {
      visitId: string;
      service: { service_code: string; service_label: string; amount?: number; notes?: string };
    }) => addVisitService(visitId, service),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: visitKeys.detail(vars.visitId) });
      qc.invalidateQueries({ queryKey: visitKeys.lists() });
    },
  });
}

export function useUpdateVisitService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      visitId,
      patch,
    }: {
      serviceId: string;
      visitId: string;
      patch: Parameters<typeof updateVisitService>[1];
    }) => updateVisitService(serviceId, patch),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: visitKeys.detail(vars.visitId) });
      qc.invalidateQueries({ queryKey: visitKeys.lists() });
    },
  });
}

export function useRemoveVisitService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId }: { serviceId: string; visitId: string }) =>
      removeVisitService(serviceId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: visitKeys.detail(vars.visitId) });
      qc.invalidateQueries({ queryKey: visitKeys.lists() });
    },
  });
}
