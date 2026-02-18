type Task = (delta: number) => void;

export class Scheduler {
  private tasks: Map<string, Task> = new Map();

  add(name: string, task: Task) {
    this.tasks.set(name, task);
  }

  remove(name: string) {
    this.tasks.delete(name);
  }

  run(delta: number) {
    for (const task of this.tasks.values()) {
      task(delta);
    }
  }

  clear() {
    this.tasks.clear();
  }
}
