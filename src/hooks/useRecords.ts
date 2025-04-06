import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecords,
  addRecord,
  updateRecord,
  deleteRecord,
} from "../services/supabase";
import type { Record } from "../types/Record";

export const useRecords = () => {
  const queryClient = useQueryClient();

  const records = useQuery({
    queryKey: ["records"],
    queryFn: getRecords,
  });

  const addRecordMutation = useMutation({
    mutationFn: addRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Record> }) =>
      updateRecord(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  return {
    records: records.data ?? [],
    isLoading: records.isLoading,
    error: records.error,
    addRecord: addRecordMutation.mutate,
    updateRecord: updateRecordMutation.mutate,
    deleteRecord: deleteRecordMutation.mutate,
    isModifying:
      addRecordMutation.isPending ||
      updateRecordMutation.isPending ||
      deleteRecordMutation.isPending,
  };
};
