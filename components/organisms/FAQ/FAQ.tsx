'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './FAQ.module.css'

type Category = 'all' | 'conceito' | 'integracao' | 'billing' | 'planos' | 'produto'

interface FAQItem {
  q: string
  a: string
}

interface FAQSection {
  cat: Category
  catLabel: string
  items: FAQItem[]
}

const FAQ_DATA: FAQSection[] = [
  {
    cat: 'conceito',
    catLabel: 'Conceito',
    items: [
      {
        q: 'O que é um wide event?',
        a: `<p>Um wide event é um registro único e arbitrariamente rico que captura tudo que aconteceu durante uma operação — uma request, uma transação, um job assíncrono. Em vez de gerar dezenas de logs separados, você emite <strong>um evento estruturado</strong> com todos os campos que importam.</p>
        <div class="callout callout-info">Exemplo: em vez de um log "usuário autenticado", um log "pagamento processado" e uma métrica "latência = 320ms", você emite um evento único com <code>user_id</code>, <code>payment_amount</code>, <code>latency_ms</code>, <code>plan</code>, <code>region</code> — tudo junto, no mesmo contexto.</div>
        <p>A consequência é que qualquer pergunta sobre aquele momento pode ser respondida sem cruzar tabelas ou perder dados: <em>"Qual foi o p99 de latência nos checkouts do plano Pro na região Sul nas últimas 2 horas?"</em> — uma query, resposta imediata.</p>`,
      },
      {
        q: 'Qual a diferença entre wide events, logs, métricas e traces?',
        a: `<div class="comparison-grid">
          <div class="comparison-cell"><div class="cell-label">Logs tradicionais</div>Texto livre ou semiestruturado. Bom para debugging pontual, ruim para análise porque contexto está fragmentado em dezenas de linhas por request.</div>
          <div class="comparison-cell"><div class="cell-label">Métricas</div>Números agregados no tempo (ex: requests/min). Bom para dashboards, ruim para entender <em>por que</em> um número mudou — perdem o contexto individual.</div>
          <div class="comparison-cell"><div class="cell-label">Traces</div>Mapa de uma request através de serviços. Poderoso em sistemas distribuídos, mas requer instrumentação específica e não carrega contexto de negócio nativo.</div>
          <div class="comparison-cell comparison-cell--highlight"><div class="cell-label">Wide events</div>Um único registro por request com todos os campos — técnicos, de negócio e de contexto. Métricas e traces são <strong>derivados dinamicamente</strong> a partir do mesmo evento, sem coleta paralela.</div>
        </div>
        <div class="callout callout-tip">No Pantor, você não precisa escolher entre ter logs <em>ou</em> métricas <em>ou</em> traces. Você captura um evento rico e o Pantor responde qualquer pergunta a partir dele.</div>`,
      },
      {
        q: 'Por que o Pantor não é uma ferramenta de monitoramento de incidentes?',
        a: `<p>Ferramentas de monitoramento tradicionais foram construídas para um modelo reativo: você só abre o painel quando algo quebrou. O ciclo é <em>deploy → esperar o usuário reclamar → abrir alerta → investigar</em>.</p>
        <p>O Pantor foi construído para fechar o loop entre desenvolvimento e produção de forma contínua. A ideia é que você valide o comportamento do seu sistema <strong>a cada deploy</strong>, não apenas durante incidentes. O mesmo evento rico que te ajuda a resolver um bug te ajuda a confirmar que o último deploy melhorou a latência de checkout em 40ms.</p>
        <div class="callout callout-info">O critério de sucesso do Pantor não é "resolver incidentes mais rápido" — é "acesso fora de incidentes". Se você só abre o Pantor quando algo quebra, está usando o produto de forma reativa. Se você abre após cada deploy para validar, fechamos o loop.</div>`,
      },
      
    ],
  },
  {
    cat: 'integracao',
    catLabel: 'Integração',
    items: [
      {
        q: 'Quanto tempo leva para integrar? Preciso de um engenheiro de infra?',
        a: `<p>Não. O Pantor foi projetado para que <strong>o próprio desenvolvedor seja o operador</strong> — sem DevOps ou SRE dedicado.</p>
        <p>A integração via SDK tem três etapas:</p>
        <p><code>npm install @pantor/sdk</code> → <code>pantor.init({ apiKey })</code> → <code>pantor.event({ ...attrs })</code></p>
        <div class="callout callout-tip">Nosso critério de sucesso interno: primeiro evento visível em produção em menos de 15 minutos após o início da integração. Se demorar mais que isso, algo no nosso produto está errado — não no seu.</div>
        <p>Se você já tem OpenTelemetry configurado, é ainda mais simples: aponte seu exportador para o endpoint do Pantor. Zero reescrita de instrumentação existente.</p>`,
      },
      {
        q: 'O Pantor funciona com meu stack atual? Preciso reescrever minha instrumentação?',
        a: `<p>Dois caminhos, sem necessidade de escolher:</p>
        <p><strong>Via SDK próprio (JS/TypeScript):</strong> Para novos projetos ou quando você quer a experiência mais simples. Node.js, Next.js, APIs REST — qualquer ambiente que rode JavaScript.</p>
        <p><strong>Via OpenTelemetry (OTLP):</strong> Se você já tem instrumentação com o SDK OpenTelemetry ou um Collector configurado, basta apontar o exportador para o endpoint do Pantor. Nenhuma linha de código existente precisa mudar.</p>
        <div class="callout callout-info">Eventos recebidos via SDK próprio e via OTLP passam pelo mesmo processo de normalização interna. O modelo de dados é idêntico nos dois casos.</div>
        <p>Para stacks além de JS/TS (Python, Go, Ruby), a via OTLP é o caminho recomendado hoje. SDKs nativos para outras linguagens estão no roadmap.</p>`,
      },
      
      
      {
        q: 'O SDK é resiliente a instabilidade de rede? Posso perder eventos?',
        a: `<p>O SDK foi construído com resiliência como requisito, não como feature opcional. Três mecanismos garantem isso:</p>
        <p><strong>Batching automático:</strong> eventos são agrupados antes do envio, reduzindo a chance de falha por overhead de rede.</p>
        <p><strong>Retry com backoff exponencial:</strong> falhas de rede disparam retentativas automáticas com intervalos progressivos.</p>
        <p><strong>Fila local:</strong> eventos ficam em fila local até confirmação de recebimento — mesmo com rede instável ou intermitente, eles não se perdem.</p>
        <div class="callout callout-tip">Isso é especialmente relevante em ambientes serverless ou edge, onde a conexão pode ser encerrada antes da confirmação de envio.</div>`,
      },
      {
        q: 'Como o Pantor lida com dados sensíveis que eu não quero enviar?',
        a: `<p>Você controla exatamente o que está dentro de cada evento. O Pantor não faz coleta automática de dados — cada atributo que aparece no evento foi colocado por você explicitamente.</p>
        <p>Boas práticas recomendadas:</p>
        <p>— Nunca coloque senhas, tokens ou dados de cartão como atributos de evento. Use IDs de referência (<code>user_id</code>, <code>payment_id</code>) em vez de dados brutos.</p>
        <p>— Para PII (nome completo, e-mail, CPF), avalie se o atributo é necessário para análise ou se um identificador anonimizado serve.</p>
        <div class="callout callout-warn">O Pantor não aplica mascaramento automático de campos hoje. A responsabilidade de filtrar dados sensíveis antes do envio é do time que integra o SDK.</div>`,
      },
    ],
  },
  {
    cat: 'billing',
    catLabel: 'Billing & Overage',
    items: [
      {
        q: "O que conta como um 'evento' para fins de cobrança?",
        a: `<p>Cada chamada a <code>pantor.event()</code> — ou cada span/log recebido via OTLP — conta como <strong>um evento</strong>.</p>
        <p>A regra prática: <strong>1 request = 1 evento</strong>. Diferente de ferramentas baseadas em logs, onde uma única request pode gerar 20–50 linhas de log, o modelo de wide events gera exatamente um registro por operação, independente de quantos atributos esse registro contém.</p>
        <div class="callout callout-tip">Isso significa que você provavelmente vai gerar muito menos eventos do que imagina. Um app com 10.000 DAUs fazendo 50 requests por dia = 500.000 eventos/dia = 15M eventos/mês. Plano Escala cobre 50M/mês — margem confortável.</div>
        <p>Use nossa calculadora de estimativa de eventos para confirmar o tier certo antes de escolher um plano.</p>`,
      },
      {
        q: 'O que acontece quando atinjo o limite do meu plano?',
        a: `<p>Você recebe alertas proativos — não uma surpresa na fatura. O sistema envia notificações em <strong>50%, 80% e 100%</strong> do seu limite mensal, com link direto para fazer upgrade com um clique.</p>
        <p>Se você atingir 100% do limite e não fizer upgrade:</p>
        <p><strong>Por padrão, a ingestão é pausada</strong> até o início do próximo ciclo de billing ou até você fazer upgrade. Seus dados existentes permanecem acessíveis. Nenhum evento é perdido retroativamente.</p>
        <div class="callout callout-warn">Você pode optar por habilitar overage no painel — nesse caso, eventos além do limite são cobrados por R$20 por milhão adicional (varia por plano). Essa opção existe para picos inesperados como campanhas ou lançamentos, mas vem desativada por padrão exatamente para proteger você de surpresas.</div>`,
      },
      {
        q: 'Como funciona o overage? Posso ter uma surpresa na fatura?',
        a: `<p><strong>Não, se você mantiver o overage desativado</strong> (padrão). Com overage desligado, a ingestão para quando você atinge o limite — sua fatura é exatamente o valor do plano, sem centavo a mais.</p>
        <p>Se você ativar o overage manualmente, as regras são:</p>
        <p>— Cobrança por R$20/1M eventos extras (plano Starter), R$12/1M (Growth), R$8/1M (Business).</p>
        <p>— Alerta imediato ao entrar em overage.</p>
        <p>— Teto máximo de overage configurável: você define um valor máximo de custo extra por mês. Ao atingir o teto, a ingestão pausa automaticamente.</p>
        <div class="callout callout-tip">A promessa do Pantor é custo previsível. Se você ativar overage, configure sempre um teto de proteção. A combinação alerta proativo + teto máximo elimina o risco de bill shock.</div>`,
      },
      {
        q: 'Como calculo quantos eventos meu produto vai gerar?',
        a: `<p>A estimativa mais rápida:</p>
        <p><strong>Eventos/mês = requests/hora × 24 horas × 30 dias</strong></p>
        <p>Exemplos práticos:</p>
        <p>— SaaS com 1.000 DAUs, 30 req/usuário/dia: 30.000 × 30 = <strong>900.000 eventos/mês</strong> → plano Starter (10M)</p>
        <p>— App com 20.000 DAUs, 50 req/dia: 1.000.000 × 30 = <strong>30M eventos/mês</strong> → plano Growth(50M)</p>
        <div class="callout callout-info">Lembre: wide events geram <em>menos</em> registros do que logs tradicionais. Se você vinha de um sistema onde uma request gerava 20 linhas de log, sua estimativa de volume vai ser 20x menor no Pantor.</div>`,
      },
      
      {
        q: 'O billing é mensal ou anual? Posso cancelar a qualquer momento?',
        a: `<p>Os planos são disponíveis nas duas modalidades:</p>
        <p><strong>Mensal:</strong> flexibilidade total. Cancele, faça downgrade ou upgrade a qualquer momento. O cancelamento é efetivo no fim do ciclo vigente.</p>
        <p><strong>Anual (20% de desconto):</strong> cobrança anual adiantada. O desconto é aplicado automaticamente — nenhum contrato ou negociação necessária.</p>
        <p>Não há período de fidelidade, multa de cancelamento ou contrato de longo prazo fora do plano Enterprise.</p>
        <div class="callout callout-tip">Formas de pagamento aceitas: cartão de crédito, Pix e boleto bancário. Nota fiscal eletrônica emitida automaticamente para CNPJ em todos os planos pagos.</div>`,
      },
    ],
  },
  {
    cat: 'planos',
    catLabel: 'Planos & Upgrades',
    items: [
      
      {
        q: 'Como eu sei que é hora de fazer upgrade de plano?',
        a: `<p>Existem dois sinais principais — e o Pantor te avisa antes de você precisar se preocupar:</p>
        <p><strong>Sinal 1 — Volume:</strong> você recebe um alerta quando atinge 80% do limite de eventos. Se isso acontece regularmente antes do fim do mês, é o momento natural de upgrade.</p>
        <p><strong>Sinal 2 — Retenção:</strong> você tentou responder uma pergunta mas os dados já expiraram. Frases como "quero ver o que aconteceu há 20 dias" no plano Starter (15 dias) são o sinal mais claro de que o plano Growth (30 dias) vai entregar valor imediato.</p>
        <div class="callout callout-info">Outros sinais: você precisou criar um segundo projeto e bateu o limite; você quer configurar mais de 5 alertas; ou seu time cresceu e mais pessoas precisam de acesso.</div>
        <p>O upgrade é instantâneo, sem migração de dados — todos os eventos existentes permanecem acessíveis no novo limite de retenção.</p>`,
      },
      {
        q: 'O que é retenção de dados e por que ela importa?',
        a: `<p>Retenção é por quanto tempo seus eventos ficam disponíveis para consulta. Depois desse período, os dados são removidos automaticamente.</p>
        <p>Na prática, retenção define quais perguntas você consegue responder:</p>
        <p>— <strong>15 dias:</strong> "como foi essa semana vs. a anterior?" — comparação de ciclos curtos.</p>
        <p>— <strong>30 dias:</strong> "o que mudou depois do deploy de duas semanas atrás?" — análise de impacto de releases e tendências mensais.</p>
        <p>— <strong>60 dias:</strong> "qual a tendência de latência do último bimestre?" — visibilidade estratégica, análise de sazonalidade.</p>
        <div class="callout callout-warn">Retenção não pode ser aplicada retroativamente. Se você ficou no plano de 15 dias por 2 meses, os eventos anteriores aos 7 dias já foram removidos — o upgrade para 30 dias valerá apenas para novos eventos a partir da mudança.</div>`,
      },
  
      {
        q: 'Vários desenvolvedores do meu time podem acessar o mesmo projeto?',
        a: `<p>Sim. Cada projeto suporta múltiplos membros de time com roles distintas:</p>
        <p>— <strong>Owner:</strong> acesso total, incluindo billing, deleção de projeto e gestão de membros.</p>
        <p>— <strong>Admin:</strong> acesso total ao produto, sem acesso a billing e deleção.</p>
        <p>— <strong>Member:</strong> acesso de leitura e configuração de alertas, sem gestão de chaves de API ou membros.</p>
        <div class="callout callout-info">O número de membros por projeto não é limitado por plano hoje. RBAC granular (permissões por projeto, por feature) está no roadmap Enterprise.</div>`,
      },
      {
        q: 'O que é o plano Enterprise e quando faz sentido?',
        a: `<p>O plano Enterprise é para times que cresceram além do plano Business em pelo menos uma dessas dimensões:</p>
        <p>— Uso consistente acima de 200M eventos/mês por dois ou mais meses</p>
        <p>— Necessidade de compliance documentado (SOC2, LGPD audit, relatórios de acesso)</p>
        <p>— SSO/SAML para gestão centralizada de acessos</p>
        <p>— Múltiplos produtos ou unidades de negócio com billing separado</p>
        <p>— SLA contratual com créditos financeiros</p>
        <p>— Retenção de dados customizada (até 1 ano)</p>
        <p>— Faturamento por CNPJ com condições de pagamento personalizadas</p>
        <div class="callout callout-info">Se você está no plano Growth e seu overage mensal regularmente ultrapassa R$500, ou seu time cresceu para mais de 15 engenheiros, faz sentido conversar sobre Enterprise.</div>`,
      },
    ],
  },
  {
    cat: 'produto',
    catLabel: 'Produto',
    items: [
      
      {
        q: 'Qual é a latência de ingestão e de query no Pantor?',
        a: `<p>Dois números que definem a experiência:</p>
        <p><strong>Latência de ingestão:</strong> eventos ficam visíveis no painel em menos de 5 segundos após o envio em condições normais. O pipeline de ingestão é assíncrono — o SDK não bloqueia a sua request para aguardar confirmação.</p>
        <div class="callout callout-info">O Pantor usa ClickHouse como engine de armazenamento e query — o mesmo banco usado por empresas como Cloudflare e Uber para analytics de alta velocidade. Para wide events, a performance de leitura é significativamente melhor do que soluções baseadas em Elasticsearch ou PostgreSQL.</div>`,
      },
      {
        q: 'Meus dados estão seguros? Onde ficam armazenados?',
        a: `<p>Os dados são armazenados em infraestrutura AWS na região <strong>sa-east-1 (São Paulo)</strong>, garantindo que os dados de clientes brasileiros permaneçam em território nacional.</p>
        <p>Mecanismos de segurança atuais:</p>
        <p>— Autenticação por API key com isolamento por projeto</p>
        <p>— Comunicação criptografada (TLS em trânsito)</p>
        <p>— Criptografia em repouso no armazenamento</p>
        <p>— Sem compartilhamento de dados entre contas</p>
        <div class="callout callout-warn">O Pantor está em fase MVP. Certificações formais de compliance (SOC2, ISO 27001) e funcionalidades avançadas de segurança (RBAC granular, logs de auditoria de acesso, SSO) são parte do roadmap Enterprise. Se sua empresa já requer essas certificações hoje, entre em contato antes de integrar.</div>`,
      },
      {
        q: 'Posso exportar meus dados? O que acontece se eu cancelar?',
        a: `<p>Sim. Você pode exportar todos os seus eventos em formato JSON ou CSV a qualquer momento pelo painel, sem custo adicional.</p>
        <p>Ao cancelar:</p>
        <p>— Sua conta permanece ativa até o fim do ciclo de billing vigente</p>
        <p>— Você tem 30 dias após o cancelamento para exportar os dados restantes</p>
        <p>— Após 30 dias, os dados são removidos permanentemente</p>
        <div class="callout callout-tip">Não temos interesse em te prender por lock-in de dados. Se o Pantor parar de fazer sentido para o seu estágio, o processo de saída deve ser tão simples quanto o de entrada.</div>`,
      },
      {
        q: 'O Pantor tem suporte em português? Como funciona o suporte?',
        a: `<p>Sim. Todo o suporte é em português por padrão para clientes brasileiros.</p>
        <div class="callout callout-info">A melhor forma de suporte é uma boa documentação. Estamos investindo em docs e exemplos de integração em português — se algo estiver faltando ou confuso, entre em contato conosco.</div>`,
      },
      {
        q: 'O que está no roadmap? ',
        a: `<p>O MVP foi construído para resolver um problema específico com excelência: dar visibilidade real de produção a times que não têm nada hoje, com setup mínimo e custo previsível. O que está fora do escopo intencional agora:</p>
        <p>O que está planejado para v2.0:</p>
        <p><span class="badge badge-success">v2.0</span> Resumo automático de incidentes com IA, root-cause analysis, busca por linguagem natural sobre seus eventos, API expressiva para agentes (Claude, Gemini) consumirem telemetria diretamente, suporte nativo a MCP.</p>
        <div class="callout callout-tip">O roadmap é público. Wide events são o input ideal para LLMs — o que o Pantor coleta hoje é exatamente o contexto que um agente precisaria para entender o comportamento do seu sistema em produção.</div>`,
      },
    ],
  },
]

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'conceito', label: 'Conceito' },
  { id: 'integracao', label: 'Integração' },
  { id: 'billing', label: 'Billing' },
  { id: 'planos', label: 'Planos' },
  { id: 'produto', label: 'Produto' },
]

