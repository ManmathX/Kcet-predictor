module.exports = {
  apps: [
    {
      name: 'predictor',
      script: 'server.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5003,
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};
