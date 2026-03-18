module.exports = {
  apps: [
    {
      name: 'ziva-service',
      cwd: '/Users/preet/Documents/Friend Claw/dostai/ziva-service',
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
      cwd: '/Users/preet/Documents/Friend Claw/dostai/liam-service',
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
      cwd: '/Users/preet/Documents/Friend Claw/dostai/anime-service',
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
      cwd: '/Users/preet/Documents/Friend Claw/dostai/celeb-service',
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
      cwd: '/Users/preet/Documents/Friend Claw/dostai/safespace-service',
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
      cwd: '/Users/preet/Documents/Friend Claw/dostai/mindreset-service',
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
      cwd: '/Users/preet/Documents/Friend Claw/dostai/openclaw-service',
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
      cwd: '/Users/preet/Documents/Friend Claw/dostai/sarvam-proxy',
      script: 'adapter.js',
      env: {
        PORT: 3005,
        NODE_ENV: 'production'
      }
    }
  ]
};