// Accordion item with smooth height animation
function AccordionItem({
  item,
  itemKey,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  itemKey: string
  isOpen: boolean
  onToggle: () => void
}) {
  const answerRef = useRef<HTMLDivElement>(null)

  return (
    <div className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
      <button
        className={styles.question}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${itemKey}`}
      >
        <span className={styles.questionText}>{item.q}</span>
        <span className={styles.icon} aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M5 1v8M1 5h8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      <div
        id={`faq-answer-${itemKey}`}
        className={styles.answerWrap}
        role="region"
      >
        <div ref={answerRef} className={styles.answerInner}>
          <div
            className={styles.answerContent}
            dangerouslySetInnerHTML={{ __html: item.a }}
          />
        </div>
      </div>
    </div>
  )
}

export default function PantorFAQ() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const filteredSections = FAQ_DATA.filter(
    (s) => activeCategory === 'all' || s.cat === activeCategory
  )
    .map((s) => ({
      ...s,
      items: s.items.filter((item) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
          item.q.toLowerCase().includes(term) ||
          item.a.toLowerCase().includes(term)
        )
      }),
    }))
    .filter((s) => s.items.length > 0)

  const totalResults = filteredSections.reduce(
    (acc, s) => acc + s.items.length,
    0
  )

  // Reset open items on search/filter change
  useEffect(() => {
    setOpenItems(new Set())
  }, [activeCategory, searchTerm])

  return (
    <section className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>faq</p>
        <h2 className={styles.title}>Perguntas frequentes</h2>
        <p className={styles.subtitle}>
          Tudo que você precisa saber antes de integrar.
        </p>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <svg
          className={styles.searchIcon}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M9.5 9.5L13 13"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar pergunta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar perguntas frequentes"
        />
        {searchTerm && (
          <button
            className={styles.searchClear}
            onClick={() => setSearchTerm('')}
            aria-label="Limpar busca"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1 1l8 8M9 1L1 9"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Categorias">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className={styles.sections}>
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <div key={section.cat} className={styles.section}>
              <p className={styles.sectionLabel}>{section.catLabel}</p>
              <div className={styles.itemList}>
                {section.items.map((item, idx) => {
                  const key = `${section.cat}-${idx}`
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      itemKey={key}
                      isOpen={openItems.has(key)}
                      onToggle={() => toggleItem(key)}
                    />
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p className={styles.noResultsText}>Nenhuma pergunta encontrada.</p>
          </div>
        )}
      </div>

    
    </section>
  )
}
