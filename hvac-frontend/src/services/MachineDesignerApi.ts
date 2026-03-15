import type {
  MachineType,
  CreateMachineTypePayload,
  UpdateMachineTypePayload,
} from "@/types/machine-type";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `HTTP ${response.status}`,
    );
  }
  return response.json() as Promise<T>;
}

export const MachineDesignerApi = {
  getAll(): Promise<MachineType[]> {
    return fetch(`${API_URL}/api/machine-types`).then((r) =>
      handleResponse<MachineType[]>(r),
    );
  },

  getBySlug(slug: string): Promise<MachineType> {
    return fetch(`${API_URL}/api/machine-types/${slug}`).then((r) =>
      handleResponse<MachineType>(r),
    );
  },

  create(data: CreateMachineTypePayload): Promise<MachineType> {
    return fetch(`${API_URL}/api/machine-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<MachineType>(r));
  },

  update(id: string, data: UpdateMachineTypePayload): Promise<MachineType> {
    return fetch(`${API_URL}/api/machine-types/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<MachineType>(r));
  },

  delete(id: string): Promise<void> {
    return fetch(`${API_URL}/api/machine-types/${id}`, {
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    });
  },
};
