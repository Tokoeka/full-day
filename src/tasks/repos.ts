import { cliExecute } from "kolmafia";
import { Quest } from "./structure";
import { get } from "libram";

export const reposQuest: Quest = {
  name: "Repos",
  tasks: [
    {
      name: "SVN",
      completed: () => get("_svnUpdated"),
      do: () => cliExecute("svn update"),
      limit: { tries: 1 },
    },
    {
      name: "Git",
      completed: () => get("_gitUpdated"),
      do: () => cliExecute("git update"),
      limit: { tries: 1 },
    },
  ],
};
