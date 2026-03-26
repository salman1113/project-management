export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "developer";
}

export interface Project {
  id: number;
  name: string;
  description: string;
  created_by: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  project_id: number;
  assigned_to: number | null;
  due_date: string | null;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}