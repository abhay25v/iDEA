// Application Entry Point

import app, { initializeServer } from './app';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize and start server
if (require.main === module) {
  initializeServer().catch((error) => {
    console.error('Server initialization failed:', error);
    process.exit(1);
  });
}

export default app;
