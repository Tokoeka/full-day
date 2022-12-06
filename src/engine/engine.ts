import { Engine as BaseEngine } from "grimoire-kolmafia";
import { Task } from "./task";
import { printProfits, ProfitTracker } from "./profits";
import { userConfirm } from "kolmafia";
import { args } from "../main";

export class Engine extends BaseEngine<never, Task> {
  confirmed = new Set<string>();
  profits: ProfitTracker;

  constructor(tasks: Task[], key: string) {
    super(tasks);
    this.profits = new ProfitTracker(key);
  }

  public available(task: Task): boolean {
    for (const after of task.after ?? []) {
      const after_task = this.tasks_by_name.get(after);
      if (after_task === undefined) throw `Unknown task dependency ${after} on ${task.name}`;
      if (!after_task.completed()) return false;
    }
    // if (task.ready && !task.ready()) return false;
    if (task.completed()) return false;
    return true;
  }

  public run(actions?: number): void {
    for (let i = 0; i < (actions ?? Infinity); i++) {
      const task = this.getNextTask();
      if (!task) return;
      if (task.ready && !task.ready()) throw `Task ${task.name} is not ready`;
      if (args.debug.confirm && !this.confirmed.has(task.name)) {
        if (!userConfirm(`Executing ${task.name}, continue?`)) throw `Abort requested`;
        this.confirmed.add(task.name);
      }
      this.execute(task);
    }
  }

  execute(task: Task): void {
    try {
      super.execute(task);
    } finally {
      const questName = task.name.split("/")[0];
      this.profits.record(`${questName}@${task.tracking ?? "Other"}`);
      this.profits.save();
    }
  }

  destruct(): void {
    super.destruct();
    printProfits(this.profits.all());
  }
}
