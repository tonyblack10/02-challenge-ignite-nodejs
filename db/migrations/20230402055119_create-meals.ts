import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists('meals', (table) => {
    table.uuid('id').primary()
    table.string('name', 200).notNullable()
    table.text('description').notNullable()
    table.timestamp('date').notNullable()
    table.boolean('exists_on_diet').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('meals')
}
