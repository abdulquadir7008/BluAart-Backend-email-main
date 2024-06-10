const fastify = require('fastify')({logger:true})

fastify.register(require('@fastify/cors'),{
  origin:'*'
})
const config = require("./Config");

const { Pool } = require('pg');
const pool = new Pool(config.sqldb);

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Error connecting to the database:', err);
  pool.end(); // Close the pool in case of an error
});

fastify.register(require('./routes/EmailRouter'));

const start = async () => {
  try {
    await fastify.listen(config.server.port, '0.0.0.0')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

fastify.get('/', (request, reply) => {
  const message = '<strong>Fastify Running !!! </strong>'
  reply.type('text/html').send(message)
})

start()

module.exports = fastify