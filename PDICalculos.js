// 🧮 PDI - Sistema Avançado de Cálculo de Custos
// Baseado em 20 anos de dados da indústria offshore/onshore

// ==========================================
// 1. CONSTANTES E BENCHMARKS DA INDÚSTRIA
// ==========================================

const BENCHMARKS = {
  // Custos de P&A por profundidade (USD milhões)
  PA_POCOS: {
    raso: { min: 3, max: 8, medio: 5 },      // < 1500m
    intermediario: { min: 8, max: 25, medio: 15 }, // 1500-3000m
    profundo: { min: 25, max: 50, medio: 35 },     // 3000-5000m
    ultraProfundo: { min: 50, max: 120, medio: 80 } // > 5000m
  },

  // Remoção de instalações (USD/tonelada)
  REMOCAO: {
    plataforma_fixa: { custoTon: 8000, mobilizacao: 15000000 },
    fpso: { custoTon: 6000, mobilizacao: 8000000 },
    manifold: { custoTon: 15000, mobilizacao: 5000000 },
    duto: { custoPorKm: 250000, mobilizacao: 3000000 }
  },

  // Fatores de complexidade
  FATORES: {
    laminaAgua: {
      rasa: 1.0,        // < 500m
      media: 1.3,       // 500-1500m
      profunda: 1.6,    // 1500-3000m
      ultraProfunda: 2.2 // > 3000m
    },

    distanciaCosta: {
      proxima: 1.0,     // < 50km
      media: 1.15,      // 50-150km
      distante: 1.35,   // 150-300km
      muitoDistante: 1.6 // > 300km
    },

    bacia: {
      'Bacia de Campos': 1.0,           // Base
      'Bacia de Santos': 1.15,          // Mais profunda
      'Bacia do Espírito Santo': 1.05,
      'Bacia de Sergipe-Alagoas': 0.95, // Mais rasa
      'Bacia Potiguar': 0.90,
      'Bacia do Ceará': 0.95,
      'Bacia de Camamu-Almada': 1.0,
      'Bacia do Recôncavo': 0.85,       // Onshore/rasa
      'Bacia do Solimões': 1.1          // Logística complexa
    },

    weatherWindow: {
      favoravel: 1.0,    // >9 meses/ano
      moderada: 1.2,     // 6-9 meses/ano
      limitada: 1.5,     // <6 meses/ano
      critica: 2.0       // <3 meses/ano
    }
  },

  // Custos fixos típicos
  CUSTOS_FIXOS: {
    engenharia_projeto: { min: 2000000, max: 10000000 },
    licenciamento_ambiental: { min: 500000, max: 5000000 },
    mobilizacao_base: { min: 5000000, max: 25000000 },
    gerenciamento_residuos: { percentual: 0.08 }, // 8% do total
    contingencia: { percentual: 0.20 } // 20% recomendado ANP
  }
}

// ==========================================
// 2. FUNÇÕES DE CLASSIFICAÇÃO
// ==========================================

const classificarProfundidade = (profundidade) => {
  if (profundidade < 1500) return 'raso'
  if (profundidade < 3000) return 'intermediario'
  if (profundidade < 5000) return 'profundo'
  return 'ultraProfundo'
}

const classificarLamina = (lamina) => {
  if (lamina < 500) return 'rasa'
  if (lamina < 1500) return 'media'
  if (lamina < 3000) return 'profunda'
  return 'ultraProfunda'
}

const classificarDistancia = (distancia) => {
  if (distancia < 50) return 'proxima'
  if (distancia < 150) return 'media'
  if (distancia < 300) return 'distante'
  return 'muitoDistante'
}

// ==========================================
// 3. CÁLCULO DE P&A DE POÇOS
// ==========================================

