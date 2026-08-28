import { randomUUID } from "node:crypto";
import { type Task, TITLE_LIMIT } from "../shared/task.js";

export class TaskStore {
  private tasks = new Map<string, Task>();
  constructor(private makeId: () => string = randomUUID) {}
  list(): Task[] {
    return [...this.tasks.values()].map((task) => ({ ...task }));
  }
  create(rawTitle: string): Task {
    const title = rawTitle.trim();
    if (!title || title.length > TITLE_LIMIT)
      throw new Error(`任务标题应为 1–${TITLE_LIMIT} 个字符`);
    const task = { id: this.makeId(), title, completed: false };
    this.tasks.set(task.id, task);
    return { ...task };
  }
  setCompleted(id: string, completed: boolean): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    task.completed = completed;
    return { ...task };
  }
  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}
