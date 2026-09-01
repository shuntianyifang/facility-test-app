export interface Task {
  id: string;
  title: string;
  completed: boolean;
}
export type TaskFilter = "all" | "active" | "completed";
export const TITLE_LIMIT = 120;

export function countActiveTasks(tasks: Task[]): number {
  return tasks.filter((task) => !task.completed).length;
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  return tasks.filter((task) => filter === "all" || task.completed === (filter === "completed"));
}

export function matchesQuery(title: string, query: string): boolean {
  const keyword = query.trim().toLowerCase();
  return keyword === "" || title.toLowerCase().includes(keyword);
}

export function filterByQuery(tasks: Task[], query: string): Task[] {
  return tasks.filter((task) => matchesQuery(task.title, query));
}
