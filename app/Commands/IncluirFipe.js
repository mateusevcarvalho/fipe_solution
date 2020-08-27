'use strict'

const {Command} = require('@adonisjs/ace')
const Database = use('Database')
const FipeService = use('App/Services/FipeService')
const ObjReferencia = use('App/Models/Referencia')
const ObjMarca = use('App/Models/Marca')
const ObjModelo = use('App/Models/Modelo')
const ObjAnoModelo = use('App/Models/AnoModelo')

class IncluirFipe extends Command {
  static get signature() {
    return 'fipe:incluir'
  }

  static get description() {
    return 'Incuir os registros da fipe do zero.'
  }

  async handle(args, options) {
    this.info('Buscando tabela referência...');
    const referencias = await FipeService.buscarTabelaReferencia();
    this.success('A buscar retornou (' + referencias.length + ') registros.');

    this.info('Incluindo registros na tabela...');
    for (const referencia of referencias) {
      await ObjReferencia.create({fipe_id: referencia.Codigo, mes_ano: referencia.Mes});
    }
    this.success(`${this.icon('success')} Inclusão tabela referencia concluída.`);

    this.info(`Buscando marcas...`);
    const marcas = await FipeService.buscarMarcas(referencias[0].Codigo);
    this.success('A buscar retornou (' + marcas.length + ') registros.');

    this.info('Incluindo registros na tabela...');
    for (const marca of marcas) {
      await ObjMarca.create({nome: marca.Label, fipe_id: marca.Value});
    }
    this.success(`${this.icon('success')} Inclusão tabela marcas concluída.`);

    this.info(`Buscando e incluindo modelos...`);
    this.success(`Buscando e incluindo modelos, referencia: ${referencias[0].Mes}.`);
    let bancoMarcas = await Database.table('marcas')

    for (const marca of bancoMarcas) {
      this.info(`Buscando e incluindo modelos, marca: ${marca.nome}.`);
      const modelos = await FipeService.buscarModelos(referencias[0].Codigo, marca.fipe_id)

      for (const modelo of modelos) {
        await ObjModelo.create({nome: modelo.Label, fipe_id: modelo.Value, marca_id: marca.id})
      }
    }
    this.success(`${this.icon('success')} Inclusão tabela modelos concluída.`);

    this.info(`Buscando ano modelos e valores completos...`);

    let index = 0;
    for (const marca of bancoMarcas) {
      let bancoModelos = await Database.table('modelos').where('marca_id', marca.id)

      for (const modelo of bancoModelos) {
        //console.log('timout 3s')
        //await new Promise((resolve) => setTimeout(resolve, 3000))
        let anoModelos = await FipeService.buscarAnoModelo(referencias[0].Codigo, marca.fipe_id, modelo.fipe_id)
        this.info(`Incluindo valores modelo: ${modelo.nome}, da marca: ${marca.nome}.`);
        this.warn(JSON.stringify(anoModelos))

        if (Array.isArray(anoModelos)) {
          for (const anoModelo of anoModelos) {
            index++;
            if (index % 1000 === 0) {
              console.log('timout 10m')
              await new Promise((resolve) => setTimeout(resolve, (1000 * 60) * 10))
            }

            let todosParametros = await FipeService.buscarComTodosParametros(referencias[0].Codigo, marca.fipe_id, modelo.fipe_id, anoModelo.Value)

            await ObjAnoModelo.create({
              modelo_id: modelo.id,
              fipe_id: anoModelo.Value,
              fipe_nome: anoModelo.Label,
              valor: parseFloat(todosParametros.Valor.replace('R$ ', '').replace('.', '').replace(',', '.')),
              codigo_fipe: todosParametros.CodigoFipe,
              referencia: todosParametros.MesReferencia,
              ano: todosParametros.AnoModelo
            })
          }
        }

      }
    }

    this.success(`${this.icon('success')} Inclusão tabela ano modelos concluída.`);
    Database.close()
  }
}

module.exports = IncluirFipe
