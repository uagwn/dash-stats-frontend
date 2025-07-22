"use client"

import { useState, useEffect, use } from "react"
import { teams_logos } from "@/app/src/teamsLogos"

interface TeamData {
  name: string
  country: string
  logo?: string
  competition: string
  standings: {
    position: number
    played: number
    won: number
    drawn: number
    lost: number
    points: number
  }
  leagueStandings: {
    [key: string]: {
      Attendance: string
      D: string
      GA: string
      GD: string
      GF: string
      Goalkeeper: string
      L: string
      "Last 5": string
      MP: string
      Notes: string
      Pts: string
      "Pts/MP": string
      Squad: string
      "Top Team Scorer": string
      W: string
      xG: string
      xGA: string
      xGD: string
      "xGD/90": string
    }
  }
  recentMatches: {
    date: string
    time: string
    home: string
    away: string
    score: string
    result: string
  }[]
  players: {
    variados: { name: string; games: number; goals: number; cards: { yellow: number; red: number } }[]
    assists: { name: string; games: number; assists: number }[]
    artilheiros: { name: string; goals: number; games: number; cards: { yellow: number; red: number } }[]
  }
  seasonStats: {
    matches: number
    wins: { count: number; percentage: number }
    losses: { count: number; percentage: number }
    draws: { count: number; percentage: number }
    shots: number
    shotsOnGoal: number
    goalsScored: number
    corners: number
  }
  seasonHighlights: {
    formation: string
    formationPercentage: number
    shotToGoalRatio: string
    winStreak: number
    avgWinStreak: number
    attack: { value: string; goalsPerGame: number }
    defense: { value: string; goalsConcededPerGame: number }
  }
  matchAverages: {
    goalsScored: number
    goalsConceded: number
    shots: number
    shotsOnTarget: number
    shotsOffTarget: number
    corners: number
    fouls: number
    offsides: number
  }
  winProbability: {
    nextGame: number
    home: number
    away: number
  }
}

// Interface para os dados da API de partidas recentes
interface RecentMatchData {
  date: string
  ga: string
  gf: string
  opponent: string
  result: string
  time: string
}

