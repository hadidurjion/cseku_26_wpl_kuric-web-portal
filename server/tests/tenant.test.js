const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Institution = require('../models/Institution');
const User = require('../models/User');
const Proposal = require('../models/Proposal');
const Settings = require('../models/Settings');
const { seedKU } = require('./helpers/seed');

// Officer route that lists ALL proposals of the current RIC
const ALL_PROPOSALS = '/api/reviews/all-proposals';
const PW = 'pass1234';

let mongoServer, ku, du;
let kuOfficerToken, duOfficerToken, superToken;

async function makeUser(inst, email, role) {
  return User.create({
    name: `${role} ${inst.shortName}`,
    email,
    role,
    institutionId: inst._id,
    password: await bcrypt.hash(PW, 4),
  });
}

async function login(slug, email) {
  const r = await request(app)
    .post('/api/auth/login')
    .send({ email, password: PW, institution: slug });
  return r.body.token;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all([User.init(), Settings.init()]);

  ku = await seedKU();
  du = await Institution.create({ name: 'Dhaka University RIC', shortName: 'DU', slug: 'du', status: 'Active' });

  await makeUser(ku, 'officer@ku.test', 'officer');
  await makeUser(du, 'officer@du.test', 'officer');
  await makeUser(ku, 'super@ku.test', 'superadmin');
  const kuRes = await makeUser(ku, 'researcher@ku.test', 'researcher');
  const duRes = await makeUser(du, 'researcher@du.test', 'researcher');

  await Proposal.collection.insertOne({
    title: 'KU secret proposal', abstract: 'a', objectives: 'o', status: 'Submitted',
    researcher: kuRes._id, institutionId: ku._id, createdAt: new Date(), updatedAt: new Date(),
  });
  await Proposal.collection.insertOne({
    title: 'DU secret proposal', abstract: 'a', objectives: 'o', status: 'Submitted',
    researcher: duRes._id, institutionId: du._id, createdAt: new Date(), updatedAt: new Date(),
  });

  kuOfficerToken = await login('ku', 'officer@ku.test');
  duOfficerToken = await login('du', 'officer@du.test');
  superToken = await login('ku', 'super@ku.test');
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Multi-institution isolation', () => {
  test('1. a KU user cannot log in through DU', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'officer@ku.test', password: PW, institution: 'du' });
    expect(res.statusCode).toBe(400);
  });

  test('2. KU officer sees KU proposals only', async () => {
    const res = await request(app).get(ALL_PROPOSALS).set('Authorization', `Bearer ${kuOfficerToken}`);
    expect(res.statusCode).toBe(200);
    const body = JSON.stringify(res.body);
    expect(body).toContain('KU secret proposal');
    expect(body).not.toContain('DU secret proposal');
  });

  test('3. DU officer sees DU proposals only', async () => {
    const res = await request(app).get(ALL_PROPOSALS).set('Authorization', `Bearer ${duOfficerToken}`);
    expect(res.statusCode).toBe(200);
    const body = JSON.stringify(res.body);
    expect(body).toContain('DU secret proposal');
    expect(body).not.toContain('KU secret proposal');
  });

  test('4. the token wins over a spoofed x-institution header', async () => {
    const res = await request(app)
      .get(ALL_PROPOSALS)
      .set('Authorization', `Bearer ${kuOfficerToken}`)
      .set('x-institution', 'du');
    const body = JSON.stringify(res.body);
    expect(body).toContain('KU secret proposal');
    expect(body).not.toContain('DU secret proposal');
  });

  test('5. new content is stamped with the RIC and stays separate', async () => {
    const created = await request(app)
      .post('/api/content')
      .set('Authorization', `Bearer ${kuOfficerToken}`)
      .send({ type: 'news', title: 'KU only news', description: 'Only for KU' });
    expect([200, 201]).toContain(created.statusCode);

    const kuList = await request(app).get('/api/content?type=news').set('x-institution', 'ku');
    const duList = await request(app).get('/api/content?type=news').set('x-institution', 'du');
    expect(JSON.stringify(kuList.body)).toContain('KU only news');
    expect(JSON.stringify(duList.body)).not.toContain('KU only news');
  });

  test('6. homepage settings are separate per RIC', async () => {
    const k = await request(app).get('/api/settings').set('x-institution', 'ku');
    const d = await request(app).get('/api/settings').set('x-institution', 'du');
    expect(k.body.settings.contactAddress).toContain('Khulna University');
    expect(d.body.settings.contactAddress).toContain('Dhaka University');
  });

  test('7. the same email can exist in two RICs, but not twice in one', async () => {
    const body = { name: 'Same Person', email: 'same@example.com', password: PW };
    const a = await request(app).post('/api/auth/register').send({ ...body, institution: 'ku' });
    const b = await request(app).post('/api/auth/register').send({ ...body, institution: 'du' });
    const c = await request(app).post('/api/auth/register').send({ ...body, institution: 'ku' });
    expect(a.statusCode).toBe(201);
    expect(b.statusCode).toBe(201);
    expect(c.statusCode).toBe(400);
  });

  test('8. only the Super Admin can use the Super Admin API', async () => {
    const officer = await request(app).get('/api/superadmin/institutions').set('Authorization', `Bearer ${kuOfficerToken}`);
    const anon = await request(app).get('/api/superadmin/institutions');
    const sup = await request(app).get('/api/superadmin/institutions').set('Authorization', `Bearer ${superToken}`);
    expect(officer.statusCode).toBe(403);
    expect(anon.statusCode).toBe(401);
    expect(sup.statusCode).toBe(200);
    expect(sup.body.institutions.length).toBeGreaterThanOrEqual(2);
  });

  test('9. a new RIC stays Pending: no branding and no login until approved', async () => {
    const reg = await request(app).post('/api/institutions/register').send({
      name: 'Rajshahi University RIC', shortName: 'RU', slug: 'ru',
      directorName: 'RU Director', directorEmail: 'director@ru.test', password: PW,
    });
    expect(reg.statusCode).toBe(201);

    const info = await request(app).get('/api/institutions/ru');
    const loginTry = await request(app).post('/api/auth/login').send({ email: 'director@ru.test', password: PW, institution: 'ru' });
    expect(info.statusCode).toBe(404);
    expect(loginTry.statusCode).toBe(400);

    const list = await request(app).get('/api/superadmin/institutions').set('Authorization', `Bearer ${superToken}`);
    const ru = list.body.institutions.find((i) => i.slug === 'ru');
    const approve = await request(app)
      .patch(`/api/superadmin/institutions/${ru._id}/status`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ status: 'Active' });
    expect(approve.statusCode).toBe(200);

    const after = await request(app).post('/api/auth/login').send({ email: 'director@ru.test', password: PW, institution: 'ru' });
    expect(after.statusCode).toBe(200);
  });

  test('10. a suspended RIC is blocked immediately (login and existing sessions)', async () => {
    const ru = await Institution.findOne({ slug: 'ru' });
    const token = (await request(app).post('/api/auth/login').send({ email: 'director@ru.test', password: PW, institution: 'ru' })).body.token;

    const before = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(before.statusCode).toBe(200);

    const sus = await request(app)
      .patch(`/api/superadmin/institutions/${ru._id}/status`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ status: 'Suspended' });
    expect(sus.statusCode).toBe(200);

    const session = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    const loginTry = await request(app).post('/api/auth/login').send({ email: 'director@ru.test', password: PW, institution: 'ru' });
    expect(session.statusCode).toBe(403);
    expect(loginTry.statusCode).toBe(400);
  });

  test('11. the Super Admin cannot suspend their own RIC', async () => {
    const res = await request(app)
      .patch(`/api/superadmin/institutions/${ku._id}/status`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ status: 'Suspended' });
    expect(res.statusCode).toBe(400);
  });

  test('12. invalid portal addresses are rejected', async () => {
    const base = { name: 'X RIC', shortName: 'X', directorName: 'D', directorEmail: 'd@x.test', password: PW };
    for (const slug of ['a', 'has space', 'under_score', 'admin']) {
      const res = await request(app).post('/api/institutions/register').send({ ...base, slug });
      expect(res.statusCode).toBe(400);
    }
  });
});
