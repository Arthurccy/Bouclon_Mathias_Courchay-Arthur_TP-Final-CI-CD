const app = require('./app');
const { connectDatabase } = require('./config/database');

const port = Number.parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`TaskFlow API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { startServer };
