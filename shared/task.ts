export interface Task {
  id: string;
  title: string;
  completed: boolean;
}
export type TaskFilter = "all" | "active" | "completed";
export const TITLE_LIMIT = 120;

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  return tasks.filter((task) => filter === "all" || task.completed === (filter === "completed"));
}
