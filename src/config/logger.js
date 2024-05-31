import winston from "winston";
import config from "./config.js";

const customLevelOptions = {
  levels: {
    FATAL: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    HTTP: 4,
    DEBUG: 5,
  },
  colors: {
    FATAL: "redBG",
    ERROR: "red",
    WARN: "yellow",
    INFO: "blue",
    HTTP: "green",
    DEBUG: "white",
  },
};

winston.addColors(customLevelOptions.colors);

const loggerProd = winston.createLogger({
  levels: customLevelOptions.levels,
  transports: [
    new winston.transports.File({
      filename: "./src/logs/errors.log",
      format: winston.format.simple(),
      level: "ERROR",
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      level: "WARN",
    }),
  ],
});

const loggerDev = winston.createLogger({
  levels: customLevelOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "DEBUG",
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

export const addLogger = (req, res, next) => {
  config.logger === "logger_dev" && (req.logger = loggerDev);
  config.logger === "logger_prod" && (req.logger = loggerProd);
  req.logger.HTTP(`Metodo: ${req.method} URL: ${req.url}`);
  next();
};
