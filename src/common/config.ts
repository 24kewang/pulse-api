function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Env variable ${name} is not defined!`);
    }
    return value;
}

const Config = {
    SUPABASE_URL: requireEnv("SUPABASE_URL"),
    SUPABASE_ANON_KEY: requireEnv("SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),

    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,

    ALLOWED_ORIGINS: [
        /^https:\/\/(www\.)?pulseillinois\.org$/,
        /^https:\/\/pulse-[\w-]+\.vercel\.app$/,
        /^http:\/\/localhost:\d+$/,
    ],

    MAX_REQUEST_SIZE: "100kb",
};

export default Config;
