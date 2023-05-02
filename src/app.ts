import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'

import { register } from './routes/register'
import { mealsRoutes } from './routes/meals'
import { authenticateRoutes } from './routes/authenticate'
import { env } from './env'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '10m',
  },
})

app.register(authenticateRoutes, { prefix: '/authenticate' })
app.register(mealsRoutes, { prefix: '/meals' })
app.post('/register', register)
