const ENV = {
  development: {
    apiUrl: "http://localhost:8080",
  },
  production: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  },
} as const;

type Env = "development" | "production";

const getEnv = (): Env => {
  const env = process.env.APP_ENV as Env | undefined;
  if (env === "production") return "production";
  return "development";
};

export const config = ENV[getEnv()];
