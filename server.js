process.on("uncaughtException", (error) => {
  console.error(`Uncaught exception: ${error.name} - ${error.message}`);
  process.exit(1);
});

const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then((conn) => {
    console.log(`DB connection is successful: ${conn.connection.host}`);
  })
  .catch((error) => {
    console.error(`DB connection error: ${error}`);
    process.exit(1);
  });

const server = app.listen(PORT, () => {
  console.log(`API is running at http://localhost:${PORT}`);
  // console.log(`Interactive Route & Middleware Visualizer Dashboard: http://localhost:${PORT}/routes`);
});

process.on("unhandledRejection", (error) => {
  console.error(`Unhandled rejection at: ${error.name}, msg: ${error.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// process.on('SIGTERM', () => {
//     console.log('SIGTERM received, shutting down gracefully');
//     server.close(() => {
//         console.log('Process terminated');
//         process.exit(0);
//     });
// });

// process.on('SIGINT', () => {
//     console.log('SIGINT received, shutting down gracefully');
//     server.close(() => {
//         console.log('Process terminated');
//         process.exit(0);
//     });
// });
