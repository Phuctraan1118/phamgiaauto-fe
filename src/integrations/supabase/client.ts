import type { Database } from './types';

const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000').replace(/\/$/, '');
const SESSION_KEY = 'phamgiaauto_session';

type TableName = keyof Database['public']['Tables'];
type QueryFilter = { op: 'eq' | 'neq' | 'in' | 'ilike' | 'gte' | 'lte' | 'or'; column?: string; value: unknown };
type QueryOrder = { column: string; ascending: boolean; nullsFirst?: boolean };

export type ApiUser = {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
};

export type ApiSession = {
  access_token: string;
  user: ApiUser;
};

export type ApiManagedUser = ApiUser & {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

type AuthCallback = (event: string, session: ApiSession | null) => void;
const authListeners = new Set<AuthCallback>();

function getStoredSession(): ApiSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function setStoredSession(session: ApiSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  authListeners.forEach((listener) => listener(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getStoredSession();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const normalizedPath = API_URL.endsWith('/api') && path.startsWith('/api/')
    ? path.slice('/api'.length)
    : path;
  const response = await fetch(`${API_URL}${normalizedPath}`, { ...options, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.detail || 'Yêu cầu API thất bại');
  }

  return payload as T;
}

class ApiQueryBuilder<T = unknown> implements PromiseLike<{ data: T | T[] | null; error: Error | null }> {
  private filters: QueryFilter[] = [];
  private orders: QueryOrder[] = [];
  private limitCount?: number;
  private mode: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload?: unknown;
  private expectsSingle = false;
  private signal?: AbortSignal;

  constructor(private table: TableName) {}

  select(_columns = '*') {
    this.mode = 'select';
    return this;
  }

  insert(payload: unknown) {
    this.mode = 'insert';
    this.payload = Array.isArray(payload) ? payload[0] : payload;
    return this;
  }

  update(payload: unknown) {
    this.mode = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.mode = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ op: 'eq', column, value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ op: 'neq', column, value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ op: 'in', column, value });
    return this;
  }

  ilike(column: string, value: string) {
    this.filters.push({ op: 'ilike', column, value });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push({ op: 'gte', column, value });
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push({ op: 'lte', column, value });
    return this;
  }

  or(value: string) {
    this.filters.push({ op: 'or', value });
    return this;
  }

  order(column: string, options: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    this.orders.push({
      column,
      ascending: options.ascending ?? true,
      nullsFirst: options.nullsFirst,
    });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  abortSignal(signal: AbortSignal) {
    this.signal = signal;
    return this;
  }

  maybeSingle() {
    this.expectsSingle = true;
    return this;
  }

  single() {
    this.expectsSingle = true;
    return this;
  }

  then<TResult1 = { data: T | T[] | null; error: Error | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | T[] | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private queryString() {
    const params = new URLSearchParams();
    this.filters.forEach((filter) => params.append('filter', JSON.stringify(filter)));
    this.orders.forEach((order) => params.append('order', JSON.stringify(order)));
    if (this.limitCount) params.set('limit', String(this.limitCount));
    const text = params.toString();
    return text ? `?${text}` : '';
  }

  private async execute(): Promise<{ data: T | T[] | null; error: Error | null }> {
    try {
      let data: unknown;

      if (this.mode === 'insert') {
        data = await request(`/api/${String(this.table)}`, {
          method: 'POST',
          body: JSON.stringify(this.payload),
          signal: this.signal,
        });
      } else if (this.mode === 'update') {
        data = await request(`/api/${String(this.table)}${this.queryString()}`, {
          method: 'PATCH',
          body: JSON.stringify(this.payload),
          signal: this.signal,
        });
      } else if (this.mode === 'delete') {
        data = await request(`/api/${String(this.table)}${this.queryString()}`, {
          method: 'DELETE',
          signal: this.signal,
        });
      } else {
        data = await request(`/api/${String(this.table)}${this.queryString()}`, { signal: this.signal });
      }

      if (this.expectsSingle && Array.isArray(data)) {
        return { data: (data[0] ?? null) as T | null, error: null };
      }

      return { data: data as T | T[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

function storageBucket(bucket: string) {
  return {
    async upload(path: string, file: File) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const data = await request<{ path: string; publicUrl: string }>(
          `/api/storage/${bucket}/upload?path=${encodeURIComponent(path)}`,
          { method: 'POST', body: formData },
        );
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },
    getPublicUrl(path: string) {
      const uploadBaseUrl = API_URL ? API_URL : '/api';
      return { data: { publicUrl: `${uploadBaseUrl}/uploads/${bucket}/${path}` } };
    },
    async remove(paths: string[]) {
      try {
        const data = await request(`/api/storage/${bucket}`, {
          method: 'DELETE',
          body: JSON.stringify({ paths }),
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },
  };
}

export const supabase = {
  from<T = unknown>(table: TableName) {
    return new ApiQueryBuilder<T>(table);
  },
  auth: {
    onAuthStateChange(callback: AuthCallback) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => authListeners.delete(callback),
          },
        },
      };
    },
    async getSession() {
      let session = getStoredSession();
      if (session && !session.user.role) {
        try {
          const data = await request<{ session: ApiSession }>('/api/auth/me');
          session = data.session;
          setStoredSession(session);
        } catch {
          session = null;
          setStoredSession(null);
        }
      }
      return { data: { session }, error: null };
    },
    async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) {
      try {
        const data = await request<{ session: ApiSession; user: ApiUser }>('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password, full_name: options?.data?.full_name }),
        });
        setStoredSession(data.session);
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const data = await request<{ session: ApiSession; user: ApiUser }>('/api/auth/signin', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setStoredSession(data.session);
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },
    async signOut() {
      setStoredSession(null);
      return { error: null };
    },
  },
  admin: {
    async listUsers() {
      try {
        const data = await request<ApiManagedUser[]>('/api/admin/users');
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },
    async createUser(payload: {
      email: string;
      password: string;
      full_name?: string;
      phone?: string;
      role: 'admin' | 'staff';
    }) {
      try {
        const data = await request<ApiManagedUser>('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },
  },
  storage: {
    from: storageBucket,
  },
};
