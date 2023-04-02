import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      existsOnDiet: z.boolean(),
    })

    const { name, description, date, existsOnDiet } =
      createMealBodySchema.parse(request.body)

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date,
      exists_on_diet: existsOnDiet,
    })

    return reply.status(201).send()
  })

  app.get('/', async (_, reply) => {
    const meals = await knex('meals').select(
      'id',
      'name',
      'description',
      'exists_on_diet',
      'date',
      'created_at',
      'updated_at',
    )

    return reply.send(meals)
  })

  app.get('/:id', async (request, reply) => {
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
      .first()

    if (!meal) {
      return reply.status(404).send()
    }

    return reply.send(meal)
  })

  app.delete('/:id', async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    const mealExists = await knex('meals').select('id').where('id', id).first()

    if (!mealExists) {
      return reply.status(404).send()
    }

    await knex('meals').where('id', id).delete()

    return reply.status(204).send()
  })
}