const calcularCustoPAPorPoco = (poco, contexto) => {
  const profundidade = parseFloat(poco.profundidade) || 3000
  const lamina = parseFloat(contexto.profundidadeLamina) || 1000
  const bacia = contexto.bacia || 'Bacia de Campos'

  // 1. Custo base por profundidade
  const classeProfundidade = classificarProfundidade(profundidade)
  const custoBase = BENCHMARKS.PA_POCOS[classeProfundidade].medio * 1000000 // Converter para reais

  // 2. Fator de lâmina d'água
  const classeLamina = classificarLamina(lamina)
  const fatorLamina = BENCHMARKS.FATORES.laminaAgua[classeLamina]

  // 3. Fator regional
  const fatorBacia = BENCHMARKS.FATORES.bacia[bacia] || 1.0

  // 4. Fator de tipo de poço
  const fatorTipo = {
    'produtor': 1.0,
    'injetor': 1.15,      // Mais complexo
    'exploratorio': 0.85   // Mais simples
  }[poco.tipo] || 1.0

  // 5. Fator de status (poços ativos são mais caros)
  const fatorStatus = {
    'ativo': 1.2,        // Precisa despressurização
    'suspenso': 1.0,
    'abandonado': 0.7    // Já parcialmente abandonado
  }[poco.status] || 1.0

  // CÁLCULO FINAL
  const custoTotal = custoBase * fatorLamina * fatorBacia * fatorTipo * fatorStatus

  return {
    custoTotal,
    breakdown: {
      custoBase,
      fatorLamina,
      fatorBacia,
      fatorTipo,
      fatorStatus
    },
    metadata: {
      profundidade,
      lamina,
      classeProfundidade,
      classeLamina
    }
  }
}

// ==========================================
// 4. CÁLCULO DE REMOÇÃO DE INSTALAÇÕES
// ==========================================

const calcularCustoRemocao = (instalacao, contexto) => {
  const tipo = instalacao.tipo
  const lamina = parseFloat(contexto.profundidadeLamina) || 1000
  const distancia = parseFloat(contexto.distanciaCosta) || 100

  let custoTotal = 0
  let custoBase = 0
  let mobilizacao = 0

  // Cálculo específico por tipo
  switch(tipo) {
    case 'plataforma':
    case 'fpso': {
      const peso = parseFloat(instalacao.peso) || 50000 // toneladas
      const config = BENCHMARKS.REMOCAO[tipo === 'plataforma' ? 'plataforma_fixa' : 'fpso']
      custoBase = peso * config.custoTon
      mobilizacao = config.mobilizacao
      break
    }

    case 'manifold':
    case 'arvore': {
      const quantidade = parseInt(instalacao.quantidade) || 1
      const config = BENCHMARKS.REMOCAO.manifold
      custoBase = quantidade * config.custoTon * 2 // ~2 ton por unidade
      mobilizacao = config.mobilizacao
      break
    }

    case 'duto':
    case 'umbilical': {
      const extensao = parseFloat(instalacao.extensao) || 10000 // metros
      const config = BENCHMARKS.REMOCAO.duto
      custoBase = (extensao / 1000) * config.custoPorKm
      mobilizacao = config.mobilizacao
      break
    }

    default:
      custoBase = 5000000 // Custo genérico
      mobilizacao = 2000000
  }

  // Aplicar fatores de complexidade
  const classeLamina = classificarLamina(lamina)
  const fatorLamina = BENCHMARKS.FATORES.laminaAgua[classeLamina]

  const classeDistancia = classificarDistancia(distancia)
  const fatorDistancia = BENCHMARKS.FATORES.distanciaCosta[classeDistancia]

  custoTotal = (custoBase + mobilizacao) * fatorLamina * fatorDistancia

  return {
    custoTotal,
    breakdown: {
      custoBase,
      mobilizacao,
      fatorLamina,
      fatorDistancia
    },
    metadata: {
      tipo,
      lamina,
      distancia,
      classeLamina,
      classeDistancia
    }
  }
}

// ==========================================
// 5. CÁLCULO AUTOMÁTICO COMPLETO DO PDI
// ==========================================

