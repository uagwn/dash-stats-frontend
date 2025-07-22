"use client"
import { useEffect, useState } from "react"
import { teams_logos } from "../src/teamsLogos"
import Link from "next/link";

interface TeamData {
  id: string
  name: string
  league: string
  season: string
}

interface ComparisonData {
  resumo: {
    partidas: number[]
    vitorias: number[]
    derrotas: number[]
    empates: number[]
    taxa_vitoria: number[]
    golsMarcados: number[]
    golsSofridos: number[]
    assistencias: number[]
  }
  ataque: {
    golsPorPartida: number[]
    chutesPorPartida: number[]
    relacaoChutesGols: number[]
    penaltisPorPartida: number[]
  }
  passe: {
    passesCompletos: number[]
    posseDeBola: number[]
    cruzamentosPorPartida: number[]
    passesCostaPorPartida: number[]
    impedimentosPorPartida: number[]
  }
  defesa: {
    golsSofridosPorPartida: number[]
    interceptacoes: number[]
    bloqueiosChutes: number[]
    bloqueiosPasses: number[]
    erros: number[]
  }
  outros: {
    desarme: number[]
    faltas: number[]
    cartoesAmarelos: number[]
    cartoesVermelhos: number[]
    impedimentos: number[]
    recuperacaoBola: number[]
    escanteios: number[]
  }
}

