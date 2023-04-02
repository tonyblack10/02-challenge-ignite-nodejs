import { randomUUID } from 'node:crypto'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { knex } from '../database'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const createUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  })

  const { name, email, password } = createUserBodySchema.parse(request.body)
  const password_hash = await hash(password, 6)

  await knex('users').insert({
    id: randomUUID(),
    name,
    email,
    password_hash,
  })

  return reply.status(201).send()
}
