import { Engine as BaseEngine } from "grimoire-kolmafia";
import { Task } from "../tasks/structure";
import { printProfits, ProfitTracker } from "./profits";
import { haveEffect, userConfirm } from "kolmafia";
import { $effect, have, PropertiesManager, set, uneffect } from "libram";
import { args } from "../args";
import { debug } from "../lib";

export class Engine extends BaseEngine<never, Task> {
  confirmed = new Set<string>();
  profits: ProfitTracker;

  constructor(tasks: Task[], completedTasks: string[], key: string) {
    const completed_set = new Set<string>(completedTasks.map((n) => n.trim()));
    // Completed tasks are always completed
    tasks = tasks.map((task) => {
      if (completed_set.has(task.name)) return { ...task, completed: () => true };
      return task;
    });
    super(tasks);
    this.profits = new ProfitTracker(key);

    for (const task of completed_set) {
      if (!this.tasks_by_name.has(task)) debug(`Warning: Unknown completedtask ${task}`);
    }
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

  post(task: Task): void {
    super.post(task);
    if (haveEffect($effect`Beaten Up`) > 3) uneffect($effect`Beaten Up`);
    if (have($effect`Beaten Up`)) throw "Fight was lost; stop.";
  }

  destruct(): void {
    super.destruct();
    printProfits(this.profits.all());
  }

  initPropertiesManager(manager: PropertiesManager): void {
    super.initPropertiesManager(manager);
    manager.set({ valueOfAdventure: args.minor.voa });
    set("garbo_yachtzeechain", true);
    set("garbo_candydish", true);
    set("freecandy_treatOutfit", "Ceramic Suit");
  }
}
