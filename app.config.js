module.exports = {
  apps: [
    {
      name: 'kyc.ddbc.dev',
      script: 'PORT=3002 npm start',
      instances: 'max', // Or a number of instances
    }
  ]
}