import fastify from 'fastify'
import { register } from './routes/register'

export const app = fastify()

app.post('/register', register)
