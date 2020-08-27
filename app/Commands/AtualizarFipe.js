'use strict'

const {Command} = require('@adonisjs/ace')
const Database = use('Database')
const FipeService = use('App/Services/FipeService')
const ObjReferencia = use('App/Models/Referencia')
const ObjMarca = use('App/Models/Marca')
const ObjModelo = use('App/Models/Modelo')
const ObjAnoModelo = use('App/Models/AnoModelo')

class AtualizarFipe extends Command {
  static get signature() {
    return 'fipe:atualizar'
  }

  static get description() {
    return 'Atualizar os registros da fipe.'
  }

  async handle(args, options) {
    let novasReferencias = 0;
    let novasMarcas = 0;
    let novosModelos = 0;
    let precosAtualizados = 0;
    let precosIncluidos = 0;

    this.info('Buscando tabela referência...');
    const referencias = await FipeService.buscarTabelaReferencia();
    this.success('A buscar retornou (' + referencias.length + ') registros.');

    this.info('Atualizando registros na tabela...');
    for (const referencia of referencias) {
      let bancoReferencia = await Database.table('referencias').where('fipe_id', referencia.Codigo).first();
      if (!bancoReferencia) {
        novasReferencias++;
        this.warn('Nova referencia incluida: ' + referencia.Mes);
        await ObjReferencia.create({fipe_id: referencia.Codigo, mes_ano: referencia.Mes});
      }
    }
    this.success(`${this.icon('success')} Inclusão tabela referencia concluída.`);

    this.info(`Buscando marcas...`);
    const marcas = await FipeService.buscarMarcas(referencias[0].Codigo);
    this.success('A buscar retornou (' + marcas.length + ') registros.');

    this.info('Atualizando registros na tabela...');
    for (const marca of marcas) {
      let bancoMarca = await Database.table('marcas').where('fipe_id', marca.Value).first();
      if (!bancoMarca) {
        novasMarcas++;
        this.warn('Nova marca incluida: ' + marca.Label);
        await ObjMarca.create({nome: marca.Label, fipe_id: marca.Value});
      }
    }
    this.success(`${this.icon('success')} Inclusão tabela marcas concluída.`);

    this.info(`Buscando e atualizando modelos...`);
    this.success(`Buscando e atualizando modelos, referencia: ${referencias[0].Mes}.`);
    let bancoMarcas = await Database.table('marcas')

    for (const marca of bancoMarcas) {
      this.info(`Buscando e atualizando modelos, marca: ${marca.nome}.`);
      const modelos = await FipeService.buscarModelos(referencias[0].Codigo, marca.fipe_id)

      for (const modelo of modelos) {
        let bancoModelo = await Database.table('modelos').where('fipe_id', modelo.Value).first();
        if (!bancoModelo) {
          novosModelos++;
          this.warn('Novo modelo incluido: ' + modelo.Label);
          await ObjModelo.create({nome: modelo.Label, fipe_id: modelo.Value, marca_id: marca.id})
        }
      }
    }
    this.success(`${this.icon('success')} Atualização tabela modelos concluída.`);

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
              console.log('timout 10m');
              await new Promise((resolve) => setTimeout(resolve, (1000 * 60) * 10))
            }

            let todosParametros = await FipeService.buscarComTodosParametros(referencias[0].Codigo, marca.fipe_id, modelo.fipe_id, anoModelo.Value)
            let bancoAnoModelo = await Database.table('ano_modelos')
              .where('modelo_id', modelo.id)
              .where('ano', todosParametros.AnoModelo)
              .where('codigo_fipe', todosParametros.CodigoFipe)
              .where('fipe_id', anoModelo.Value)
              .first();

            if (!bancoAnoModelo) {
              precosIncluidos++;
              await ObjAnoModelo.create({
                modelo_id: modelo.id,
                fipe_id: anoModelo.Value,
                fipe_nome: anoModelo.Label,
                valor: parseFloat(todosParametros.Valor.replace('R$ ', '').replace('.', '').replace(',', '.')),
                codigo_fipe: todosParametros.CodigoFipe,
                referencia: todosParametros.MesReferencia,
                ano: todosParametros.AnoModelo
              });
            } else {
              precosAtualizados++;
              let updateBancoModelo = await bancoAnoModelo.findOrFail(bancoAnoModelo.id);
              updateBancoModelo.merge({
                valor: parseFloat(todosParametros.Valor.replace('R$ ', '').replace('.', '').replace(',', '.')),
                referencia: todosParametros.MesReferencia,
              });
              await updateBancoModelo.save();
            }
          }
        }

      }
    }

    this.info(`Resultado final: novas referêcias(${novasReferencias}), novas marcas(${novasMarcas}), novos modelos(${novosModelos}), preços atualizados(${precosAtualizados}) e preços incluidos(${precosIncluidos})`)
    this.success(`${this.icon('success')} Inclusão tabela ano modelos concluída.`);
    Database.close()
  }
}

module.exports = AtualizarFipe
