export default () => ({
  database: {
    type: 'postgres',
    host: process.env.SUPABASE_HOST,
    port: parseInt(process.env.SUPABASE_PORT, 10) || 6543,
    username: process.env.SUPABASE_USERNAME,
    password: process.env.SUPABASE_PASSWORD,
    database: process.env.SUPABASE_DATABASE,
  },
});
