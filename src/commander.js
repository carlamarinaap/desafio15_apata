import { Command } from "commander";

const program = new Command();
program
  .option("-p <port>", "Server port", 8080)
  .option("--mode <mode>", "Work mode", "production");
program.parse();

export let port = program.opts().p;
export let mode = program.opts().mode;
