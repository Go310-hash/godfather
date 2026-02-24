/**
 * StudentService - API and localStorage for student registration
 */
import type { Student, StudentFormData } from '../types/student';

const STORAGE_KEY = 'pchs_registrations';
const API_BASE = typeof window !== 'undefined' ? window.location.origin : '';

function getToken(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('pchs_admin_token') : null;
}

export class StudentService {
  /**
   * Submit registration to API or fallback to localStorage
   */
  static async submit(data: StudentFormData, passportFile?: File): Promise<{ success: boolean; id?: number; message?: string }> {
    if (API_BASE) {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v ?? ''));
      if (passportFile) formData.append('passportPhoto', passportFile);

      const res = await fetch(`${API_BASE}/api/students`, {
        method: 'POST',
        body: formData,
      });
      const body = await res.json();
      if (res.ok) return { success: true, id: body.id };
      return { success: false, message: body.message || 'Submission failed' };
    }

    const list = this.getLocalList();
    const item = {
      ...data,
      id: `local_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
    };
    list.push(item);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return { success: true };
    } catch {
      return { success: false, message: 'Failed to save locally' };
    }
  }

  static getLocalList(): Array<StudentFormData & { id: string; createdAt: string; status: string }> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static async list(params?: { status?: string; search?: string }): Promise<Student[]> {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');
    const q = new URLSearchParams(params as Record<string, string>);
    const res = await fetch(`${API_BASE}/api/students?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Failed to fetch');
    return body.data || [];
  }

  static async getById(id: number): Promise<Student | null> {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (!res.ok) return null;
    return body.data || null;
  }

  static async updateStatus(id: number, status: 'approved' | 'rejected', notes?: string): Promise<Student | null> {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');
    const res = await fetch(`${API_BASE}/api/students/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, notes }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Update failed');
    return body.data || null;
  }

  static async delete(id: number): Promise<boolean> {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    return res.ok && body.success;
  }
}