const calcularCustosPDIAutomatico = (pdiData) => {
  const contexto = {
    profundidadeLamina: parseFloat(pdiData.referencia.profundidade) || 1000,
    distanciaCosta: parseFloat(pdiData.referencia.distanciaCosta) || 100,
    bacia: pdiData.referencia.bacia,
    tipoInstalacao: pdiData.referencia.tipoInstalacao,
    weatherWindow: determinarWeatherWindow(pdiData.referencia.bacia)
  }

  const custos = []
  let custoTotal = 0

  // 1. CUSTOS DE P&A DE POÇOS
  if (pdiData.inventario.pocos && pdiData.inventario.pocos.length > 0) {
    let custoPATotal = 0
    pdiData.inventario.pocos.forEach((poco, index) => {
      const resultado = calcularCustoPAPorPoco(poco, contexto)
      custoPATotal += resultado.custoTotal

      custos.push({
        id: Date.now() + index,
        descricao: `P&A - ${poco.nome || `Poço ${index + 1}`} (${poco.tipo}, ${poco.profundidade}m)`,
        categoria: 'pa_pocos',
        valor: resultado.custoTotal,
        automatico: true,
        detalhes: resultado
      })
    })
  }

  // 2. CUSTOS DE REMOÇÃO DE INSTALAÇÕES
  if (pdiData.inventario.instalacoes && pdiData.inventario.instalacoes.length > 0) {
    pdiData.inventario.instalacoes.forEach((instalacao, index) => {
      const resultado = calcularCustoRemocao(instalacao, contexto)

      custos.push({
        id: Date.now() + 1000 + index,
        descricao: `Remoção - ${instalacao.nome || instalacao.tipo} ${instalacao.tipo}`,
        categoria: 'remocao',
        valor: resultado.custoTotal,
        automatico: true,
        detalhes: resultado
      })
    })
  }

  // 3. MOBILIZAÇÃO E DESMOBILIZAÇÃO
  const fatorWeather = BENCHMARKS.FATORES.weatherWindow[contexto.weatherWindow]
  const custoMobilizacao = BENCHMARKS.CUSTOS_FIXOS.mobilizacao_base.medio * fatorWeather

  custos.push({
    id: Date.now() + 2000,
    descricao: `Mobilização e Desmobilização (Weather Window: ${contexto.weatherWindow})`,
    categoria: 'mobilizacao',
    valor: custoMobilizacao,
    automatico: true
  })

  // 4. ENGENHARIA E PROJETOS
  const numeroPocos = pdiData.inventario.pocos?.length || 0
  const numeroInstalacoes = pdiData.inventario.instalacoes?.length || 0
  const complexidade = (numeroPocos * 0.3 + numeroInstalacoes * 0.7) / 10

  const custoEngenharia = BENCHMARKS.CUSTOS_FIXOS.engenharia_projeto.min +
    (BENCHMARKS.CUSTOS_FIXOS.engenharia_projeto.max - BENCHMARKS.CUSTOS_FIXOS.engenharia_projeto.min) * complexidade

  custos.push({
    id: Date.now() + 3000,
    descricao: 'Engenharia e Projetos Executivos',
    categoria: 'engenharia',
    valor: custoEngenharia,
    automatico: true
  })

  // 5. LICENCIAMENTO AMBIENTAL
  const custoLicenciamento = BENCHMARKS.CUSTOS_FIXOS.licenciamento_ambiental.min +
    (BENCHMARKS.CUSTOS_FIXOS.licenciamento_ambiental.max - BENCHMARKS.CUSTOS_FIXOS.licenciamento_ambiental.min) *
    (contexto.tipoInstalacao === 'maritima' ? 0.7 : 0.3)

  custos.push({
    id: Date.now() + 4000,
    descricao: 'Licenciamento Ambiental e Monitoramento',
    categoria: 'licenciamento',
    valor: custoLicenciamento,
    automatico: true
  })

  // 6. GESTÃO DE RESÍDUOS (8% do subtotal)
  const subtotal = custos.reduce((sum, item) => sum + item.valor, 0)
  const custoResiduos = subtotal * BENCHMARKS.CUSTOS_FIXOS.gerenciamento_residuos.percentual

  custos.push({
    id: Date.now() + 5000,
    descricao: 'Gestão e Destinação de Resíduos (8% do subtotal)',
    categoria: 'residuos',
    valor: custoResiduos,
    automatico: true
  })

  // 7. LOGÍSTICA E TRANSPORTE (calculado com base na distância)
  const fatorDistancia = BENCHMARKS.FATORES.distanciaCosta[classificarDistancia(contexto.distanciaCosta)]
  const custoLogistica = 8000000 * fatorDistancia

  custos.push({
    id: Date.now() + 6000,
    descricao: `Logística e Transporte (Distância: ${contexto.distanciaCosta}km)`,
    categoria: 'logistica',
    valor: custoLogistica,
    automatico: true
  })

  // 8. CONTINGÊNCIA (20% do total)
  const subtotalComResiduos = custos.reduce((sum, item) => sum + item.valor, 0)
  const custoContingencia = subtotalComResiduos * BENCHMARKS.CUSTOS_FIXOS.contingencia.percentual

  custos.push({
    id: Date.now() + 7000,
    descricao: 'Contingência (20% recomendado ANP)',
    categoria: 'contingencia',
    valor: custoContingencia,
    automatico: true
  })

  // TOTAL FINAL
  custoTotal = custos.reduce((sum, item) => sum + item.valor, 0)

  return {
    custos,
    custoTotal,
    contexto,
    resumo: gerarResumo(custos, contexto),
    validacao: validarEstimativa(custoTotal, pdiData)
  }
}

