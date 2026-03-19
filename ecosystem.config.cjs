module.exports = {
  apps: [
    {
      name: 'ziva-service',
      cwd: './ziva-service',
      script: 'src/index.js',
      env: {
        PORT: 3006,
        NODE_ENV: 'production',
        MONGODB_URI: process.env.MONGODB_URI,
        SARVAM_PROXY_URL: "http://localhost:3005/v1/chat/completions"
      }
    },
    {
      name: 'liam-service',
      cwd: './liam-service',
      script: 'src/index.js',
      env: {
        PORT: 3007,
        NODE_ENV: 'production',
        MONGODB_URI: process.env.MONGODB_URI,
        SARVAM_PROXY_URL: "http://localhost:3005/v1/chat/completions"
      }
    },
    {
      name: 'anime-service',
      cwd: './anime-service',
      script: 'src/index.js',
      env: {
        PORT: 3008,
        NODE_ENV: 'production',
        MONGODB_URI: process.env.MONGODB_URI,
        SARVAM_PROXY_URL: "http://localhost:3005/v1/chat/completions"
      }
    },
    {
      name: 'celeb-service',
      cwd: './celeb-service',
      script: 'src/index.js',
      env: {
        PORT: 3009,
        NODE_ENV: 'production',
        MONGODB_URI: process.env.MONGODB_URI,
        SARVAM_PROXY_URL: "http://localhost:3005/v1/chat/completions"
      }
    },
    {
      name: 'safespace-service',
      cwd: './safespace-service',
      script: 'src/index.js',
      env: {
        PORT: 3010,
        NODE_ENV: 'production',
        MONGODB_URI: process.env.MONGODB_URI,
        SARVAM_PROXY_URL: "http://localhost:3005/v1/chat/completions"
      }
    },
    {
      name: 'mindreset-service',
      cwd: './mindreset-service',
      script: 'src/index.js',
      env: {
        PORT: 3011,
        NODE_ENV: 'production',
        MONGODB_URI: process.env.MONGODB_URI,
        SARVAM_PROXY_URL: "http://localhost:3005/v1/chat/completions"
      }
    },
    {
      name: 'openclaw-service',
      cwd: './openclaw-service',
      script: 'src/index.js',
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
        MONGODB_URI: process.env.MONGODB_URI,
        SARVAM_PROXY_URL: "http://localhost:3005/v1/chat/completions"
      }
    },
    {
      name: 'sarvam-proxy',
      cwd: './sarvam-proxy',
      script: 'adapter.js',
      env: {
        PORT: 3005,
        NODE_ENV: 'production'
      }
    }
  ]
};
