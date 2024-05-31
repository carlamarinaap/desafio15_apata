import { Command } from "commander";

const program = new Command();

program.option("-p", "Server port", 8080).option("--mode", "Work mode", "Production");

program.parse();
