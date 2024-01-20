import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { verifyJWT } from '../middlewares/verify-jwt'

const mealBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  date: z.string(),
  existsOnDiet: z.boolean(),
})

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/', async (request, reply) => {
    const userId = request.user.sign.sub

    const { name, description, date, existsOnDiet } = mealBodySchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date,
      exists_on_diet: existsOnDiet,
      user_id: userId,
    })

    return reply.status(201).send()
  })

  app.get('/', async (request, reply) => {
    const userId = request.user.sign.sub

    const meals = await knex('meals')
      .select(
        'id',
        'name',
        'description',
        'exists_on_diet',
        'date',
        'created_at',
        'updated_at',
      )
      .where('user_id', userId)

    return reply.send(meals)
  })

  app.get('/:id', async (request, reply) => {
    const userId = request.user.sign.sub

    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .select(
        'id',
        'name',
        'description',
        'exists_on_diet',
        'date',
        'created_at',
        'updated_at',
      )
      .where('id', id)
      .andWhere('user_id', userId)
      .first()

    if (!meal) {
      return reply.status(404).send()
    }

    return reply.send(meal)
  })

  app.delete('/:id', async (request, reply) => {
    const userId = request.user.sign.sub

    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    const mealExists = await knex('meals')
      .select('id')
      .where('id', id)
      .andWhere('user_id', userId)
      .first()

    if (!mealExists) {
      return reply.status(404).send()
    }

    await knex('meals').where('id', id).delete()

    return reply.status(204).send()
  })

  app.put('/:id', async (request, reply) => {
    const userId = request.user.sign.sub

    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = updateMealParamsSchema.parse(request.params)

    const { name, description, date, existsOnDiet } = mealBodySchema.parse(
      request.body,
    )

    const mealExists = await knex('meals')
      .select('id')
      .where('id', id)
      .andWhere('user_id', userId)
      .first()

    if (!mealExists) {
      return reply.status(404).send()
    }

    await knex('meals')
      .update({
        name,
        description,
        date,
        exists_on_diet: existsOnDiet,
        updated_at: new Date().toISOString(),
      })
      .where('id', id)

    return reply.status(204).send()
  })

  app.get('/statistics', async (request, reply) => {
    const userId = request.user.sign.sub

    const totalMealsOnDiet = await knex('meals')
      .where({ user_id: userId, exists_on_diet: true })
      .count('id', { as: 'total' })
      .first()

    const totalMealsOffDiet = await knex('meals')
      .where({ user_id: userId, exists_on_diet: false })
      .count('id', { as: 'total' })
      .first()

    const totalMeals = await knex('meals')
      .where({ user_id: userId })
      .orderBy('date', 'desc')

    const { bestOnDietSequence } = totalMeals.reduce(
      (acc, meal) => {
        if (meal.exists_on_diet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestOnDietSequence) {
          acc.bestOnDietSequence = acc.currentSequence
        }

        return acc
      },
      { bestOnDietSequence: 0, currentSequence: 0 },
    )

    return reply.send({
      totalMeals: totalMeals.length,
      totalMealsOnDiet: totalMealsOnDiet?.total,
      totalMealsOffDiet: totalMealsOffDiet?.total,
      bestOnDietSequence,
    })
  })
}
