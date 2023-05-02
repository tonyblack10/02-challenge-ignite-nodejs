import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify'
import { z } from 'zod'
import { compare } from 'bcryptjs'
import { knex } from '../database'

export async function authenticateRoutes(app: FastifyInstance) {
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const authenticationBodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })

    const { email, password } = authenticationBodySchema.parse(request.body)

    const user = await knex('users')
      .select('id', 'password_hash')
      .where('email', email)
      .first()

    if (!user) {
      return reply.status(400).send({ message: 'Authentication Error' })
    }

    const passwordMatches = await compare(password, user.password_hash)

    if (!passwordMatches) {
      return reply.status(400).send({ message: 'Authentication Error' })
    }

    try {
      const token = await reply.jwtSign({
        sign: {
          sub: user.id,
        },
      })

      return reply.status(200).send({ token })
    } catch (err) {
      return reply.status(400).send({ message: 'Authentication Error' })
    }
  })
}
