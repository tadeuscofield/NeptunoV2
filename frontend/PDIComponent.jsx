// Componente PDI - Programa de Descomissionamento de Instalações (ANP 817/2020)
// NEPTUNO - Sistema Profissional de Plano de Desativação
// Versão 2.1 - Seção 9 com cálculo automático (2025-10-09 16:34)

const { useState, useEffect } = React;

function PDIComponent({ darkMode }) {
  const [pdiData, setPdiData] = useState(() => {
    const saved = localStorage.getItem('pdiData')
    return saved ? JSON.parse(saved) : {
      referencia: {
        nomeOperador: '',
        cnpj: '',
        numeroContrato: '',
        tipoPDI: 'conceitual',
        tipoInstalacao: 'maritima',
        bacia: '',
        bloco: '',
        latitude: '',
        longitude: '',
        profundidade: '',
        distanciaCosta: '',
        dataInicio: '',
        dataTermino: '',
        dataSubmissao: new Date().toISOString().split('T')[0]
      },
      motivacoes: {
        tipo: '',
        justificativa: '',
        condicoesAtuais: ''
      },
      inventario: {
        pocos: [],
        instalacoes: []
      },
      alternativas: [],
      projeto: {
        descricao: '',
        infraestrutura: '',
        destino: ''
      },
      procedimentos: [],
      cronograma: [],
      custos: {
        detalhamento: [],
        total: 0
      },
      anexos: {
        licencas: [],
        documentos: []
      }
    }
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [showPDFPreview, setShowPDFPreview] = useState(false)

  // Auto-save
  useEffect(() => {
    localStorage.setItem('pdiData', JSON.stringify(pdiData))
  }, [pdiData])

  // Opções baseadas em expertise
  const bacias = [
    'Bacia de Campos', 'Bacia de Santos', 'Bacia do Espírito Santo',
    'Bacia de Sergipe-Alagoas', 'Bacia Potiguar', 'Bacia do Ceará',
    'Bacia de Camamu-Almada', 'Bacia do Recôncavo', 'Bacia do Solimões'
  ]

  const tiposMotivacao = [
    { value: 'fim_contrato', label: 'Fim do período de concessão/autorização', hint: 'Contrato chegou ao fim do prazo estabelecido' },
    { value: 'fim_producao', label: 'Término da vida produtiva', hint: 'Poços ou campos com produção economicamente inviável' },
    { value: 'decisao_economica', label: 'Decisão econômica/estratégica', hint: 'Redirecionamento de investimentos ou mudança de portfólio' },
    { value: 'abandono_area', label: 'Abandono de área não comercial', hint: 'Área exploratória sem viabilidade comercial' },
    { value: 'outros', label: 'Outros', hint: 'Especificar no campo de justificativa' }
  ]

  const tecnicasDescomissionamento = [
    {
      id: 'remocao_completa',
      nome: 'Remoção Completa',
      descricao: 'Remoção total da estrutura para destinação em terra com reciclagem ou descarte adequado',
      custoBase: 50000000,
      prazo: 24,
      aplicavel: ['Plataformas', 'Manifolds', 'Árvores de natal'],
      impactoAmbiental: 'Baixo (restauração total)',
      riscoOperacional: 'Alto (operações complexas)'
    },
    {
      id: 'rigs_to_reefs',
      nome: 'Rigs-to-Reefs (Recife Artificial)',
      descricao: 'Conversão parcial da estrutura em recife artificial, mantendo estruturas não flutuantes',
      custoBase: 15000000,
      prazo: 12,
      aplicavel: ['Plataformas fixas', 'Jaquetas'],
      impactoAmbiental: 'Positivo (habitat marinho)',
      riscoOperacional: 'Médio (requer licenciamento especial)'
    },
    {
      id: 'abandono_in_situ',
      nome: 'Abandono In-Situ',
      descricao: 'Abandono da estrutura no local com proteção, limpeza e monitoramento contínuo',
      custoBase: 8000000,
      prazo: 6,
      aplicavel: ['Dutos enterrados', 'Cabos submarinos', 'Estruturas enterradas'],
      impactoAmbiental: 'Moderado (requer monitoramento)',
      riscoOperacional: 'Baixo (mínima intervenção)'
    },
    {
      id: 'plugueamento_pocos',
      nome: 'Plugueamento e Abandono de Poços (P&A)',
      descricao: 'Isolamento permanente de zonas produtoras com tampões de cimento',
      custoBase: 25000000,
      prazo: 18,
      aplicavel: ['Poços exploratórios', 'Poços produtores', 'Poços injetores'],
      impactoAmbiental: 'Baixo (isolamento efetivo)',
      riscoOperacional: 'Alto (operações de alta complexidade)'
    }
  ]

  const calcularCustoTotal = () => {
    return pdiData.custos.detalhamento.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0)
  }

  const adicionarPoco = () => {
    setPdiData({
      ...pdiData,
      inventario: {
        ...pdiData.inventario,
        pocos: [...pdiData.inventario.pocos, {
          id: Date.now(),
          nome: '',
          tipo: 'produtor',
          profundidade: '',
          status: 'ativo'
        }]
      }
    })
  }

  const adicionarInstalacao = () => {
    setPdiData({
      ...pdiData,
      inventario: {
        ...pdiData.inventario,
        instalacoes: [...pdiData.inventario.instalacoes, {
          id: Date.now(),
          nome: '',
          tipo: 'plataforma',
          descricao: ''
        }]
      }
    })
  }

  const adicionarAlternativa = (tecnica) => {
    const jaExiste = pdiData.alternativas.find(alt => alt.id === tecnica.id)
    if (!jaExiste) {
      setPdiData({
        ...pdiData,
        alternativas: [...pdiData.alternativas, {
          ...tecnica,
          selecionada: false,
          justificativa: ''
        }]
      })
    }
  }

  const adicionarAtividadeCronograma = () => {
    setPdiData({
      ...pdiData,
      cronograma: [...pdiData.cronograma, {
        id: Date.now(),
        atividade: '',
        inicio: '',
        fim: '',
        responsavel: '',
        status: 'planejada'
      }]
    })
  }

  const adicionarItemCusto = () => {
    setPdiData({
      ...pdiData,
      custos: {
        ...pdiData.custos,
        detalhamento: [...pdiData.custos.detalhamento, {
          id: Date.now(),
          descricao: '',
          categoria: 'mobilizacao',
          valor: 0
        }]
      }
    })
  }

  const gerarPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Cabeçalho
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('PROGRAMA DE DESCOMISSIONAMENTO', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Resolução ANP Nº 817/2020', pageWidth / 2, 30, { align: 'center' })

    doc.setTextColor(0, 0, 0)

    let yPos = 50

    // 1. Referência
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('1. REFERÊNCIA', 14, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Operador: ${pdiData.referencia.nomeOperador || 'N/A'}`, 14, yPos)
    yPos += 6
    doc.text(`CNPJ: ${pdiData.referencia.cnpj || 'N/A'}`, 14, yPos)
    yPos += 6
    doc.text(`Tipo de PDI: ${pdiData.referencia.tipoPDI === 'conceitual' ? 'PDI Conceitual (Exploração)' : 'PDI Executivo (Produção)'}`, 14, yPos)
    yPos += 6
    doc.text(`Tipo de Instalação: ${pdiData.referencia.tipoInstalacao === 'maritima' ? 'Marítima (Offshore)' : 'Terrestre (Onshore)'}`, 14, yPos)
    yPos += 6
    doc.text(`Bacia: ${pdiData.referencia.bacia || 'N/A'}`, 14, yPos)
    yPos += 6
    doc.text(`Bloco: ${pdiData.referencia.bloco || 'N/A'}`, 14, yPos)
    yPos += 10

    // 2. Motivações
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('2. MOTIVAÇÕES PARA DESCOMISSIONAMENTO', 14, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const motivacao = tiposMotivacao.find(m => m.value === pdiData.motivacoes.tipo)
    doc.text(`Tipo: ${motivacao?.label || 'N/A'}`, 14, yPos)
    yPos += 6

    if (pdiData.motivacoes.justificativa) {
      const splitJust = doc.splitTextToSize(`Justificativa: ${pdiData.motivacoes.justificativa}`, pageWidth - 28)
      doc.text(splitJust, 14, yPos)
      yPos += splitJust.length * 6
    }
    yPos += 10

    // 3. Inventário
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('3. INVENTÁRIO DE INSTALAÇÕES', 14, yPos)
    yPos += 10

    if (pdiData.inventario.pocos.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [['Poço', 'Tipo', 'Profundidade (m)', 'Status']],
        body: pdiData.inventario.pocos.map(p => [
          p.nome,
          p.tipo === 'produtor' ? 'Produtor' : p.tipo === 'injetor' ? 'Injetor' : 'Exploratório',
          p.profundidade,
          p.status
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      })
      yPos = doc.lastAutoTable.finalY + 10
    }

    // 4. Alternativas
    if (pdiData.alternativas.length > 0) {
      if (yPos > 230) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('4. ALTERNATIVAS DE DESCOMISSIONAMENTO', 14, yPos)
      yPos += 10

      doc.autoTable({
        startY: yPos,
        head: [['Técnica', 'Custo Estimado (R$)', 'Prazo (meses)', 'Selecionada']],
        body: pdiData.alternativas.map(alt => [
          alt.nome,
          alt.custoBase.toLocaleString('pt-BR'),
          alt.prazo,
          alt.selecionada ? 'Sim' : 'Não'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      })
      yPos = doc.lastAutoTable.finalY + 10
    }

    // 7. Cronograma
    if (pdiData.cronograma.length > 0) {
      if (yPos > 230) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('7. CRONOGRAMA', 14, yPos)
      yPos += 10

      doc.autoTable({
        startY: yPos,
        head: [['Atividade', 'Início', 'Término', 'Responsável']],
        body: pdiData.cronograma.map(c => [
          c.atividade,
          c.inicio,
          c.fim,
          c.responsavel
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      })
      yPos = doc.lastAutoTable.finalY + 10
    }

    // 8. Custos
    if (pdiData.custos.detalhamento.length > 0) {
      if (yPos > 230) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('8. ESTIMATIVA DE CUSTOS', 14, yPos)
      yPos += 10

      doc.autoTable({
        startY: yPos,
        head: [['Descrição', 'Categoria', 'Valor (R$)']],
        body: [
          ...pdiData.custos.detalhamento.map(c => [
            c.descricao,
            c.categoria,
            parseFloat(c.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          ]),
          ['', 'TOTAL', calcularCustoTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })]
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        footStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' }
      })
    }

    // Rodapé
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} | Página ${i} de ${pageCount}`, pageWidth / 2, 285, { align: 'center' })
    }

    doc.save(`PDI_${pdiData.referencia.nomeOperador || 'Programa'}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} rounded-xl p-6 text-white shadow-xl`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">📋 Programa de Descomissionamento (PDI)</h2>
            <p className="text-blue-100">Conforme Resolução ANP Nº 817/2020</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <p className="text-sm">Passo {currentStep} de 8</p>
                <div className="w-32 bg-white/30 rounded-full h-2 mt-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${(currentStep / 8) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <button
              onClick={gerarPDF}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Gerar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={`${darkMode ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'} border-l-4 rounded-lg p-4`}>
        <div className="flex">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h3 className={`font-bold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
              Guia Especializado em Descomissionamento
            </h3>
            <p className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              Sistema desenvolvido com 20 anos de experiência em descomissionamento offshore e onshore.
              Inclui biblioteca de técnicas reconhecidas internacionalmente, cálculo automático de custos e
              geração de cronograma Gantt. Salvamento automático ativo.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário Multi-Step */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>

        {/* STEP 1: Referência */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              1. Referência do Projeto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nome do Operador *
                  <span className="text-xs font-normal text-gray-500 ml-2">(Razão social completa)</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.nomeOperador}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, nomeOperador: e.target.value }
                  })}
                  placeholder="Ex: Petrobras S.A."
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  CNPJ *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.cnpj}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, cnpj: e.target.value }
                  })}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Número do Contrato *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.numeroContrato}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, numeroContrato: e.target.value }
                  })}
                  placeholder="Ex: ANP-001/2020"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de PDI *
                </label>
                <select
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.tipoPDI}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, tipoPDI: e.target.value }
                  })}
                >
                  <option value="conceitual">PDI Conceitual (Exploração)</option>
                  <option value="executivo">PDI Executivo (Produção)</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Instalação *
                </label>
                <select
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.tipoInstalacao}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, tipoInstalacao: e.target.value }
                  })}
                >
                  <option value="maritima">Marítima (Offshore)</option>
                  <option value="terrestre">Terrestre (Onshore)</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bacia Sedimentar *
                </label>
                <select
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.bacia}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, bacia: e.target.value }
                  })}
                >
                  <option value="">Selecione uma bacia</option>
                  {bacias.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bloco
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.bloco}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, bloco: e.target.value }
                  })}
                  placeholder="Ex: BM-S-11"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Latitude
                  <span className="text-xs font-normal text-gray-500 ml-2">(Decimal)</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.latitude}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, latitude: e.target.value }
                  })}
                  placeholder="Ex: -23.5505"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Longitude
                  <span className="text-xs font-normal text-gray-500 ml-2">(Decimal)</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.longitude}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, longitude: e.target.value }
                  })}
                  placeholder="Ex: -46.6333"
                />
              </div>

              {pdiData.referencia.tipoInstalacao === 'maritima' && (
                <>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Profundidade da Lâmina d'água (m) *
                      <span className="text-xs font-normal text-gray-500 ml-2">(Essencial para cálculo automático)</span>
                    </label>
                    <input
                      type="number"
                      className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      value={pdiData.referencia.profundidade}
                      onChange={(e) => setPdiData({
                        ...pdiData,
                        referencia: { ...pdiData.referencia, profundidade: e.target.value }
                      })}
                      placeholder="Ex: 2000"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Distância da Costa (km) *
                      <span className="text-xs font-normal text-gray-500 ml-2">(Impacta custos de logística)</span>
                    </label>
                    <input
                      type="number"
                      className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      value={pdiData.referencia.distanciaCosta}
                      onChange={(e) => setPdiData({
                        ...pdiData,
                        referencia: { ...pdiData.referencia, distanciaCosta: e.target.value }
                      })}
                      placeholder="Ex: 150"
                    />
                  </div>
                </>
              )}

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Data de Início da Operação
                </label>
                <input
                  type="date"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.dataInicio}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, dataInicio: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Data Prevista de Término
                </label>
                <input
                  type="date"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.referencia.dataTermino}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    referencia: { ...pdiData.referencia, dataTermino: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg p-4 mt-4`}>
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <strong>📌 Prazo de Submissão ANP:</strong><br/>
                • <strong>PDI Conceitual:</strong> Até 60 dias após término do contrato de exploração<br/>
                • <strong>PDI Executivo (Offshore):</strong> 5 anos antes do fim da produção<br/>
                • <strong>PDI Executivo (Onshore):</strong> 2 anos antes do fim da produção
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Motivações */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              2. Motivações para Descomissionamento
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Motivação *
                </label>
                <div className="space-y-2">
                  {tiposMotivacao.map(tipo => (
                    <div key={tipo.value} className={`border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-4 ${pdiData.motivacoes.tipo === tipo.value ? (darkMode ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-500') : ''}`}>
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="radio"
                          name="motivacao"
                          value={tipo.value}
                          checked={pdiData.motivacoes.tipo === tipo.value}
                          onChange={(e) => setPdiData({
                            ...pdiData,
                            motivacoes: { ...pdiData.motivacoes, tipo: e.target.value }
                          })}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tipo.label}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tipo.hint}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Justificativa Detalhada *
                  <span className="text-xs font-normal text-gray-500 ml-2">(Mínimo 100 caracteres)</span>
                </label>
                <textarea
                  rows={6}
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.motivacoes.justificativa}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    motivacoes: { ...pdiData.motivacoes, justificativa: e.target.value }
                  })}
                  placeholder="Descreva detalhadamente os motivos técnicos, econômicos e operacionais que justificam o descomissionamento. Exemplo: 'Campo em fase de declínio avançado com fator de recuperação de 85% atingido, tornando a operação economicamente inviável considerando os custos operacionais de R$ XX milhões/ano contra uma receita estimada de R$ XX milhões/ano...'"
                />
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {pdiData.motivacoes.justificativa.length} caracteres
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Condições Atuais das Instalações
                </label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.motivacoes.condicoesAtuais}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    motivacoes: { ...pdiData.motivacoes, condicoesAtuais: e.target.value }
                  })}
                  placeholder="Descreva o estado atual das instalações: integridade estrutural, sistemas de produção, equipamentos críticos, etc."
                />
              </div>
            </div>

            <div className={`${darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border-l-4 rounded-lg p-4`}>
              <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                <strong>✅ Dica Profissional:</strong> Inclua dados quantitativos sempre que possível:
                volumes de produção, custos operacionais, indicadores de integridade, idade das instalações,
                histórico de manutenção e investimentos necessários para continuar operando.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Inventário */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              3. Inventário de Instalações
            </h3>

            {/* Poços */}
            <div className={`border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Poços
                </h4>
                <button
                  onClick={adicionarPoco}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <span>+</span> Adicionar Poço
                </button>
              </div>

              {pdiData.inventario.pocos.length === 0 ? (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Nenhum poço adicionado. Clique em "Adicionar Poço" para começar.
                </p>
              ) : (
                <div className="space-y-4">
                  {pdiData.inventario.pocos.map((poco, index) => (
                    <div key={poco.id} className={`border ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg p-4`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Poço #{index + 1}
                        </span>
                        <button
                          onClick={() => {
                            const novosPoco = pdiData.inventario.pocos.filter(p => p.id !== poco.id)
                            setPdiData({
                              ...pdiData,
                              inventario: { ...pdiData.inventario, pocos: novosPoco }
                            })
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold"
                        >
                          Remover
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Nome do Poço (ex: 1-RJS-0001)"
                          className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={poco.nome}
                          onChange={(e) => {
                            const novosPoco = [...pdiData.inventario.pocos]
                            novosPoco[index].nome = e.target.value
                            setPdiData({
                              ...pdiData,
                              inventario: { ...pdiData.inventario, pocos: novosPoco }
                            })
                          }}
                        />

                        <select
                          className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={poco.tipo}
                          onChange={(e) => {
                            const novosPoco = [...pdiData.inventario.pocos]
                            novosPoco[index].tipo = e.target.value
                            setPdiData({
                              ...pdiData,
                              inventario: { ...pdiData.inventario, pocos: novosPoco }
                            })
                          }}
                        >
                          <option value="produtor">Produtor</option>
                          <option value="injetor">Injetor</option>
                          <option value="exploratorio">Exploratório</option>
                        </select>

                        <input
                          type="number"
                          placeholder="Profundidade (m)"
                          className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={poco.profundidade}
                          onChange={(e) => {
                            const novosPoco = [...pdiData.inventario.pocos]
                            novosPoco[index].profundidade = e.target.value
                            setPdiData({
                              ...pdiData,
                              inventario: { ...pdiData.inventario, pocos: novosPoco }
                            })
                          }}
                        />

                        <select
                          className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={poco.status}
                          onChange={(e) => {
                            const novosPoco = [...pdiData.inventario.pocos]
                            novosPoco[index].status = e.target.value
                            setPdiData({
                              ...pdiData,
                              inventario: { ...pdiData.inventario, pocos: novosPoco }
                            })
                          }}
                        >
                          <option value="ativo">Ativo</option>
                          <option value="suspenso">Suspenso</option>
                          <option value="abandonado">Abandonado</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instalações */}
            <div className={`border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Outras Instalações
                </h4>
                <button
                  onClick={adicionarInstalacao}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <span>+</span> Adicionar Instalação
                </button>
              </div>

              {pdiData.inventario.instalacoes.length === 0 ? (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Nenhuma instalação adicionada. Clique em "Adicionar Instalação" para começar.
                </p>
              ) : (
                <div className="space-y-4">
                  {pdiData.inventario.instalacoes.map((inst, index) => (
                    <div key={inst.id} className={`border ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg p-4`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Instalação #{index + 1}
                        </span>
                        <button
                          onClick={() => {
                            const novasInst = pdiData.inventario.instalacoes.filter(i => i.id !== inst.id)
                            setPdiData({
                              ...pdiData,
                              inventario: { ...pdiData.inventario, instalacoes: novasInst }
                            })
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold"
                        >
                          Remover
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <input
                          type="text"
                          placeholder="Nome da Instalação"
                          className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={inst.nome}
                          onChange={(e) => {
                            const novasInst = [...pdiData.inventario.instalacoes]
                            novasInst[index].nome = e.target.value
                            setPdiData({
                              ...pdiData,
                              inventario: { ...pdiData.inventario, instalacoes: novasInst }
                            })
                          }}
                        />

                        <select
                          className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={inst.tipo}
                          onChange={(e) => {
                            const novasInst = [...pdiData.inventario.instalacoes]
                            novasInst[index].tipo = e.target.value
                            setPdiData({
                              ...pdiData,
                              inventario: { ...pdiData.inventario, instalacoes: novasInst }
                            })
                          }}
                        >
                          <option value="plataforma">Plataforma Fixa</option>
                          <option value="fpso">FPSO</option>
                          <option value="manifold">Manifold Submarino</option>
                          <option value="duto">Duto/Pipeline</option>
                          <option value="umbilical">Umbilical</option>
                          <option value="arvore">Árvore de Natal</option>
                          <option value="outro">Outro</option>
                        </select>

                        <textarea
                          placeholder="Descrição e características"
                          rows={2}
                          className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={inst.descricao}
                          onChange={(e) => {
                            const novasInst = [...pdiData.inventario.instalacoes]
                            novasInst[index].descricao = e.target.value
                            setPdiData({
                              ...pdiData,
                              inventario: { ...pdiData.inventario, instalacoes: novasInst }
                            })
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${darkMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'} border-l-4 rounded-lg p-4`}>
              <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                <strong>📋 Documentação Necessária:</strong> Para cada instalação, a ANP requer plantas,
                registros fotográficos, coordenadas georreferenciadas e especificações técnicas completas.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Alternativas */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              4. Alternativas de Descomissionamento
            </h3>

            <div className={`${darkMode ? 'bg-indigo-900/30 border-indigo-700' : 'bg-indigo-50 border-indigo-200'} border-l-4 rounded-lg p-4 mb-6`}>
              <p className={`text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                <strong>📊 Análise Comparativa:</strong> A ANP 817/2020 exige avaliação de alternativas
                considerando critérios técnicos, ambientais, sociais, econômicos e de segurança.
              </p>
            </div>

            {/* Biblioteca de Técnicas */}
            <div>
              <h4 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Biblioteca de Técnicas de Descomissionamento
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {tecnicasDescomissionamento.map(tecnica => {
                  const jaAdicionada = pdiData.alternativas.find(alt => alt.id === tecnica.id)

                  return (
                    <div key={tecnica.id} className={`border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-white'} rounded-lg p-4 ${jaAdicionada ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {tecnica.nome}
                        </h5>
                        {jaAdicionada && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Adicionada</span>
                        )}
                      </div>

                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {tecnica.descricao}
                      </p>

                      <div className={`text-xs space-y-1 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div><strong>💰 Custo base:</strong> R$ {tecnica.custoBase.toLocaleString('pt-BR')}</div>
                        <div><strong>⏱️ Prazo:</strong> {tecnica.prazo} meses</div>
                        <div><strong>🌍 Impacto ambiental:</strong> {tecnica.impactoAmbiental}</div>
                        <div><strong>⚠️ Risco operacional:</strong> {tecnica.riscoOperacional}</div>
                      </div>

                      {!jaAdicionada ? (
                        <button
                          onClick={() => adicionarAlternativa(tecnica)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Adicionar ao PDI
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const novasAlt = pdiData.alternativas.filter(alt => alt.id !== tecnica.id)
                            setPdiData({ ...pdiData, alternativas: novasAlt })
                          }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Remover do PDI
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Alternativas Selecionadas */}
            {pdiData.alternativas.length > 0 && (
              <div>
                <h4 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Alternativas Incluídas no PDI ({pdiData.alternativas.length})
                </h4>

                <div className="space-y-4">
                  {pdiData.alternativas.map((alt, index) => (
                    <div key={alt.id} className={`border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg p-4`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {alt.nome}
                          </h5>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {alt.descricao}
                          </p>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={alt.selecionada}
                            onChange={(e) => {
                              const novasAlt = [...pdiData.alternativas]
                              novasAlt[index].selecionada = e.target.checked
                              setPdiData({ ...pdiData, alternativas: novasAlt })
                            }}
                            className="w-5 h-5"
                          />
                          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Alternativa Selecionada
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Justificativa Técnica {alt.selecionada ? '*' : '(Opcional)'}
                        </label>
                        <textarea
                          rows={3}
                          className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={alt.justificativa}
                          onChange={(e) => {
                            const novasAlt = [...pdiData.alternativas]
                            novasAlt[index].justificativa = e.target.value
                            setPdiData({ ...pdiData, alternativas: novasAlt })
                          }}
                          placeholder="Justifique a escolha ou descarte desta alternativa com base em critérios técnicos, ambientais, econômicos e de segurança..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pdiData.alternativas.length === 0 && (
              <div className={`border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center`}>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Adicione ao menos uma alternativa da biblioteca acima para continuar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Projeto */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              5. Projeto de Descomissionamento
            </h3>

            {pdiData.referencia.tipoPDI === 'conceitual' && (
              <div className={`${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border-l-4 rounded-lg p-4`}>
                <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  <strong>ℹ️ PDI Conceitual:</strong> Esta seção é opcional para PDI Conceitual.
                  Detalhe apenas escopo geral do projeto.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descrição Geral do Projeto {pdiData.referencia.tipoPDI === 'executivo' ? '*' : ''}
                </label>
                <textarea
                  rows={6}
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.projeto.descricao}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    projeto: { ...pdiData.projeto, descricao: e.target.value }
                  })}
                  placeholder="Descreva as atividades planejadas de descomissionamento: plugueamento de poços, remoção de estruturas, limpeza de áreas, etc. Inclua metodologias, equipamentos e recursos humanos necessários."
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Infraestrutura Necessária
                </label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.projeto.infraestrutura}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    projeto: { ...pdiData.projeto, infraestrutura: e.target.value }
                  })}
                  placeholder="Liste embarcações, equipamentos especiais, bases de apoio, etc. Exemplo: 'Sonda de intervenção para P&A, barcaça para remoção de estruturas, ROVs para inspeção submarina, base de apoio em Macaé...'"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Destino das Instalações Removidas
                </label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.projeto.destino}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    projeto: { ...pdiData.projeto, destino: e.target.value }
                  })}
                  placeholder="Descreva o destino dos materiais: reciclagem, descarte em aterros licenciados, doação, revenda, etc. Exemplo: '85% do aço será reciclado em siderúrgicas licenciadas, 10% de resíduos perigosos destinados a aterro industrial Classe I...'"
                />
              </div>
            </div>

            <div className={`${darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border-l-4 rounded-lg p-4`}>
              <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                <strong>♻️ Economia Circular:</strong> Priorize reciclagem e reuso. Estruturas metálicas
                de plataformas podem ter taxa de reciclagem superior a 95%, reduzindo impacto ambiental e custos.
              </p>
            </div>
          </div>
        )}

        {/* STEP 6: Procedimentos */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              6. Procedimentos Operacionais de Segurança
            </h3>

            <div className={`${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border-l-4 rounded-lg p-4`}>
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                <strong>⚠️ Segurança é Prioridade:</strong> Descomissionamento envolve riscos elevados.
                Documente todos os procedimentos de segurança, planos de emergência e análises de risco.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Procedimentos Operacionais Principais
                </label>
                <textarea
                  rows={8}
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={pdiData.procedimentos.join('\n\n')}
                  onChange={(e) => setPdiData({
                    ...pdiData,
                    procedimentos: e.target.value.split('\n\n').filter(p => p.trim())
                  })}
                  placeholder="Liste os procedimentos operacionais, um por parágrafo. Exemplos:&#10;&#10;Procedimento de P&A (Plugueamento e Abandono): Isolamento de zonas com tampões de cimento conforme normas API 65 e ISO 16530, testes de integridade, documentação fotográfica.&#10;&#10;Procedimento de Remoção de Plataforma: Inspeção estrutural, corte submarino com ROV, içamento com guindaste, transporte para estaleiro de desmonte.&#10;&#10;Procedimento de Gerenciamento de Resíduos: Classificação conforme ABNT NBR 10004, segregação, armazenamento temporário, destinação a empresas licenciadas."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg p-4`}>
                  <h5 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ✅ Itens Obrigatórios
                  </h5>
                  <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Análise de Riscos (HAZOP/HAZID)</li>
                    <li>• Plano de Resposta a Emergências</li>
                    <li>• Procedimentos de HSE</li>
                    <li>• Permissões de Trabalho</li>
                    <li>• Treinamentos específicos</li>
                    <li>• Comunicação com autoridades</li>
                  </ul>
                </div>

                <div className={`border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg p-4`}>
                  <h5 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    📋 Normas Aplicáveis
                  </h5>
                  <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• API 65 (Well Abandonment)</li>
                    <li>• ISO 16530 (Well Integrity)</li>
                    <li>• NORSOK D-010 (Decommissioning)</li>
                    <li>• NR-30 (Segurança Aquaviária)</li>
                    <li>• MARPOL (Prevenção Poluição)</li>
                    <li>• CONAMA 01/86 (EIA/RIMA)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Cronograma */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              7. Cronograma de Atividades
            </h3>

            <div className="flex justify-between items-center mb-4">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Detalhe todas as atividades com datas de início e término
              </p>
              <button
                onClick={adicionarAtividadeCronograma}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              >
                <span>+</span> Nova Atividade
              </button>
            </div>

            {pdiData.cronograma.length === 0 ? (
              <div className={`border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center`}>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Nenhuma atividade no cronograma. Clique em "Nova Atividade" para começar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pdiData.cronograma.map((atividade, index) => (
                  <div key={atividade.id} className={`border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg p-4`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Atividade #{index + 1}
                      </span>
                      <button
                        onClick={() => {
                          const novasCron = pdiData.cronograma.filter(c => c.id !== atividade.id)
                          setPdiData({ ...pdiData, cronograma: novasCron })
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-semibold"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Nome da Atividade"
                        className={`lg:col-span-2 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        value={atividade.atividade}
                        onChange={(e) => {
                          const novasCron = [...pdiData.cronograma]
                          novasCron[index].atividade = e.target.value
                          setPdiData({ ...pdiData, cronograma: novasCron })
                        }}
                      />

                      <div>
                        <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Início
                        </label>
                        <input
                          type="date"
                          className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={atividade.inicio}
                          onChange={(e) => {
                            const novasCron = [...pdiData.cronograma]
                            novasCron[index].inicio = e.target.value
                            setPdiData({ ...pdiData, cronograma: novasCron })
                          }}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Término
                        </label>
                        <input
                          type="date"
                          className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={atividade.fim}
                          onChange={(e) => {
                            const novasCron = [...pdiData.cronograma]
                            novasCron[index].fim = e.target.value
                            setPdiData({ ...pdiData, cronograma: novasCron })
                          }}
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Responsável"
                        className={`lg:col-span-2 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        value={atividade.responsavel}
                        onChange={(e) => {
                          const novasCron = [...pdiData.cronograma]
                          novasCron[index].responsavel = e.target.value
                          setPdiData({ ...pdiData, cronograma: novasCron })
                        }}
                      />

                      <select
                        className={`lg:col-span-2 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        value={atividade.status}
                        onChange={(e) => {
                          const novasCron = [...pdiData.cronograma]
                          novasCron[index].status = e.target.value
                          setPdiData({ ...pdiData, cronograma: novasCron })
                        }}
                      >
                        <option value="planejada">Planejada</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluida">Concluída</option>
                        <option value="atrasada">Atrasada</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Visualização Gantt Simplificada */}
            {pdiData.cronograma.length > 0 && (
              <div className={`border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-4`}>
                <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📊 Visualização de Cronograma (Gantt Simplificado)
                </h4>

                <div className="space-y-2">
                  {pdiData.cronograma.map((atividade, index) => {
                    const inicio = atividade.inicio ? new Date(atividade.inicio) : null
                    const fim = atividade.fim ? new Date(atividade.fim) : null
                    const duracao = inicio && fim ? Math.max(1, Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24))) : 0

                    const statusColors = {
                      planejada: darkMode ? 'bg-blue-600' : 'bg-blue-500',
                      em_andamento: darkMode ? 'bg-yellow-600' : 'bg-yellow-500',
                      concluida: darkMode ? 'bg-green-600' : 'bg-green-500',
                      atrasada: darkMode ? 'bg-red-600' : 'bg-red-500'
                    }

                    return (
                      <div key={atividade.id} className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {atividade.atividade || `Atividade ${index + 1}`}
                          </span>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {duracao > 0 ? `${duracao} dias` : 'Definir datas'}
                          </span>
                        </div>

                        {duracao > 0 && (
                          <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                            <div
                              className={`h-full ${statusColors[atividade.status]} flex items-center px-2`}
                              style={{ width: '100%' }}
                            >
                              <span className="text-xs text-white font-semibold">
                                {atividade.inicio} → {atividade.fim}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className={`${darkMode ? 'bg-cyan-900/30 border-cyan-700' : 'bg-cyan-50 border-cyan-200'} border-l-4 rounded-lg p-4`}>
              <p className={`text-sm ${darkMode ? 'text-cyan-300' : 'text-cyan-800'}`}>
                <strong>⏱️ Planejamento Realista:</strong> Considere janelas meteorológicas (offshore),
                disponibilidade de equipamentos especializados e aprovações regulatórias. Adicione contingências de 15-20%.
              </p>
            </div>
          </div>
        )}

        {/* STEP 8: Custos */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              8. Estimativa de Custos
            </h3>

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Detalhe todos os custos estimados por categoria
                </p>
                <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Total: R$ {calcularCustoTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const resultado = window.PDICalculos.calcularCustosPDIAutomatico(pdiData)
                    setPdiData({
                      ...pdiData,
                      custos: {
                        detalhamento: resultado.custos,
                        total: resultado.custoTotal
                      }
                    })
                    alert(`✅ Custos calculados automaticamente!\n\n💰 Total: R$ ${(resultado.custoTotal/1000000).toFixed(1)}M\n📊 Confiança: ${resultado.validacao.score}%\n\nBaseado em benchmarks da indústria e dados do inventário.`)
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Calcular Automaticamente
                </button>
                <button
                  onClick={adicionarItemCusto}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <span>+</span> Novo Item Manual
                </button>
                <button
                  onClick={() => {
                    const dataset = window.PDICalculos.exportarParaML(pdiData, {
                      custos: pdiData.custos.detalhamento,
                      custoTotal: calcularCustoTotal(),
                      validacao: { score: 85 }
                    })
                    window.PDICalculos.downloadDatasetML(dataset)
                    alert('✅ Dataset exportado para Machine Learning!\n\nArquivo JSON salvo com todos os dados estruturados para treinamento futuro.')
                  }}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Exportar p/ ML
                </button>
              </div>
            </div>

            {/* Alerta de Cálculo Automático */}
            <div className={`${darkMode ? 'bg-indigo-900/30 border-indigo-700' : 'bg-indigo-50 border-indigo-200'} border-l-4 rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h4 className={`font-bold mb-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-800'}`}>
                    Sistema Inteligente de Estimativa de Custos
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <strong>Cálculo Paramétrico:</strong> O sistema analisa profundidade de lâmina d'água ({pdiData.referencia.profundidade || 'não informado'}m),
                    distância da costa ({pdiData.referencia.distanciaCosta || 'não informado'}km), {pdiData.inventario.pocos?.length || 0} poço(s),
                    {pdiData.inventario.instalacoes?.length || 0} instalação(ões) e calcula custos baseados em benchmarks da indústria.
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    💡 <strong>Preparado para ML:</strong> Todos os dados podem ser exportados para treinamento de modelos preditivos.
                  </p>
                </div>
              </div>
            </div>

            {pdiData.custos.detalhamento.length === 0 ? (
              <div className={`border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center`}>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                  Nenhum item de custo adicionado. Clique em "Novo Item" para começar.
                </p>
                <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  <p className="mb-2">💡 <strong>Categorias Típicas:</strong></p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>Mobilização</div>
                    <div>P&A de Poços</div>
                    <div>Remoção Estruturas</div>
                    <div>Gestão Resíduos</div>
                    <div>Logística</div>
                    <div>Engenharia</div>
                    <div>Licenciamento</div>
                    <div>Monitoramento</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pdiData.custos.detalhamento.map((item, index) => (
                  <div key={item.id} className={`border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg p-4`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Item #{index + 1}
                      </span>
                      <button
                        onClick={() => {
                          const novosItens = pdiData.custos.detalhamento.filter(c => c.id !== item.id)
                          setPdiData({
                            ...pdiData,
                            custos: { ...pdiData.custos, detalhamento: novosItens }
                          })
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-semibold"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Descrição do item"
                        className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        value={item.descricao}
                        onChange={(e) => {
                          const novosItens = [...pdiData.custos.detalhamento]
                          novosItens[index].descricao = e.target.value
                          setPdiData({
                            ...pdiData,
                            custos: { ...pdiData.custos, detalhamento: novosItens }
                          })
                        }}
                      />

                      <select
                        className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        value={item.categoria}
                        onChange={(e) => {
                          const novosItens = [...pdiData.custos.detalhamento]
                          novosItens[index].categoria = e.target.value
                          setPdiData({
                            ...pdiData,
                            custos: { ...pdiData.custos, detalhamento: novosItens }
                          })
                        }}
                      >
                        <option value="mobilizacao">Mobilização/Desmobilização</option>
                        <option value="pa_pocos">P&A de Poços</option>
                        <option value="remocao">Remoção de Estruturas</option>
                        <option value="residuos">Gestão de Resíduos</option>
                        <option value="logistica">Logística e Transporte</option>
                        <option value="engenharia">Engenharia e Projetos</option>
                        <option value="licenciamento">Licenciamento Ambiental</option>
                        <option value="monitoramento">Monitoramento Pós-Descomis.</option>
                        <option value="contingencia">Contingência</option>
                        <option value="outros">Outros</option>
                      </select>

                      <div className="relative">
                        <span className={`absolute left-3 top-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          value={item.valor}
                          onChange={(e) => {
                            const novosItens = [...pdiData.custos.detalhamento]
                            novosItens[index].valor = e.target.value
                            setPdiData({
                              ...pdiData,
                              custos: { ...pdiData.custos, detalhamento: novosItens }
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumo por Categoria */}
            {pdiData.custos.detalhamento.length > 0 && (
              <div className={`border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-4`}>
                <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  💰 Resumo por Categoria
                </h4>

                <div className="space-y-2">
                  {Object.entries(
                    pdiData.custos.detalhamento.reduce((acc, item) => {
                      const valor = parseFloat(item.valor) || 0
                      acc[item.categoria] = (acc[item.categoria] || 0) + valor
                      return acc
                    }, {})
                  ).map(([categoria, valor]) => {
                    const percentual = calcularCustoTotal() > 0 ? ((valor / calcularCustoTotal()) * 100).toFixed(1) : 0

                    return (
                      <div key={categoria} className={`flex items-center gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold capitalize">{categoria.replace('_', ' ')}</span>
                            <span>R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className={`h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${percentual}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold">{percentual}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className={`${darkMode ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200'} border-l-4 rounded-lg p-4`}>
              <p className={`text-sm ${darkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                <strong>💡 Benchmarks Internacionais:</strong><br/>
                • <strong>P&A de Poço Offshore:</strong> USD 10-50 milhões por poço (variável com profundidade)<br/>
                • <strong>Remoção Plataforma:</strong> 5-15% do CAPEX original<br/>
                • <strong>Contingência Recomendada:</strong> 15-25% do total
              </p>
            </div>
          </div>
        )}

        {/* Seção 9: Anexos e Avaliações */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              9. Anexos
            </h3>

            {/* Disclaimer */}
            <div className={`${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border-l-4 rounded-lg p-4 mb-6`}>
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <strong>📋 Documentação Obrigatória ANP 817/2020:</strong><br/>
                Esta seção é destinada ao registro de licenças ambientais e autorizações obrigatórias para o descomissionamento.
              </p>
            </div>
              

            {/* Upload de Licenças Ambientais */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 mt-6`}>
              <h4 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📄 Licenças Ambientais
              </h4>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Registre as licenças ambientais obrigatórias (LP, LI, LO e outras autorizações):
              </p>

              <div className="space-y-4">
                {['LP - Licença Prévia', 'LI - Licença de Instalação', 'LO - Licença de Operação', 'Outras Autorizações'].map((tipo, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {tipo}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Número da Licença"
                        className={`px-3 py-2 border rounded-lg text-sm ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      <input
                        type="date"
                        placeholder="Data de Emissão"
                        className={`px-3 py-2 border rounded-lg text-sm ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <input
                        type="date"
                        placeholder="Data de Validade"
                        className={`px-3 py-2 border rounded-lg text-sm ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div className="mt-2">
                      <label className={`block w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer text-center transition-all ${
                        darkMode
                          ? 'border-gray-600 hover:border-blue-500 bg-gray-700 hover:bg-gray-650'
                          : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50'
                      }`}>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          📎 Clique para anexar documento (PDF, JPG, PNG)
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border-l-4 rounded-lg p-4 mt-4`}>
                <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  <strong>⚠️ Importante:</strong> As licenças ambientais são obrigatórias conforme legislação CONAMA e IBAMA. Certifique-se de que todas estejam válidas antes da submissão à ANP.
                </p>
              </div>
            </div>

            {/* Visualizar Gráficos */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 mt-6`}>
              <h4 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📊 Visualização de Gráficos
              </h4>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Visualize os gráficos e análises que serão incluídos no relatório final:
              </p>
              <button
                onClick={() => window.open('graficos_relatorio.html', '_blank')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Visualizar Gráficos do Relatório
              </button>
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-300">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            ← Anterior
          </button>

          {currentStep < 9 ? (
            <button
              onClick={() => setCurrentStep(Math.min(9, currentStep + 1))}
              className="px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={gerarPDF}
              className="px-6 py-3 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Finalizar e Gerar PDF
            </button>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
        <h4 className={`text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Navegação Rápida
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {[
            { num: 1, name: 'Referência' },
            { num: 2, name: 'Motivações' },
            { num: 3, name: 'Inventário' },
            { num: 4, name: 'Alternativas' },
            { num: 5, name: 'Projeto' },
            { num: 6, name: 'Procedimentos' },
            { num: 7, name: 'Cronograma' },
            { num: 8, name: 'Custos' },
            { num: 9, name: 'Anexos' }
          ].map(step => (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentStep === step.num
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div>{step.num}</div>
              <div className="hidden md:block text-xs font-normal">{step.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Expor PDIComponent globalmente para uso no index.html
window.PDIComponent = PDIComponent;
