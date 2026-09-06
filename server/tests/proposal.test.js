const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Register and login a user to get a token for authenticated requests
  await request(app).post('/api/auth/register').send({
    name: 'Proposal Tester',
    email: 'proposaltester@ku.ac.bd',
    password: 'password123',
    department: 'CSE',
    designation: 'Student',
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'proposaltester@ku.ac.bd',
    password: 'password123',
  });

  authToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Proposal API', () => {
  test('should reject proposal submission without a token', async () => {
    const res = await request(app).post('/api/proposals').send({
      title: 'Unauthorized Proposal',
      abstract: 'Should not be saved',
      objectives: 'Testing auth guard',
    });
    expect(res.statusCode).toBe(401);
  });

  test('should reject proposal submission with missing required fields', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Incomplete Proposal' });
    expect(res.statusCode).toBe(400);
  });

  test('should create a proposal successfully with a valid token', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${authToken}`)
      .field('title', 'AI in Agriculture')
      .field('abstract', 'A short study on AI applications.')
      .field('objectives', 'Improve crop yield prediction.')
      .field('budget', '500000')
      .field('timeline', '6 months')
      .field('isDraft', 'false');

    expect(res.statusCode).toBe(201);
    expect(res.body.proposal.title).toBe('AI in Agriculture');
    expect(res.body.proposal.status).toBe('Pending');
  });

  test('should mark proposal as Draft when isDraft is true', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${authToken}`)
      .field('title', 'Draft Proposal')
      .field('abstract', 'Draft abstract')
      .field('objectives', 'Draft objectives')
      .field('isDraft', 'true');

    expect(res.statusCode).toBe(201);
    expect(res.body.proposal.status).toBe('Draft');
  });

  test('should fetch only the logged-in researcher proposals', async () => {
    const res = await request(app)
      .get('/api/proposals/mine')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.proposals)).toBe(true);
    expect(res.body.proposals.length).toBe(2); // the 2 proposals created above
  });

  test('should reject fetching proposals without a token', async () => {
    const res = await request(app).get('/api/proposals/mine');
    expect(res.statusCode).toBe(401);
  });
});