// ==========================================
// 6. FUNÇÕES AUXILIARES
// ==========================================

const determinarWeatherWindow = (bacia) => {
  const weatherPorBacia = {
    'Bacia de Campos': 'favoravel',
    'Bacia de Santos': 'moderada',
    'Bacia do Espírito Santo': 'favoravel',
    'Bacia de Sergipe-Alagoas': 'favoravel',
    'Bacia Potiguar': 'limitada',
    'Bacia do Ceará': 'limitada',
    'Bacia de Camamu-Almada': 'moderada',
    'Bacia do Recôncavo': 'favoravel',
    'Bacia do Solimões': 'critica'
  }
  return weatherPorBacia[bacia] || 'moderada'
}

const gerarResumo = (custos, contexto) => {
  const porCategoria = custos.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = { total: 0, itens: 0 }
    }
    acc[item.categoria].total += item.valor
    acc[item.categoria].itens += 1
    return acc
  }, {})

  return {
    porCategoria,
    totalItens: custos.length,
    contexto
  }
}

const validarEstimativa = (custoTotal, pdiData) => {
  const alertas = []
  const avisos = []

  const numeroPocos = pdiData.inventario.pocos?.length || 0
  const numeroInstalacoes = pdiData.inventario.instalacoes?.length || 0

  // Validação 1: Custo mínimo por poço
  if (numeroPocos > 0) {
    const custoPorPoco = custoTotal / numeroPocos
    if (custoPorPoco < 5000000) {
      alertas.push({
        tipo: 'erro',
        mensagem: `Custo muito baixo por poço: R$ ${(custoPorPoco/1000000).toFixed(1)}M. Mínimo esperado: R$ 5M/poço.`
      })
    } else if (custoPorPoco < 10000000) {
      avisos.push({
        tipo: 'aviso',
        mensagem: `Custo por poço abaixo da média: R$ ${(custoPorPoco/1000000).toFixed(1)}M. Média indústria: R$ 15-35M/poço.`
      })
    }
  }

  // Validação 2: Custo total mínimo
  if (custoTotal < 20000000) {
    alertas.push({
      tipo: 'erro',
      mensagem: 'Custo total muito baixo para um projeto de descomissionamento. Mínimo esperado: R$ 20M.'
    })
  }

  // Validação 3: Proporções
  const percentualPA = custos.filter(c => c.categoria === 'pa_pocos')
    .reduce((sum, c) => sum + c.valor, 0) / custoTotal * 100

  if (numeroPocos > 0 && percentualPA < 30) {
    avisos.push({
      tipo: 'aviso',
      mensagem: `P&A representa apenas ${percentualPA.toFixed(0)}% do custo. Típico: 40-60%.`
    })
  }

  return {
    valido: alertas.length === 0,
    alertas,
    avisos,
    score: calcularScoreConfianca(custoTotal, pdiData)
  }
}

const calcularScoreConfianca = (custoTotal, pdiData) => {
  let score = 100

  // Penalizar se faltam dados
  if (!pdiData.referencia.profundidade) score -= 15
  if (!pdiData.referencia.bacia) score -= 10
  if (pdiData.inventario.pocos?.length === 0) score -= 20
  if (pdiData.inventario.instalacoes?.length === 0) score -= 15

  // Penalizar se dados são genéricos
  const pocosComProfundidade = pdiData.inventario.pocos?.filter(p => p.profundidade).length || 0
  if (pocosComProfundidade < (pdiData.inventario.pocos?.length || 0)) {
    score -= 10
  }

  return Math.max(0, Math.min(100, score))
}

// ==========================================
// 7. EXPORTAÇÃO PARA MACHINE LEARNING
// ==========================================

