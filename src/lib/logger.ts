import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino(
  { level: "info" },
  isProduction
    ? pino.transport({
        target: "@axiomhq/pino",
        options: {
          dataset: process.env.AXIOM_DATASET,
          token: process.env.AXIOM_TOKEN,
        },
      })
    : undefined, // Falls back to default local logging behavior
);
