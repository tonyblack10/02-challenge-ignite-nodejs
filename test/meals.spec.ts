import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/app'
import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'

describe('Meals routes', () => {
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

  it('should be able to create a new meal', async () => {
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

    const { token } = authResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        existsOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  it('should be able to list all meals from a user', async () => {
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

    const { token } = authResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        existsOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Lunch',
        description: "It's a lunch",
        existsOnDiet: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day after
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(mealsResponse.body).toHaveLength(2)

    expect(mealsResponse.body[1].name).toBe('Lunch')
    expect(mealsResponse.body[0].name).toBe('Breakfast')
  })

  it('should be able to show a single meal', async () => {
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

    const { token } = authResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        existsOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const mealId = mealsResponse.body[0].id

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(mealResponse.body).toEqual(
      expect.objectContaining({
        name: 'Breakfast',
        description: "It's a breakfast",
        exists_on_diet: 1,
      }),
    )
  })

  it('should be able to update a meal from a user', async () => {
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

    const { token } = authResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        existsOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const mealId = mealsResponse.body[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dinner',
        description: "It's a dinner",
        existsOnDiet: true,
        date: new Date(),
      })
      .expect(204)
  })

  it('should be able to delete a meal from a user', async () => {
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

    const { token } = authResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        existsOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const mealId = mealsResponse.body[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  it('should be able to get metrics from a user', async () => {
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

    const { token } = authResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        existsOnDiet: true,
        date: new Date('2021-01-01T08:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Lunch',
        description: "It's a lunch",
        existsOnDiet: false,
        date: new Date('2021-01-01T12:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Snack',
        description: "It's a snack",
        existsOnDiet: true,
        date: new Date('2021-01-01T15:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dinner',
        description: "It's a dinner",
        existsOnDiet: true,
        date: new Date('2021-01-01T20:00:00'),
      })

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        existsOnDiet: true,
        date: new Date('2021-01-02T08:00:00'),
      })

    const metricsResponse = await request(app.server)
      .get('/meals/statistics')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 5,
      totalMealsOnDiet: 4,
      totalMealsOffDiet: 1,
      bestOnDietSequence: 3,
    })
  })
})
