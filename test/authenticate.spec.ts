import { app } from '../src/app'
import { execSync } from 'child_process'
import request from 'supertest'
import { describe, afterAll, beforeAll, beforeEach, it, expect } from 'vitest'

describe('Authenticate routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to authenticate with valid credentials', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        password: '123456',
      })
      .expect(201)

    const authResponse = await request(app.server)
      .post('/authenticate')
      .send({ email: 'johndoe@gmail.com', password: '123456' })
      .expect(200)

    expect(authResponse.body.token).not.toBeNull()
  })

  it('should not be able to authenticate with invalid credentials', async () => {
    await request(app.server)
      .post('/authenticate')
      .send({ email: 'johndoe@gmail.com', password: '123456' })
      .expect(401)
  })
})
