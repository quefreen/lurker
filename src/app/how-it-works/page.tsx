import { SiteNavSmart } from '@/components/SiteNavSmart';
import { SiteFooter } from '@/components/SiteFooter';

const GEIST  = "'Geist', sans-serif"
const BARLOW = "'Barlow Condensed', sans-serif"
const SORA   = "'Sora', sans-serif"

const CARD_BG = 'linear-gradient(to bottom, rgba(31,33,20,0.8) 0%, rgba(15,16,10,0.8) 57.21%)'

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: BARLOW, fontWeight: 600, fontSize: '14px', color: '#d9ff00', lineHeight: 'normal' }}>
      {children}
    </p>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '32px', color: '#ffffff', lineHeight: 1.1 }}>
      {children}
    </p>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: GEIST, fontWeight: 400, fontSize: '16px', color: '#b5b5b5', lineHeight: 1.7 }}>
      {children}
    </p>
  )
}

function Term({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: GEIST, fontWeight: 600, color: '#ffffff' }}>{children}</span>
  )
}

function ConceptCard({ label, title, body }: { label: string; title: string; body: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-4 rounded border border-[#2b2b2b] p-6"
      style={{ background: CARD_BG }}
    >
      <SectionLabel>{label}</SectionLabel>
      <p style={{ fontFamily: SORA, fontWeight: 600, fontSize: '20px', color: '#ffffff', lineHeight: 1.2 }}>
        {title}
      </p>
      <Body>{body}</Body>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <main style={{ background: '#0F100A', minHeight: '100vh' }}>
      <SiteNavSmart background="#0F100A" />

      <div className="mx-auto px-[24px]" style={{ maxWidth: '996px' }}>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-6 pt-[96px] pb-[80px]">
          <SectionLabel>Guia de Uso</SectionLabel>
          <Heading>Bem-vindo ao Lurker.gg</Heading>
          <div style={{ maxWidth: '720px' }}>
            <Body>
              Nossa plataforma foi desenhada para transformar o modo como você analisa o cenário
              competitivo de CS2, saindo da intuição para uma abordagem puramente baseada em dados.
              Para extrair o máximo das nossas ferramentas e do nosso dashboard, é essencial dominar
              os conceitos básicos que guiam as métricas do mercado.
            </Body>
          </div>
        </section>

        <div style={{ height: '1px', background: '#2b2b2b' }} />

        {/* ── Gestão de Capital ─────────────────────────────────────────────── */}
        <section className="flex flex-col gap-8 py-[80px]">
          <div className="flex flex-col gap-2">
            <SectionLabel>Gestão de Capital</SectionLabel>
            <Heading>A base de tudo começa aqui.</Heading>
          </div>
          <Body>
            Tudo começa com a forma como você gerencia o seu capital. A <Term>Unidade</Term> é a
            medida padrão de segurança usada para proteger a sua banca a longo prazo. Em vez de
            focarmos em valores financeiros fixos, usamos as unidades — geralmente equivalentes a
            1% do seu capital total — para padronizar o desempenho e permitir comparações objetivas
            de resultados, independentemente do tamanho do investimento.
          </Body>
          <div className="grid grid-cols-2 gap-6">
            <ConceptCard
              label="Unidade"
              title="Seu referencial fixo"
              body={
                <>
                  A unidade é equivalente a <Term>1% do seu capital total</Term>. Ela padroniza o
                  desempenho e permite comparações objetivas de resultados independentemente do
                  tamanho do investimento.
                </>
              }
            />
            <ConceptCard
              label="Stake"
              title="Seu nível de confiança"
              body={
                <>
                  A stake é o "peso" ou volume de unidades que você aplica em uma leitura específica.
                  Uma entrada normal usa <Term>1 unidade</Term>; um cenário de altíssimo valor
                  matemático pode justificar <Term>1.5 ou 2 unidades</Term>.
                </>
              }
            />
          </div>
        </section>

        <div style={{ height: '1px', background: '#2b2b2b' }} />

        {/* ── Valor Esperado ────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-8 py-[80px]">
          <div className="flex flex-col gap-2">
            <SectionLabel>Encontrando Valor</SectionLabel>
            <Heading>A lógica por trás do lucro sustentável.</Heading>
          </div>
          <Body>
            Com a gestão alinhada, o objetivo principal do Lurker.gg é ajudar você a encontrar o{' '}
            <Term>EV+ (Valor Esperado Positivo)</Term>. Nossa análise serve para identificar quando
            as cotações do mercado estão pagando mais do que a probabilidade real de o evento
            acontecer. É essa busca constante pelo EV+ que garante o seu sucesso a longo prazo.
          </Body>
          <div className="grid grid-cols-3 gap-6">
            <ConceptCard
              label="EV+"
              title="Valor Esperado Positivo"
              body="Quando as cotações do mercado pagam mais do que a probabilidade real do evento. Identificar EV+ de forma consistente é o único caminho para resultados sustentáveis."
            />
            <ConceptCard
              label="ROI"
              title="Return on Investment"
              body="A métrica que mostra a relação real entre o lucro obtido e o total que foi investido. É o indicador definitivo de performance a longo prazo."
            />
            <ConceptCard
              label="Win Rate vs. Rentabilidade"
              title="Quebrando o mito"
              body={
                <>
                  Focar apenas na taxa de acerto é um erro. Uma win rate de{' '}
                  <Term>45%</Term> pode ser extremamente lucrativa se você estiver explorando
                  consistentemente oportunidades de alto valor (EV+).
                </>
              }
            />
          </div>
        </section>

        <div style={{ height: '1px', background: '#2b2b2b' }} />

        {/* ── Mercados ──────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-8 py-[80px]">
          <div className="flex flex-col gap-2">
            <SectionLabel>Mercados</SectionLabel>
            <Heading>Onde a teoria encontra a prática.</Heading>
          </div>
          <Body>
            Todo esse referencial teórico é aplicado na leitura das partidas e seus mercados.
            Cada mercado tem uma lógica própria — entender essa lógica é o que separa uma entrada
            fundamentada de uma aposta no escuro.
          </Body>

          {/* Total Maps */}
          <div className="flex flex-col gap-4 rounded border border-[#2b2b2b] p-6" style={{ background: CARD_BG }}>
            <SectionLabel>Total Maps</SectionLabel>
            <p style={{ fontFamily: SORA, fontWeight: 600, fontSize: '20px', color: '#ffffff' }}>
              Duração da série, não o vencedor
            </p>
            <Body>
              A análise foca na duração de uma série (MD3 ou MD5), projetando apenas a quantidade
              de mapas que serão jogados, sem se importar com quem será o vencedor. Uma análise de{' '}
              <Term>"Over 2.5 Maps"</Term> em uma MD3 indica a expectativa de uma série tão acirrada
              que forçará a disputa do terceiro e decisivo mapa.
            </Body>
          </div>

          {/* Handicap */}
          <div className="flex flex-col gap-4 rounded border border-[#2b2b2b] p-6" style={{ background: CARD_BG }}>
            <SectionLabel>Handicap</SectionLabel>
            <p style={{ fontFamily: SORA, fontWeight: 600, fontSize: '20px', color: '#ffffff' }}>
              Equilíbrio matemático do confronto
            </p>
            <Body>
              O handicap entra para equilibrar matematicamente um confronto, aplicando uma vantagem
              ou desvantagem virtual — em mapas ou em rounds. Um time com{' '}
              <Term>Handicap -1.5</Term> em uma MD3 precisa vencer por <Term>2 a 0</Term> de forma
              limpa para superar a desvantagem. Em um mapa específico, um{' '}
              <Term>Handicap -2.5 rounds</Term> significa que a equipe começa com déficit virtual e
              precisa vencer com diferença de pelo menos 3 rounds.
            </Body>
          </div>

          {/* Over/Under Rounds */}
          <div className="flex flex-col gap-4 rounded border border-[#2b2b2b] p-6" style={{ background: CARD_BG }}>
            <SectionLabel>Over / Under Rounds</SectionLabel>
            <p style={{ fontFamily: SORA, fontWeight: 600, fontSize: '20px', color: '#ffffff' }}>
              O quão disputado será o mapa — formato MR12
            </p>
            <Body>
              Focado no formato <Term>MR12</Term> atual do CS2, este mercado analisa o quão
              disputado será um único mapa, olhando apenas para o placar total e ignorando qual
              equipe sairá vitoriosa. Uma leitura de <Term>"Over 21.5 Rounds"</Term> significa que
              o mapa precisa ter pelo menos 22 rounds disputados (exigindo um placar de 13×9 ou
              mais apertado). É a métrica ideal para quando os dados indicam um confronto
              extremamente parelho.
            </Body>
          </div>
        </section>

        <div style={{ height: '1px', background: '#2b2b2b' }} />

        {/* ── Closing ───────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-6 py-[80px]" style={{ maxWidth: '720px' }}>
          <SectionLabel>Próximo nível</SectionLabel>
          <Body>
            Compreender, acompanhar e cruzar esses conceitos com os dados fornecidos pelo
            Lurker.gg é o que colocará a sua análise em um nível profissional e sustentável.
          </Body>
        </section>

      </div>

      <div style={{ height: '128px', background: '#0F100A' }} />
      <SiteFooter />
    </main>
  )
}
