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
});

process.on("unhandledRejection", (error) => {
  console.error(`Unhandled rejection at: ${error.name}, msg: ${error.message}`);
  server.close(() => {
    process.exit(1);
  });
});
