import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists('meals', (table) => {
    table.uuid('id').primary()
    table.string('name', 200).notNullable()
    table.text('description').notNullable()
    table.timestamp('date').notNullable()
    table.boolean('exists_on_diet').notNullable()
    table.uuid('user_id').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()

    table.foreign('user_id', 'fk_user').references('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.dropForeign('user_id', 'fk_user')
  })
  await knex.schema.dropTableIfExists('meals')
}