export default function TeamPage({ params }: { params: Promise<{ teamId: string; compId: string }> }) {
  const resolvedParams = use(params)
  const teamId = decodeURIComponent(resolvedParams.teamId)
  const compId = decodeURIComponent(resolvedParams.compId)

  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("artilheiros")
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [recentMatches, setRecentMatches] = useState<RecentMatchData[]>([])

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true)
        const decodedTeamName = teamId
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        let leagueStandings = {}

          const apiCompId = compId

          console.log(`Buscando tabela da API: ${apiBaseUrl}/table/${apiCompId}`)
          const tableResponse = await fetch(`${apiBaseUrl}/table/${apiCompId}`)
          

          if (tableResponse.ok) {
            leagueStandings = await tableResponse.json()
            setDebugInfo((prev) => [...prev, `Tabela obtida com sucesso: ${Object.keys(leagueStandings).length} times`])
          } else {
            setDebugInfo((prev) => [...prev, `Erro ao buscar tabela: ${tableResponse.status}`])
          }
        } catch (error) {
          setDebugInfo((prev) => [
            ...prev,
            `Erro na requisição da tabela: ${error instanceof Error ? error.message : String(error)}`,
          ])
        }

        
        setTeamData({
          name: decodedTeamName,
          country: countryMap[compId] || "Internacional",
          competition: compId.split("-").join(" "),
          leagueStandings: leagueStandings,
          standings: {
            position: 5,
            played: 35,
            won: 10,
            drawn: 10,
            lost: 10,
            points: 50,
          },
          recentMatches: [
            { date: "21/03/2025", time: "16:00", home: decodedTeamName, away: "Barcelona", score: "1-0", result: "W" },
            {
              date: "08/03/2025",
              time: "13:30",
              home: "Atletico Madrid",
              away: decodedTeamName,
              score: "0-1",
              result: "W",
            },
            { date: "04/03/2025", time: "16:00", home: decodedTeamName, away: "Sevilla", score: "1-0", result: "W" },
          ],
          players: {
            variados: [
              { name: "Vinicius Jr", games: 7, goals: 1, cards: { yellow: 7, red: 7 } },
              { name: "Rodrygo", games: 7, goals: 1, cards: { yellow: 7, red: 7 } },
              { name: "Bellingham", games: 7, goals: 1, cards: { yellow: 7, red: 7 } },
              { name: "Modric", games: 7, goals: 1, cards: { yellow: 7, red: 7 } },
              { name: "Kroos", games: 7, goals: 1, cards: { yellow: 7, red: 7 } },
              { name: "Valverde", games: 7, goals: 1, cards: { yellow: 7, red: 7 } },
              { name: "Camavinga", games: 7, goals: 1, cards: { yellow: 7, red: 7 } },
              { name: "Militão", games: 7, goals: 1, cards: { yellow: 7, red: 7 } },
              { name: "Alaba", games: 7, goals: 1, cards: { yellow: 7, red: 7 } },
            ],
            assists: [
              { name: "Vinicius Jr", games: 7, assists: 1 },
              { name: "Rodrygo", games: 7, assists: 1 },
              { name: "Bellingham", games: 7, assists: 1 },
              { name: "Modric", games: 7, assists: 1 },
              { name: "Kroos", games: 7, assists: 1 },
              { name: "Valverde", games: 7, assists: 1 },
              { name: "Camavinga", games: 7, assists: 1 },
              { name: "Militão", games: 7, assists: 1 },
              { name: "Alaba", games: 7, assists: 1 },
            ],
            artilheiros: [
              { name: "Vinicius Jr", goals: 7, games: 7, cards: { yellow: 7, red: 7 } },
              { name: "Rodrygo", goals: 7, games: 7, cards: { yellow: 7, red: 7 } },
              { name: "Bellingham", goals: 7, games: 7, cards: { yellow: 7, red: 7 } },
              { name: "Modric", goals: 7, games: 7, cards: { yellow: 7, red: 7 } },
              { name: "Kroos", goals: 7, games: 7, cards: { yellow: 7, red: 7 } },
              { name: "Valverde", goals: 7, games: 7, cards: { yellow: 7, red: 7 } },
              { name: "Camavinga", games: 7, goals: 7, cards: { yellow: 7, red: 7 } },
              { name: "Militão", games: 7, goals: 7, cards: { yellow: 7, red: 7 } },
              { name: "Alaba", goals: 7, games: 7, cards: { yellow: 7, red: 7 } },
            ],
          },
          seasonStats: {
            matches: 38,
            wins: { count: 38, percentage: 39.2 },
            losses: { count: 38, percentage: 10.5 },
            draws: { count: 38, percentage: 50.1 },
            shots: 10,
            shotsOnGoal: 3,
            goalsScored: 2,
            corners: 5,
          },
          seasonHighlights: {
            formation: "4-3-3",
            formationPercentage: 53,
            shotToGoalRatio: "3:1",
            winStreak: 3,
            avgWinStreak: 4.4,
            attack: {
              value: "7ª",
              goalsPerGame: 44,
            },
            defense: {
              value: "7ª",
              goalsConcededPerGame: 44,
            },
          },
          matchAverages: {
            goalsScored: 9,
            goalsConceded: 5,
            shots: 8,
            shotsOnTarget: 6,
            shotsOffTarget: 7,
            corners: 5,
            fouls: 5,
            offsides: 4,
          },
          winProbability: {
            nextGame: 56,
            home: 56,
            away: 56,
          },
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching team data:", error)
        setDebugInfo((prev) => [...prev, `Erro geral: ${error instanceof Error ? error.message : String(error)}`])
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [teamId, compId, apiBaseUrl,apiCompId])

  const getTeamLogo = (teamName: string) => {
    const teamData = teams_logos.find((t) => t.name.toLowerCase() === teamName.toLowerCase())
    return teamData ? teamData.logo : null
  }

  const findTeamPosition = () => {
    if (!teamData || !teamData.leagueStandings) return null

    const entry = Object.entries(teamData.leagueStandings).find(([_, team]) => team.Squad === teamData.name)

    return entry ? entry[0] : null
  }

  const getTeamStandingData = () => {
    if (!teamData || !teamData.leagueStandings) return null

    return Object.values(teamData.leagueStandings).find((team) => team.Squad === teamData.name)
  }

  const getFilteredStandings = () => {
    if (!teamData || !teamData.leagueStandings) return []

    // Converter para array para facilitar a manipulação
    const standingsArray = Object.entries(teamData.leagueStandings)

    // Encontrar a posição do time atual na tabela
    const teamPosition = standingsArray.findIndex(([_, team]) => team.Squad === teamData.name)

    if (teamPosition === -1) return standingsArray.slice(0, 10)

    // Queremos mostrar 10 times no total, com o time atual centralizado
    // Isso significa aproximadamente 4-5 times acima e 4-5 abaixo

    // Calcular quantos times mostrar acima e abaixo
    const teamsAbove = Math.min(4, teamPosition)
    const teamsBelow = Math.min(9 - teamsAbove, standingsArray.length - teamPosition - 1)

    // Recalcular times acima se não tivermos times suficientes abaixo
    const adjustedTeamsAbove = Math.min(9 - teamsBelow, teamPosition)

    // Calcular os índices de início e fim
    const startIndex = teamPosition - adjustedTeamsAbove
    const endIndex = teamPosition + teamsBelow

    return standingsArray.slice(startIndex, endIndex + 1)
  }

  // Função para formatar a data da API (2024-09-21) para o formato desejado (21/09/2024)
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  // Função para determinar se o time principal é o mandante ou visitante
  const isHomeTeam = (opponent: string, teamName: string) => {
    // Lógica simples: se o resultado for 1.0, consideramos que o time principal é o mandante
    // Esta lógica pode precisar ser ajustada dependendo dos dados reais da API
    return Math.random() > 0.5 // Temporário: aleatório para demonstração
  }

  // Função para formatar o placar com base nos gols marcados e sofridos
  const formatScore = (gf: string, ga: string) => {
    return `${gf}-${ga}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando dados do time...</div>
      </div>
    )
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Time não encontrado</div>
      </div>
    )
  }

  const teamPosition = findTeamPosition()
  const teamStandingData = getTeamStandingData()

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {debugInfo.length > 0 && (
        <div className="bg-red-900 text-white text-xs p-2 max-h-24 overflow-auto">
          <div className="font-bold mb-1">Debug Info:</div>
          {debugInfo.map((info, i) => (
            <div key={i}>{info}</div>
          ))}
        </div>
      )}

      <div className="bg-black py-6 px-4 border-b border-gray-800">
        <div className="container mx-auto flex items-center gap-4">
          <div className="relative h-16 w-16">
            <img
              src={getTeamLogo(teamData.name) || "/placeholder.svg?height=64&width=64"}
              alt={teamData.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">{teamData.name}</h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-400">{teamData.country}</p>
              <span className="text-gray-600">•</span>
              <p className="text-green-500">{teamData.competition}</p>
              {teamPosition && (
                <>
                  <span className="text-gray-600">•</span>
                  <p className="text-yellow-500">Posição: {teamPosition}º</p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-white mb-1 text-center">Estatísticas</p>
            <button className="bg-green-600 text-white text-center px-4 py-1 rounded-md text-sm w-full">Compare</button>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classificações, Partidas Recentes e Estatística jogadores na mesma linha */}
        <div className="bg-[#111] rounded-lg p-4 col-span-1">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Classificações
            </h2>
            <div className="flex gap-1">
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Ven</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Cmp</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Tmp</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-800">
                  <th className="py-2 text-left">#</th>
                  <th className="py-2 text-left">Time</th>
                  <th className="py-2 text-center">J</th>
                  <th className="py-2 text-center">V</th>
                  <th className="py-2 text-center">E</th>
                  <th className="py-2 text-center">D</th>
                  <th className="py-2 text-center">PTS</th>
                </tr>
              </thead>
              <tbody>
                {teamData.leagueStandings &&
                  getFilteredStandings().map(([position, team]) => (
                    <tr
                      key={position}
                      className={`border-b border-gray-800 hover:bg-gray-900 ${
                        team.Squad === teamData.name ? "bg-gray-900 font-bold" : ""
                      }`}
                    >
                      <td className="py-2 text-left">{position}</td>
                      <td className="py-2 text-left">{team.Squad}</td>
                      <td className="py-2 text-center">{team.MP}</td>
                      <td className="py-2 text-center">{team.W}</td>
                      <td className="py-2 text-center">{team.D}</td>
                      <td className="py-2 text-center">{team.L}</td>
                      <td className="py-2 text-center font-bold">{team.Pts}</td>
                    </tr>
                  ))}
                {(!teamData.leagueStandings || Object.keys(teamData.leagueStandings).length === 0) &&
                  [
                    { position: 1, name: "Real Madrid", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                    { position: 2, name: "Barcelona", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                    { position: 3, name: "Atletico Madrid", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                    { position: 4, name: "Sevilla", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                    { position: 5, name: "Villarreal", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                    { position: 6, name: "Real Sociedad", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                    { position: 7, name: "Athletic Bilbao", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                    { position: 8, name: "Valencia", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                    { position: 9, name: "Real Betis", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                    { position: 10, name: "Getafe", played: 35, won: 10, drawn: 10, lost: 10, points: 50 },
                  ].map((team) => (
                    <tr
                      key={team.position}
                      className={`border-b border-gray-800 hover:bg-gray-900 ${
                        team.name === teamData.name ? "bg-gray-900" : ""
                      }`}
                    >
                      <td className="py-2 text-left">{team.position}</td>
                      <td className="py-2 text-left">{team.name}</td>
                      <td className="py-2 text-center">{team.played}</td>
                      <td className="py-2 text-center">{team.won}</td>
                      <td className="py-2 text-center">{team.drawn}</td>
                      <td className="py-2 text-center">{team.lost}</td>
                      <td className="py-2 text-center font-bold">{team.points}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg p-4 col-span-1">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Partidas Recentes
            </h2>
            <div className="flex gap-1">
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Ven</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Cmp</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Tmp</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {recentMatches.length > 0
              ? recentMatches.slice(0, 5).map((match, index) => {
                  // Determinar se o time principal é mandante ou visitante
                  const isHome = isHomeTeam(match.opponent, teamData.name)

                  // Formatar o nome do oponente (substituir hífens por espaços)
                  const opponentName = match.opponent.replace(/-/g, " ")

                  // Determinar o placar com base em quem é mandante/visitante
                  const score = formatScore(match.gf, match.ga)

                  // Determinar o resultado (vitória, derrota ou empate)
                  const resultClass =
                    match.result === "1.0" ? "bg-green-600" : match.result === "0.5" ? "bg-yellow-600" : "bg-red-600"

                  const resultText = match.result === "1.0" ? "W" : match.result === "0.5" ? "D" : "L"

                  return (
                    <div key={index} className="bg-[#1a1a1a] p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-400 text-sm">
                          {formatDate(match.date)} {match.time}
                        </div>
                        <div
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white ${resultClass}`}
                        >
                          {resultText}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              isHome
                                ? getTeamLogo(teamData.name)
                                : getTeamLogo(opponentName) || "/placeholder.svg?height=24&width=24"
                            }
                            alt={isHome ? teamData.name : opponentName}
                            className="h-6 w-6 object-contain"
                          />
                          <span className="text-white">{isHome ? teamData.name : opponentName}</span>
                        </div>

                        <div className="text-white font-bold">{score}</div>

                        <div className="flex items-center gap-2">
                          <span className="text-white">{isHome ? opponentName : teamData.name}</span>
                          <img
                            src={
                              isHome
                                ? getTeamLogo(opponentName)
                                : getTeamLogo(teamData.name) || "/placeholder.svg?height=24&width=24"
                            }
                            alt={isHome ? opponentName : teamData.name}
                            className="h-6 w-6 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })
              : // Fallback para quando não há dados da API
                teamData.recentMatches.map((match, index) => (
                  <div key={index} className="bg-[#1a1a1a] p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-gray-400 text-sm">
                        {match.date} {match.time}
                      </div>
                      <div
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white ${
                          match.result === "W" ? "bg-green-600" : match.result === "D" ? "bg-yellow-600" : "bg-red-600"
                        }`}
                      >
                        {match.result}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={getTeamLogo(match.home) || "/placeholder.svg?height=24&width=24"}
                          alt={match.home}
                          className="h-6 w-6 object-contain"
                        />
                        <span className="text-white">{match.home}</span>
                      </div>

                      <div className="text-white font-bold">{match.score}</div>

                      <div className="flex items-center gap-2">
                        <span className="text-white">{match.away}</span>
                        <img
                          src={getTeamLogo(match.away) || "/placeholder.svg?height=24&width=24"}
                          alt={match.away}
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          <button className="w-full mt-4 bg-green-600 text-white py-2 rounded text-sm">Ver todas as partidas</button>
        </div>

        <div className="bg-[#111] rounded-lg p-4 col-span-1">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Estatística jogadores
            </h2>
            <div className="flex gap-1">
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Ven</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Cmp</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Tmp</option>
              </select>
            </div>
          </div>

          <div className="flex mb-4 border-b border-gray-800">
            <button
              className={`px-4 py-2 text-sm ${
                activeTab === "artilheiros" ? "text-white border-b-2 border-green-600" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("artilheiros")}
            >
              Artilheiros
            </button>
            <button
              className={`px-4 py-2 text-sm ${
                activeTab === "assists" ? "text-white border-b-2 border-green-600" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("assists")}
            >
              Assistências
            </button>
            <button
              className={`px-4 py-2 text-sm ${
                activeTab === "variados" ? "text-white border-b-2 border-green-600" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("variados")}
            >
              Variados
            </button>
          </div>

          {activeTab === "artilheiros" && (
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="py-2 text-left">Jogadores</th>
                    <th className="py-2 text-center">J</th>
                    <th className="py-2 text-center">G</th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.players.artilheiros.map((player, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="py-2 text-left">{player.name}</td>
                      <td className="py-2 text-center">{player.games}</td>
                      <td className="py-2 text-center">{player.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "assists" && (
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="py-2 text-left">Jogadores</th>
                    <th className="py-2 text-center">J</th>
                    <th className="py-2 text-center">A</th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.players.assists.map((player, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="py-2 text-left">{player.name}</td>
                      <td className="py-2 text-center">{player.games}</td>
                      <td className="py-2 text-center">{player.assists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "variados" && (
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="py-2 text-left">Jogadores</th>
                    <th className="py-2 text-center">J</th>
                    <th className="py-2 text-center">CA</th>
                    <th className="py-2 text-center">CV</th>
                    <th className="py-2 text-center">F</th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.players.variados.map((player, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="py-2 text-left">{player.name}</td>
                      <td className="py-2 text-center">{player.games}</td>
                      <td className="py-2 text-center">{player.cards.yellow}</td>
                      <td className="py-2 text-center">{player.cards.red}</td>
                      <td className="py-2 text-center">7</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estatísticas da Temporada atualizado com dados da classificação */}
        <div className="bg-[#111] rounded-lg p-4 col-span-1 md:col-span-3">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Estatísticas da Temporada - {teamData.name} {teamPosition && `(${teamPosition}º)`}
            </h2>
            <div className="flex gap-1">
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Ven</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Cmp</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Tmp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teamStandingData && (
              <>
                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Jogos</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.MP}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Pontos</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.Pts}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Pontos por Jogo</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData["Pts/MP"]}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Últimos 5 Jogos</div>
                  <div className="text-white text-xl font-bold flex gap-1">
                    {teamStandingData["Last 5"].split("-").map((result, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                        ${result === "W" ? "bg-green-600" : result === "D" ? "bg-yellow-600" : "bg-red-600"}`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Vitórias</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.W}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Empates</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.D}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Derrotas</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.L}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Público Médio</div>
                  <div className="text-white text-2xl font-bold">
                    {Number(teamStandingData.Attendance).toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Gols Marcados</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.GF}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Gols Sofridos</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.GA}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Saldo de Gols</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.GD}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Artilheiro</div>
                  <div className="text-white text-xl font-bold">
                    {teamStandingData["Top Team Scorer"].replace(/-+/g, " ")}
                  </div>
                </div>
              </>
            )}

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Chutes</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.shots}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Chutes no Gol</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.shotsOnGoal}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Gols dentro da área</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Gols fora da área</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Gols de cabeça</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Grandes chances criadas p/jogo</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            {teamStandingData && (
              <>
                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Expected Goals (xG)</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.xG}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Expected Goals Against (xGA)</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.xGA}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Expected Goal Difference (xGD)</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData.xGD}</div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">xGD por 90 min</div>
                  <div className="text-white text-2xl font-bold">{teamStandingData["xGD/90"]}</div>
                </div>

                {teamStandingData.Goalkeeper && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Goleiro</div>
                    <div className="text-white text-2xl font-bold">
                      {teamStandingData.Goalkeeper.replace(/-/g, " ")}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Passes Certos</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Cruzamentos</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Pênaltis cometidos</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Faltas</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Impedimentos</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Escanteios</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Cartões amarelos</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Cartões vermelhos</div>
              <div className="text-white text-2xl font-bold">{teamData.seasonStats.corners}</div>
            </div>

            {teamStandingData && teamStandingData.Notes && (
              <div className="bg-[#1a1a1a] p-3 rounded-lg col-span-2 md:col-span-4 lg:col-span-6">
                <div className="text-gray-400 text-sm mb-1">Notas</div>
                <div className="text-white">{teamStandingData.Notes}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111] rounded-lg p-4 col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Destaques da Temporada
            </h2>
            <div className="flex gap-1">
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Ven</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Cmp</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Tmp</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="text-gray-400 text-sm mb-1">Melhor formação</div>
              <div className="text-white text-lg font-bold">
                {teamData.seasonHighlights.formation} ({teamData.seasonHighlights.formationPercentage}%)
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="flex justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Relação Chute no gol x gol</div>
                  <div className="text-white text-lg font-bold">{teamData.seasonHighlights.shotToGoalRatio}</div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-1">Gols por jogo ult. 5</div>
                  <div className="text-white text-lg font-bold text-right">
                    {teamData.seasonHighlights.shotToGoalRatio}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="flex justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Média Win Streak</div>
                  <div className="text-white text-lg font-bold">{teamData.seasonHighlights.avgWinStreak}</div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-1">Win Streak</div>
                  <div className="text-white text-lg font-bold text-right">{teamData.seasonHighlights.winStreak}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="text-gray-400 text-sm mb-1">jogos sem tomar gol</div>
              <div className="text-white text-lg font-bold">{teamData.seasonHighlights.winStreak}</div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="text-gray-400 text-sm mb-1">Artilharia</div>
              <div className="text-white text-lg font-bold">
                {teamData.seasonHighlights.attack.value} em gols com {teamData.seasonHighlights.attack.goalsPerGame}{" "}
                gols
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="text-gray-400 text-sm mb-1">Defesa</div>
              <div className="text-white text-lg font-bold">
                {teamData.seasonHighlights.defense.value} em gols com{" "}
                {teamData.seasonHighlights.defense.goalsConcededPerGame} gols sofridos
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg p-4 col-span-1">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="grid grid-cols-3 gap-6 w-full">
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-green-900"></div>
                  <div
                    className="absolute inset-0 rounded-full bg-green-600"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((Math.PI * 2 * teamData.winProbability.nextGame) / 100)}% ${50 - 50 * Math.sin((Math.PI * 2 * teamData.winProbability.nextGame) / 100)}%, 50% 0%)`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white text-2xl font-bold">{teamData.winProbability.nextGame}%</div>
                      <div className="text-xs text-gray-300">Win next game</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-green-900"></div>
                  <div
                    className="absolute inset-0 rounded-full bg-green-600"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((Math.PI * 2 * teamData.winProbability.home) / 100)}% ${50 - 50 * Math.sin((Math.PI * 2 * teamData.winProbability.home) / 100)}%, 50% 0%)`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white text-2xl font-bold">{teamData.winProbability.home}%</div>
                      <div className="text-xs text-gray-300">Win home</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-green-900"></div>
                  <div
                    className="absolute inset-0 rounded-full bg-green-600"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((Math.PI * 2 * teamData.winProbability.away) / 100)}% ${50 - 50 * Math.sin((Math.PI * 2 * teamData.winProbability.away) / 100)}%, 50% 0%)`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white text-2xl font-bold">{teamData.winProbability.away}%</div>
                      <div className="text-xs text-gray-300">Avg ball poss</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg p-4 col-span-1 md:col-span-3">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Médias por partida
            </h2>
            <div className="flex gap-1">
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Ven</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Cmp</option>
              </select>
              <select className="bg-black text-white text-[10px] border border-gray-700 rounded px-1 py-0 h-[5.5px] w-[13.2px]">
                <option>Tmp</option>
              </select>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2">
            {[
              { key: "shots", label: "Chutes" },
              { key: "shotsOnGoal", label: "Chutes no gol" },
              { key: "goalsScored", label: "Gols feitos" },
              { key: "goalsOutsideBox", label: "Gols fora da área" },
              { key: "headerGoals", label: "Gols de cabeça" },
              { key: "bigChancesCreated", label: "Grandes chances" },
              { key: "crosses", label: "Cruzamentos" },
              { key: "goalsConceded", label: "Gols sofridos" },
              { key: "fouls", label: "Faltas" },
              { key: "offsides", label: "Impedimentos" },
              { key: "corners", label: "Escanteios" },
              { key: "yellowCards", label: "Cartões amarelos" },
              { key: "redCards", label: "Cartões vermelhos" },
            ].map((stat) => (
              <div key={stat.key} className="flex-1 flex flex-col items-center">
                <div className="relative w-full h-full">
                  <div
                    className="bg-green-800 w-full absolute bottom-0"
                    style={{
                      height: `${(teamData?.seasonStats?.[stat.key] || 5) * 10}px`,
                    }}
                  ></div>
                  <div
                    className="bg-green-600 w-full absolute bottom-0"
                    style={{
                      height: `${(teamData?.seasonStats?.[stat.key] || 5) * 8}px`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2 h-8 flex items-center justify-center text-center">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-xs text-gray-400">Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-800 rounded"></div>
              <span className="text-xs text-gray-400">Média da competição</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
