"use strict";

const axios = use('axios');
const TIPO_VEICULO = 1;

class FipeService {

  static async buscarTabelaReferencia() {
    const responseFipe = await axios.post('https://veiculos.fipe.org.br/api/veiculos/ConsultarTabelaDeReferencia');
    return responseFipe.data;
  }

  static async buscarMarcas(codigoTabelaReferencia) {
    const responseFipe = await axios.post('https://veiculos.fipe.org.br/api/veiculos/ConsultarMarcas', {
      codigoTabelaReferencia, codigoTipoVeiculo: TIPO_VEICULO
    });

    return responseFipe.data;
  }

  static async buscarModelos(codigoTabelaReferencia, codigoMarca) {
    const responseFipe = await axios.post('https://veiculos.fipe.org.br/api/veiculos/ConsultarModelos', {
      codigoTabelaReferencia, codigoMarca, codigoTipoVeiculo: TIPO_VEICULO
    });

    return responseFipe.data.Modelos;
  }

  static async buscarAnoModelo(codigoTabelaReferencia, codigoMarca, codigoModelo) {
    const responseFipe = await axios.post('https://veiculos.fipe.org.br/api/veiculos/ConsultarAnoModelo', {
      codigoTabelaReferencia, codigoMarca, codigoModelo, codigoTipoVeiculo: TIPO_VEICULO
    });

    return responseFipe.data;
  }

  static async buscarComTodosParametros(codigoTabelaReferencia, codigoMarca, codigoModelo, anoModelo) {
    const dataAnoModelo = anoModelo.split('-');

    const responseFipe = await axios.post('https://veiculos.fipe.org.br/api/veiculos/ConsultarValorComTodosParametros', {
      codigoTabelaReferencia, codigoMarca, codigoModelo, codigoTipoVeiculo: TIPO_VEICULO, anoModelo: dataAnoModelo[0],
      codigoTipoCombustivel: dataAnoModelo[1], tipoConsulta: 'tradicional'
    });

    return responseFipe.data;
  }

}

module.exports = FipeService;
