// Staff-only calls. Lives in the staff app only, so the client app and the
// APK contain no trace of staff functions.
import { supabaseClient } from '../data/backend/supabaseBackend';
import { BackendError, type ClientList, type Journey, type MyFarm, type Profile, type Stage, type Technician, type Visit } from '../data/backend/types';

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error, status } = await supabaseClient().rpc(name, args);
  if (error) {
    if (!status) throw new BackendError('offline');
    throw new BackendError(/forbidden|not_verified/.test(error.message) ? 'forbidden' : /not_found/.test(error.message) ? 'not_found' : 'server_error', status);
  }
  return data as T;
}

export const adminApi = {
  listClients: ({ search = '', stage = '' as Stage | '', page = 1, staff = false }) =>
    rpc<ClientList>('admin_list_clients', { q: search, stage_filter: stage, staff, page }),
  getClient: (id: string) => rpc<{ profile: Profile; journey: Journey } & MyFarm>('admin_get_client', { client: id }),
  addEvent: (clientId: string, stage: Stage, note?: string) =>
    rpc<Journey>('admin_add_event', { client: clientId, stage, note: note ?? null }),
  setRole: (userId: string, role: 'client' | 'admin') => rpc<Profile>('admin_set_role', { target: userId, new_role: role }),

  listTechnicians: () => rpc<Technician[]>('admin_list_technicians', {}),
  saveTechnician: (t: Partial<Technician> & { name: string }) => rpc<Technician[]>('admin_save_technician', { t }),
  /** One client's visits, or every upcoming visit when no client is given. */
  listVisits: (clientId?: string) => rpc<Visit[]>('admin_list_visits', { client: clientId ?? null }),
  saveVisit: (v: Record<string, unknown> & { startsAt: string }) => rpc<Visit>('admin_save_visit', { v }),
  setStepDone: (stepId: string, done: boolean) => rpc<Visit>('admin_set_step_done', { step: stepId, done }),

  /** Uploads a technician photo (resized to 600 px JPEG) and returns its storage path. */
  async uploadTechnicianPhoto(file: File): Promise<string> {
    const blob = await resizeImage(file, 600);
    const path = `${crypto.randomUUID()}.jpg`;
    const { error } = await supabaseClient().storage.from('technicians')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false, cacheControl: '31536000' });
    if (error) throw new BackendError(/row-level|unauthorized|403/i.test(error.message) ? 'forbidden' : 'server_error');
    return path;
  },
};

async function resizeImage(file: File, max: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  // Square crop from the centre, so photos sit well in a circle.
  const side = Math.min(bitmap.width, bitmap.height);
  const out = Math.min(max, side);
  const canvas = document.createElement('canvas');
  canvas.width = out; canvas.height = out;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, out, out);
  bitmap.close();
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new BackendError('invalid_photo'))), 'image/jpeg', 0.85));
}

export const isStaff = (p: Profile | null) => p?.role === 'admin' || p?.role === 'super_admin';
export const isSuperAdmin = (p: Profile | null) => p?.role === 'super_admin';
