"use strict";
const log4jsConfig = {
  appenders: {
    stdout: { type: "stdout" },
    noodle: {
      type: "dateFile",
      //文件名为= filename + pattern, 设置为alwaysIncludePattern：true
      filename: "logs/defistation-data-provider",
      pattern: "yyyy-MM-dd.log",
      //包含模型
      alwaysIncludePattern: true,
    },
  },
  categories: { default: { appenders: ["stdout", "noodle"], level: "info" } },
};
const config = {
  clientId: "DAOventures",
  key: "a2ec8991-d4f8-4a3c-8fa2-7e245beaa1e4",
};

module.exports = { log4jsConfig: log4jsConfig, default: config };
