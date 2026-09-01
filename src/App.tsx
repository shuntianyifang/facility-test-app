import { type FormEvent, useEffect, useState } from "react";
import {
  countActiveTasks,
  filterByQuery,
  filterTasks,
  type Task,
  type TaskFilter,
  TITLE_LIMIT,
} from "../shared/task";

const filters: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "全部任务" },
  { value: "active", label: "待完成" },
  { value: "completed", label: "已完成" },
];
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "请求失败，请稍后重试");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    request<Task[]>("/api/tasks")
      .then((items) => {
        if (active) setTasks(items);
      })
      .catch(() => {
        if (active) setError("无法连接任务服务，请确认本地服务正在运行后刷新页面。");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function mutate(action: () => Promise<void>, message: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("请输入任务标题，不能只包含空格。");
      return;
    }
    void mutate(async () => {
      const task = await request<Task>("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      setTasks((items) => [...items, task]);
      setTitle("");
      setFilter("all");
    }, "任务已添加");
  }
  function toggle(task: Task) {
    void mutate(
      async () => {
        const updated = await request<Task>(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !task.completed }),
        });
        setTasks((items) => items.map((item) => (item.id === task.id ? updated : item)));
      },
      task.completed ? "任务已恢复为待完成" : "任务已完成",
    );
  }
  function remove(task: Task) {
    void mutate(async () => {
      await request<void>(`/api/tasks/${task.id}`, { method: "DELETE" });
      setTasks((items) => items.filter((item) => item.id !== task.id));
    }, "任务已删除");
  }
  const completed = tasks.filter((task) => task.completed).length;
  const activeCount = countActiveTasks(tasks);
  const visible = filterByQuery(filterTasks(tasks, filter), search);
  const hasQuery = search.trim().length > 0;
  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Taskroom 首页">
          <span className="brand-mark">t.</span>
          <span>
            taskroom<span className="brand-sub">开发练习室</span>
          </span>
        </a>
        <div className="workspace-label">WORKSPACE / 01</div>
        <div className="sidebar-active">
          <span>▤</span> 我的任务 <span className="count">{tasks.length}</span>
        </div>
        <div className="sidebar-note">
          <span className="dot" /> 本地测试环境
          <p>
            从一个小任务开始，
            <br />
            让每一次改动都有证据。
          </p>
        </div>
        <div className="sidebar-bottom">
          FACILITY TEST PROJECT
          <br />
          <span>React · Fastify · TypeScript</span>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>
            工作空间 <span className="slash">/</span> 我的任务
          </span>
          <span className="local-badge">LOCAL ONLY</span>
        </header>
        <section className="content" aria-labelledby="page-title">
          <div className="intro">
            <div>
              <p className="eyebrow">SMALL TASKS. REAL PROGRESS.</p>
              <div className="title-row">
                <h1 id="page-title">把想法，变成下一步。</h1>
                <span
                  className="active-badge"
                  role="note"
                  aria-label={`${activeCount} 个待完成任务`}
                >
                  {activeCount} 待完成
                </span>
              </div>
              <p className="subtitle">一个任务，一次验证。这里是你的 AI 开发练习室。</p>
            </div>
            <span className="edition">
              NO. 001
              <br />
              TASK BOARD
            </span>
          </div>
          <div className="metrics">
            <div>
              <span>全部任务</span>
              <strong>{tasks.length.toString().padStart(2, "0")}</strong>
            </div>
            <div>
              <span>待完成</span>
              <strong>{(tasks.length - completed).toString().padStart(2, "0")}</strong>
            </div>
            <div>
              <span>已完成</span>
              <strong className="green">{completed.toString().padStart(2, "0")}</strong>
            </div>
          </div>
          <form className="composer" onSubmit={add}>
            <label htmlFor="task-title">下一步想做什么？</label>
            <div className="composer-row">
              <input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={TITLE_LIMIT}
                placeholder="例如：给第一个功能写一条测试"
                autoComplete="off"
                disabled={loading || busy}
              />
              <button className="primary" type="submit" disabled={loading || busy}>
                ＋ 添加任务
              </button>
            </div>
            <div className="composer-hint">
              让任务小一点，让完成更清晰。
              <span>
                {title.length}/{TITLE_LIMIT}
              </span>
            </div>
          </form>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <p className="notice" role="status" aria-live="polite">
            {notice}
          </p>
          <div className="list-header">
            <fieldset className="filters" aria-label="任务筛选">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={filter === item.value}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </fieldset>
            <input
              className="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索任务…"
              aria-label="搜索任务"
            />
            <span className="list-count">{visible.length} 个任务</span>
          </div>
          {loading ? (
            <div className="empty">正在加载任务…</div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <span className="empty-symbol">✓</span>
              <h2>
                {hasQuery
                  ? "没有找到匹配的任务。"
                  : filter === "all"
                    ? "留白，是开始的地方。"
                    : "这个列表暂时是空的。"}
              </h2>
              <p>
                {hasQuery
                  ? "换个关键词，或清空搜索后查看全部任务。"
                  : filter === "all"
                    ? "添加第一个小任务，开始你的第一轮开发验证。"
                    : "切换筛选，或添加一个新的任务。"}
              </p>
            </div>
          ) : (
            <ul className="task-list" aria-label="任务列表">
              {visible.map((task) => (
                <li key={task.id} className={task.completed ? "task done" : "task"}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    disabled={busy}
                    onChange={() => toggle(task)}
                    aria-label={`完成：${task.title}`}
                  />
                  <span className="task-title">{task.title}</span>
                  <span className="task-state">{task.completed ? "已完成" : "待完成"}</span>
                  <button
                    className="delete"
                    type="button"
                    disabled={busy}
                    onClick={() => remove(task)}
                    aria-label={`删除：${task.title}`}
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
          <footer>
            <span className="dot" />{" "}
            数据只保存在服务内存，重启后清空。这里不连接模型，也不存储密钥。
          </footer>
        </section>
      </main>
    </div>
  );
}
