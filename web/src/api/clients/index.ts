import { Console } from "./console";
import { FileExplorer } from "./file-explorer";
import { Helper } from "./helper";

export class Clients {
  helper: Helper;
  console: Console;
  fileExplorer: FileExplorer;
  constructor() {
    this.helper = new Helper();
    this.console = new Console();
    this.fileExplorer = new FileExplorer();
  }
}