export default function ComparisonStats({
  team1Id,
  team2Id,
  season,
  round,
}: {
  team1Id: string
  team2Id: string
  season: string
  round: string
}) {
  const [loading, setLoading] = useState(true)
  const [team1, setTeam1] = useState<TeamData | null>(null)
  const [team2, setTeam2] = useState<TeamData | null>(null)
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)

  const getTeamLogo = (teamName: string) => {
    const team = teams_logos.find((t) => t.name.toLowerCase() === teamName.toLowerCase())
    return team ? team.logo : null
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const team1Name = decodeURIComponent(team1Id)
          .replace(/ /g, "-")
          .replace(/á/g, "a")
          .replace(/é/g, "e")
          .replace(/í/g, "i")
          .replace(/ó/g, "o")
          .replace(/ú/g, "u")
        const team2Name = decodeURIComponent(team2Id)
          .replace(/ /g, "-")
          .replace(/á/g, "a")
          .replace(/é/g, "e")
          .replace(/í/g, "i")
          .replace(/ó/g, "o")
          .replace(/ú/g, "u")
        const comp = decodeURIComponent(round)
          .replace(/ /g, "-")
          .replace(/á/g, "a")
          .replace(/é/g, "e")
          .replace(/í/g, "i")
          .replace(/ó/g, "o")
          .replace(/ú/g, "u")

        const team1NameDisplay = decodeURIComponent(team1Id)
        const team2NameDisplay = decodeURIComponent(team2Id)
        
        const season = "2025"
        const apiUrl = "https://3fwc3rm2jr.us-east-2.awsapprunner.com"

        const response = await fetch(`${apiUrl}/api/compare_teams/${team1Name}/${team2Name}/${comp}/${season}`, {
          headers: {
          'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
        }}
        )
        
        const data = await response.json()
        console.log("data", data)

        setTeam1({
          id: team1Id,
          name: team1NameDisplay,
          logo: getTeamLogo(team1NameDisplay),
          league: data[team2Name].comp,
          season: season,
        })

        setTeam2({
          id: team2Id,
          name: team2NameDisplay,
          logo: getTeamLogo(team2NameDisplay),
          league: data[team2Name].comp,
          season: season,
        })

        setComparisonData({
          resumo: {
            partidas: [data[team1Name].total_partidas, data[team2Name].total_partidas],
            vitorias: [data[team1Name].total_vitorias, data[team2Name].total_vitorias],
            taxa_vitoria: [data[team1Name].pct_vitorias, data[team2Name].pct_vitorias],
            derrotas: [data[team1Name].total_derrotas, data[team2Name].total_derrotas],
            empates: [data[team1Name].total_empates, data[team2Name].total_empates],
            golsMarcados: [data[team1Name].total_gols_feitos, data[team2Name].total_gols_feitos],
            golsSofridos: [data[team1Name].total_gols_sofridos, data[team2Name].total_gols_sofridos],
            assistencias: [data[team1Name].avg_ast, data[team2Name].avg_ast],
          },
          ataque: {
            golsPorPartida: [data[team1Name].avg_gf, data[team2Name].avg_gf],
            chutesPorPartida: [data[team1Name].avg_sot, data[team2Name].avg_sot],

            relacaoChutesGols: [
              (data[team1Name].avg_sot / data[team1Name].avg_gf).toFixed(2),
              (data[team2Name].avg_sot / data[team2Name].avg_gf).toFixed(2),
            ],
            penaltisPorPartida: [data[team1Name].avg_pkwon, data[team2Name].avg_pkwon],
          },

          passe: {
            passesCompletos: [data[team1Name].avg_cmpt, data[team2Name].avg_cmpt],
            posseDeBola: [data[team1Name].media_poss, data[team2Name].media_poss],
            cruzamentosPorPartida: [data[team1Name].avg_crs, data[team2Name].avg_crs],
          },

          defesa: {
            golsSofridosPorPartida: [data[team1Name].avg_ga, data[team2Name].avg_ga],
            interceptacoes: [data[team1Name].avg_int, data[team2Name].avg_int],
            bloqueiosChutes: [data[team1Name].avg_shb, data[team2Name].avg_shb],
            bloqueiosPasses: [data[team1Name].avg_passb, data[team2Name].avg_passb],
            erros: [data[team1Name].avg_err, data[team2Name].avg_err],
          },

          outros: {
            desarme: [data[team1Name].avg_tklw, data[team2Name].avg_tklw],
            faltas: [data[team1Name].avg_fls, data[team2Name].avg_fls],
            cartoesAmarelos: [data[team1Name].avg_crdy, data[team2Name].avg_crdy],
            cartoesVermelhos: [data[team1Name].avg_crdr, data[team2Name].avg_crdr],
            impedimentos: [data[team1Name].avg_off, data[team2Name].avg_off],
            recuperacaoBola: [data[team1Name].avg_recov, data[team2Name].avg_recov],
            escanteios: [data[team1Name].avg_ck, data[team2Name].avg_ck],
          },
        })

        setLoading(false)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [team1Id, team2Id, season])

  if (loading) {
    return <div className="w-full h-[600px] bg-[#181818] animate-pulse rounded-lg"></div>
  }

  if (!team1 || !team2 || !comparisonData) {
    return <div className="text-center p-6">Dados não disponíveis</div>
  }
  console.log("comparasion data", team1)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[#1E1E1E] rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/team/${team1.name.replace(/ /g, "-")}/${team1.league.replace(/ /g, "-")}`}
            className="group"
          >
            <img
              src={team1.logo || "/placeholder.svg"}
              alt={team1.name}
              className="h-8 rounded-full cursor-pointer group-hover:scale-105 transition"
            />
          </Link>
          <div>
            <Link
              href={`/team/${team1.name.replace(/ /g, "-")}/${team1.league.replace(/ /g, "-")}`}
              className="font-bold hover:underline"
            >
              <h3>{team1.name.replace(/-/g, " ")}</h3>
            </Link>
            <p className="text-xs text-gray-400">
              {team1.league.replace(/-/g, " ")} • {team1.season}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <Link
              href={`/team/${team2.name.replace(/ /g, "-")}/${team2.league.replace(/ /g, "-")}`}
              className="font-bold hover:underline"
            >
              <h3>{team2.name.replace(/-/g, " ")}</h3>
            </Link>
            <p className="text-xs text-gray-400">
              {team2.league.replace(/-/g, " ")} • {team2.season}
            </p>
          </div>
          <Link
            href={`/team/${team2.name.replace(/ /g, "-")}/${team2.league.replace(/ /g, "-")}`}
            className="group"
          >
            <img
              src={team2.logo || "/placeholder.svg"}
              alt={team2.name}
              className="h-8 rounded-full cursor-pointer group-hover:scale-105 transition"
            />
          </Link>
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="text-center text-lg font-bold py-2 border-b border-gray-800">Resumo</div>
        <div className="p-2">
          <StatRow label="Partidas" values={comparisonData.resumo.partidas} />
          <StatRow label="Vitórias" values={comparisonData.resumo.vitorias} />
          <StatRow label="% De vitória" values={comparisonData.resumo.taxa_vitoria} />
          <StatRow label="Derrotas" values={comparisonData.resumo.derrotas} />
          <StatRow label="Empates" values={comparisonData.resumo.empates} />
          <StatRow label="Gols Marcados" values={comparisonData.resumo.golsMarcados} />
          <StatRow label="Gols Sofridos" values={comparisonData.resumo.golsSofridos} />
          <StatRow label="Assistências p/partida" values={comparisonData.resumo.assistencias} />
        </div>
      </div>

      {/* Ataque */}
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <h1 className="text-center text-lg mb-[0px] font-bold mt-1">Ataques</h1>
        <h3 className="text-center mt-[0px] text-[10px]">dados por partida</h3>

       
        
        <div className="p-2">
          <StatRow label="Gols" values={comparisonData.ataque.golsPorPartida} />
          <StatRow label="Chutes no Gol" values={comparisonData.ataque.chutesPorPartida} />
          <StatRow label="Relação Chutes no gol/Gols" values={comparisonData.ataque.relacaoChutesGols} />
          <StatRow label="Penâltis" values={comparisonData.ataque.penaltisPorPartida} />
        </div>
      </div>

      {/* Passe */}
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="text-center text-lg font-bold py-2 border-b border-gray-800">Passe</div>
        <div className="p-2">
          <StatRow label="Passes Completos" values={comparisonData.passe.passesCompletos} />
          <StatRow label="Posse de Bola" values={comparisonData.passe.posseDeBola} />
          <StatRow label="Cruzamentos" values={comparisonData.passe.cruzamentosPorPartida} />
        </div>
      </div>

      {/* Defesa */}
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="text-center text-lg font-bold py-2 border-b border-gray-800">Defesa</div>
        <div className="p-2">
          <StatRow label="Gols Sofridos" values={comparisonData.defesa.golsSofridosPorPartida} />
          <StatRow label="Interceptações" values={comparisonData.defesa.interceptacoes} />
          <StatRow label="Bloqueios de Chutes" values={comparisonData.defesa.bloqueiosChutes} />
          <StatRow label="Bloqueios de Passes" values={comparisonData.defesa.bloqueiosPasses} />
          <StatRow label="Erros" values={comparisonData.defesa.erros} />
        </div>
      </div>

      {/* Outros */}
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="text-center text-lg font-bold py-2 border-b border-gray-800">Outros</div>
        <div className="p-2">
          <StatRow label="Desarmes" values={comparisonData.outros.desarme} />
          <StatRow label="Faltas" values={comparisonData.outros.faltas} />
          <StatRow label="Cartões Amarelos" values={comparisonData.outros.cartoesAmarelos} />
          <StatRow label="Cartões Vermelhos" values={comparisonData.outros.cartoesVermelhos} />
          <StatRow label="Impedimentos" values={comparisonData.outros.impedimentos} />
          <StatRow label="Recuperações de Bola" values={comparisonData.outros.recuperacaoBola} />
          <StatRow label="Escanteios" values={comparisonData.outros.escanteios} />
        </div>
      </div>
    </div>
  )
}

const StatRow = ({ label, values }: { label: string; values: number[] }) => {
  
  const value1IsHigher = values[0] > values[1]
  const value2IsHigher = values[1] > values[0]

  return (
    <div className="flex text-sm justify-between items-center py-1 border-b border-gray-800 last:border-0">
      <div className="w-16 ml-10 text-center">
        {value1IsHigher ? (
          <span className="inline-block px-1 py-1 bg-green-500/20 border border-green-500 rounded-md">{values[0]}</span>
        ) : (
          values[0]
        )}
      </div>
      <div className="flex-1 text-center text-sm">{label}</div>
      <div className="w-16 mr-10 text-center">
        {value2IsHigher ? (
          <span className="inline-block px-1 py-1 bg-green-500/20 border border-green-500 rounded-md">{values[1]}</span>
        ) : (
          values[1]
        )}
      </div>
    </div>
  )
}

