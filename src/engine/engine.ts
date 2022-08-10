import { Engine as BaseEngine } from "grimoire-kolmafia";
import { Task } from "./task";
import { printProfits, ProfitTracker } from "./profits";
import { userConfirm } from "kolmafia";
import { PropertiesManager } from "libram";

export class Engine extends BaseEngine {
  public run(actions?: number, confirm?: boolean): void {
    for (let i = 0; i < (actions ?? Infinity); i++) {
      const task = this.getNextTask();
      if (!task) return;
      if (confirm && !userConfirm(`Executing ${task.name}, continue?`)) throw `Abort requested`;
      this.execute(task);
    }
  }
}

export class ProfitTrackingEngine extends Engine {
  profits: ProfitTracker;
  constructor(tasks: Task[], key: string) {
    super(tasks);
    this.profits = new ProfitTracker(key);
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

  initPropertiesManager(manager: PropertiesManager): void {
    super.initPropertiesManager(manager);
    manager.set({
      hpAutoRecovery: -0.05,
      mpAutoRecovery: -0.05,
    });
  }
}
