const amqp = require('amqplib');

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

const OFFRE_EXCHANGE = 'offre.exchange';
const OFFRE_CREATED_QUEUE = 'offre.created.queue';
const OFFRE_CREATED_ROUTING_KEY = 'offre.created';

const CANDIDATURE_EXCHANGE = 'candidature.exchange';
const CANDIDATURE_CREATED_QUEUE = 'candidature.created.queue';
const CANDIDATURE_STATUS_QUEUE = 'candidature.status.updated.queue';
const CANDIDATURE_CREATED_ROUTING_KEY = 'candidature.created';
const CANDIDATURE_STATUS_ROUTING_KEY = 'candidature.status.updated';

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(OFFRE_EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(OFFRE_CREATED_QUEUE, { durable: true });
    await channel.bindQueue(OFFRE_CREATED_QUEUE, OFFRE_EXCHANGE, OFFRE_CREATED_ROUTING_KEY);

    await channel.assertExchange(CANDIDATURE_EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(CANDIDATURE_CREATED_QUEUE, { durable: true });
    await channel.assertQueue(CANDIDATURE_STATUS_QUEUE, { durable: true });
    await channel.bindQueue(
      CANDIDATURE_CREATED_QUEUE,
      CANDIDATURE_EXCHANGE,
      CANDIDATURE_CREATED_ROUTING_KEY
    );
    await channel.bindQueue(
      CANDIDATURE_STATUS_QUEUE,
      CANDIDATURE_EXCHANGE,
      CANDIDATURE_STATUS_ROUTING_KEY
    );

    console.log('RabbitMQ connected successfully');

    setupOffreEventListener();
  } catch (error) {
    console.error('RabbitMQ connection error:', error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

function setupOffreEventListener() {
  channel.consume(OFFRE_CREATED_QUEUE, (message) => {
    if (!message) return;

    try {
      const event = JSON.parse(message.content.toString());
      console.log('Received offre created event:', event);

      handleOffreCreatedEvent(event);

      channel.ack(message);
    } catch (error) {
      console.error('Error processing offre event:', error.message);
      channel.nack(message, false, false);
    }
  });
}

function handleOffreCreatedEvent(event) {
  const { offreId, titre, entreprise } = event;
  console.log(`Nouvelle offre disponible: ${titre} - ${entreprise} (ID: ${offreId})`);
}

function publishCandidatureEvent(routingKey, payload) {
  if (!channel) {
    console.warn(`RabbitMQ channel not ready. Event ${routingKey} was not published.`);
    return false;
  }

  const event = {
    ...payload,
    eventType: routingKey,
    occurredAt: new Date().toISOString()
  };

  const published = channel.publish(
    CANDIDATURE_EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(event)),
    {
      contentType: 'application/json',
      persistent: true
    }
  );

  console.log(`Published RabbitMQ event ${routingKey}:`, event);
  return published;
}

function publishCandidatureCreated(candidature) {
  return publishCandidatureEvent(CANDIDATURE_CREATED_ROUTING_KEY, {
    candidatureId: candidature.id,
    offreId: candidature.offreId,
    userId: candidature.userId,
    nomCandidat: candidature.nomCandidat,
    emailCandidat: candidature.emailCandidat,
    statut: candidature.statut
  });
}

function publishCandidatureStatusUpdated(candidature) {
  return publishCandidatureEvent(CANDIDATURE_STATUS_ROUTING_KEY, {
    candidatureId: candidature.id,
    offreId: candidature.offreId,
    userId: candidature.userId,
    statut: candidature.statut
  });
}

async function closeRabbitMQ() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ:', error.message);
  }
}

module.exports = {
  connectRabbitMQ,
  closeRabbitMQ,
  publishCandidatureCreated,
  publishCandidatureStatusUpdated
};
