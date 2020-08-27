'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ModeloSchema extends Schema {
  up() {
    this.create('modelos', (table) => {
      table.increments()
      table.integer('marca_id')
        .unsigned()
        .references('id')
        .inTable('marcas')
        .notNullable()
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table.string('nome').notNullable()
      table.string('fipe_id').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('modelos')
  }
}

module.exports = ModeloSchema