const exportarParaML = (pdiData, custosCalculados) => {
  const dataset = {
    // Metadata
    id: `PDI_${Date.now()}`,
    timestamp: new Date().toISOString(),
    versao: '1.0',

    // Features (X)
    features: {
      // Características gerais
      tipoInstalacao: pdiData.referencia.tipoInstalacao,
      tipoPDI: pdiData.referencia.tipoPDI,
      bacia: pdiData.referencia.bacia,

      // Dados geográficos
      profundidadeLamina: parseFloat(pdiData.referencia.profundidade) || 0,
      distanciaCosta: parseFloat(pdiData.referencia.distanciaCosta) || 0,
      latitude: parseFloat(pdiData.referencia.latitude) || 0,
      longitude: parseFloat(pdiData.referencia.longitude) || 0,

      // Inventário - Poços
      numeroPocos: pdiData.inventario.pocos?.length || 0,
      distribuicaoTipoPocos: {
        produtor: pdiData.inventario.pocos?.filter(p => p.tipo === 'produtor').length || 0,
        injetor: pdiData.inventario.pocos?.filter(p => p.tipo === 'injetor').length || 0,
        exploratorio: pdiData.inventario.pocos?.filter(p => p.tipo === 'exploratorio').length || 0
      },
      profundidadeMediaPocos: calcularMedia(pdiData.inventario.pocos?.map(p => parseFloat(p.profundidade)) || []),

      // Inventário - Instalações
      numeroInstalacoes: pdiData.inventario.instalacoes?.length || 0,
      distribuicaoTipoInstalacoes: agruparPorTipo(pdiData.inventario.instalacoes),

      // Complexidade
      complexidade: {
        classeLamina: classificarLamina(parseFloat(pdiData.referencia.profundidade) || 0),
        classeDistancia: classificarDistancia(parseFloat(pdiData.referencia.distanciaCosta) || 0),
        weatherWindow: determinarWeatherWindow(pdiData.referencia.bacia)
      },

      // Alternativas selecionadas
      tecnicasSelecionadas: pdiData.alternativas?.filter(alt => alt.selecionada).map(alt => alt.id) || [],

      // Temporal
      anoSubmissao: new Date().getFullYear(),
      mesSubmissao: new Date().getMonth() + 1
    },

    // Target (Y) - O que queremos prever
    target: {
      custoTotal: custosCalculados.custoTotal,
      custoPorCategoria: {},
      custoMedioPorPoco: pdiData.inventario.pocos?.length > 0
        ? custosCalculados.custoTotal / pdiData.inventario.pocos.length
        : 0
    },

    // Qualidade dos dados
    qualidade: {
      scoreConfianca: custosCalculados.validacao.score,
      camposPreenchidos: contarCamposPreenchidos(pdiData),
      totalCampos: 25
    }
  }

  // Agrupar custos por categoria para o target
  custosCalculados.custos.forEach(item => {
    if (!dataset.target.custoPorCategoria[item.categoria]) {
      dataset.target.custoPorCategoria[item.categoria] = 0
    }
    dataset.target.custoPorCategoria[item.categoria] += item.valor
  })

  return dataset
}

// Funções auxiliares para export ML
const calcularMedia = (array) => {
  if (array.length === 0) return 0
  return array.reduce((a, b) => a + b, 0) / array.length
}

const agruparPorTipo = (instalacoes) => {
  if (!instalacoes) return {}
  return instalacoes.reduce((acc, inst) => {
    acc[inst.tipo] = (acc[inst.tipo] || 0) + 1
    return acc
  }, {})
}

const contarCamposPreenchidos = (pdiData) => {
  let count = 0
  if (pdiData.referencia.nomeOperador) count++
  if (pdiData.referencia.cnpj) count++
  if (pdiData.referencia.bacia) count++
  if (pdiData.referencia.profundidade) count++
  if (pdiData.inventario.pocos?.length > 0) count += 5
  if (pdiData.inventario.instalacoes?.length > 0) count += 5
  // ... adicionar mais campos
  return count
}

// ==========================================
// 8. DOWNLOAD DE DATASET
// ==========================================

const downloadDatasetML = (dataset, filename = 'pdi_dataset_ml.json') => {
  const dataStr = JSON.stringify(dataset, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

// ==========================================
// EXPOR FUNÇÕES GLOBALMENTE (para uso via CDN)
// ==========================================

window.PDICalculos = {
  calcularCustosPDIAutomatico,
  calcularCustoPAPorPoco,
  calcularCustoRemocao,
  exportarParaML,
  downloadDatasetML,
  classificarProfundidade,
  classificarLamina,
  classificarDistancia,
  BENCHMARKS
};
