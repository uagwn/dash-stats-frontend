"use client"
import type React from "react"
import { useState, useEffect, use, useMemo } from "react"
import Select from "react-select"
import { players_images } from "@/app/src/playersImages"
import { teams_logos } from "@/app/src/teamsLogos"

interface MatchData {
  ast: string
  comp: string
  crdy: string
  crdr: string
  date: string
  fld: string
  fls: string
  gls: string
  opponent: string
  player: string
  pos: string
  result: string
  result_code: number
  sh: string
  sot: string
  squad: string
  start: string
  venue: string
  err: number
  pAway: number
  pHome: number
  tklw: number
  shb: number
  sca: number
  gca: number
  passb: number
  cmp: number
  int: number
  prgp: number
  prgc: number
  succ: number
  att: number
}
interface VsOpponentMatch {
  ast: string
  att: string
  cmpp: string
  comp: string
  crdy: string
  date: string
  fld: string
  fls: string
  gls: string
  int: string
  opponent: string
  player: string
  pos: string
  result_code: string
  sh: string
  sot: string
  squad: string
  succ: string
  tklw: string
  venue: string
}
interface GoalLogEntry {
  assist: string
  "body part": string
  comp: string
  date: string
  "dist(yds)": string
  gca1: string
  gca2: string
  goalkeeper: string
  half_time: string
  minute: string
  minute_interval: string
  notes: string
  opponent: string
  psxg: string
  rk: string
  round: string
  score: string
  score_situation: string
  scorer: string
  season: string
  sort_minute: number
  start: string
  type: string
  "type.1": string
  venue: string
  xg: string
}
interface GoalLogData {
  competition: string
  distance_analysis: {
    average_distance_m: number
    goals_outside_box: number
    goals_outside_box_p: number
    total_goals_with_distance_data: number
  }
  entity: string
  goal_types: {
    by_body_part: Array<{
      body_part: string
      goals: number
      percentage: number
    }>
    by_type: Array<{
      goals: number
      percentage: number
      type: string
    }>
  }
  goals_by_round: Record<string, GoalLogEntry[]>
  minute_analysis: {
    all_intervals: Array<{
      goals: number
      interval: string
    }>
    goals_by_half: Array<{
      goals: number
      half: string
    }>
    top_interval: {
      goals: number
      interval: string
    }
  }
  score_analysis: {
    by_situation: Array<{
      goals: number
      situation: string
    }>
    most_common_when_losing: Array<{
      goals: number
      score: string
    }>
    most_common_when_tied: Array<{
      goals: number
      score: string
    }>
    most_common_when_winning: Array<{
      goals: number
      score: string
    }>
  }
  starting_position: {
    goals_from_bench: number
    goals_from_starting_eleven: number
  }
  top_opponents: Array<{
    goals: number
    opponent: string
  }>
  assist_analysis: {
    top_assistants: Array<{
      assists: number
      player: string
    }>
  }
}
interface PlayerInsights {
  ast: {
    active_streaks: {
      current: number
      max: number
      mean: number
    }
    inactive_streaks: {
      current: number
      max: number
      mean: number
    }
    momentum: {
      current_window_match: number
      avg_2_last_windows: number
      current_window_stat: number
    }
  }
  gls: {
    active_streaks: {
      current: number
      max: number
      mean: number
    }
    inactive_streaks: {
      current: number
      max: number
      mean: number
    }
    momentum: {
      current_window_match: number
      avg_2_last_windows: number
      current_window_stat: number
    }
  }
  sot: {
    active_streaks: {
      current: number
      max: number
      mean: number
    }
    inactive_streaks: {
      current: number
      max: number
      mean: number
    }
    momentum: {
      current_window_match: number
      avg_2_last_windows: number
      current_window_stat: number
    }
  }
  tklw: {
    active_streaks: {
      current: number
      max: number
      mean: number
    }
    inactive_streaks: {
      current: number
      max: number
      mean: number
    }
    momentum: {
      current_window_match: number
      avg_2_last_windows: number
      current_window_stat: number
    }
  }
}
interface PlayerData {
  name: string
  photo?: string
  team: string
  competition: string
  position: string
  availableComps: string[]
  matchlog_table: MatchData[]
  metrics: {
    Attack: number
    Criative: number
    Defense: number
    Pass: number
  }
  player_mean_stats: Record<string, number>
  seasons: []
  player_max_stats: Record<string, number>
  league_mean_stats: Record<string, number>
  player_insights: PlayerInsights
  seasonStats: {
    matches: number
    goals: number
    assists: number
    shots: number
    shotsOnTarget: number
    fouls: number
    yellowCards: number
    redCards: number
    foulsDrawn: number
    err: number
    pAway: number
    pHome: number
    tklWon: number
    shb: number
    sca: number
    gca: number
    passb: number
    cmpPercent: number
    int: number
    shPercent: number
    progPass: number
    progCarries: number
    offside: number
    tDibble: number
    sucDibble: number
    dibblePercent: number
  }
  homeGoalsPercent: number
  // New fields for vs opponent data
  vs_opponent?: VsOpponentMatch[]
  vs_opponent_mean_per_game?: Record<string, number>
  vs_opponent_stat_rates?: Record<string, number>
  vs_opponent_winrate?: number
  // New field for goal log data
  goalLogData?: GoalLogData
}
// New Goal Log Component
const GoalLogComponent: React.FC<{ playerData: PlayerData }> = ({ playerData }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "analysis">("overview")
  if (!playerData.goalLogData) {
    return (
      <div className="bg-[#111] rounded-lg p-6">
        <div className="text-white">Nenhum dado de gols disponível</div>
      </div>
    )
  }
  const goalData = playerData.goalLogData
  const allGoals = Object.values(goalData.goals_by_round).flat()
  const sortedGoals = allGoals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const getTeamLogo = (teamName: string) => {
    if (!teamName) return null
    const teamData = teams_logos.find(
      (t) => t.name && teamName && t.name.toLowerCase().trim() === teamName.toLowerCase().trim(),
    )
    return teamData ? teamData.logo : null
  }
  const getScoreSituationColor = (situation: string) => {
    switch (situation.toLowerCase()) {
      case "tied":
        return "text-yellow-500"
      case "winning":
        return "text-green-500"
      case "losing":
        return "text-red-500"
      default:
        return "text-gray-400"
    }
  }
  const getScoreSituationText = (situation: string) => {
    switch (situation.toLowerCase()) {
      case "tied":
        return "Empate"
      case "winning":
        return "Vencendo"
      case "losing":
        return "Perdendo"
      default:
        return situation
    }
  }
  // Prepare data for minute analysis histogram
  const minuteIntervalsData =
    goalData.minute_analysis?.all_intervals.reduce(
      (acc, curr) => {
        acc[curr.interval] = curr.goals
        return acc
      },
      {} as Record<string, number>,
    ) || {}
  const standardIntervals = [
    { range: "0-10", label: "0-10min" },
    { range: "10-20", label: "10-20min" },
    { range: "20-30", label: "20-30min" },
    { range: "30-40", label: "30-40min" },
    { range: "40-50", label: "40-50min" },
    { range: "50-60", label: "50-60min" },
    { range: "60-70", label: "60-70min" },
    { range: "70-80", label: "70-80min" },
    { range: "80-90", label: "80-90min" },
    { range: "90-100", label: "90-100min" },
    { range: "100-110", label: "100-110min" },
    { range: "110-120", label: "110-120min" },
  ]
  const maxGoalsInInterval = Math.max(...Object.values(minuteIntervalsData), 0)
  return (
    <div className="bg-[#111] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-lg font-semibold">Análise de Gols</h2>
        <div className="text-gray-400 text-sm">{allGoals.length} gols</div>
      </div>
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-[#1a1a1a] rounded-lg p-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "overview" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "timeline" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Timeline de Gols
        </button>
        <button
          onClick={() => setActiveTab("analysis")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "analysis" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Análise Detalhada
        </button>
      </div>
      {activeTab === "overview" && (
        <>
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Total de Gols</div>
              <div className="text-white text-xl font-bold">{allGoals.length}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Distância Média</div>
              <div className="text-white text-xl font-bold">
                {goalData.distance_analysis.average_distance_m.toFixed(1)}m
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Gols de Fora da Área</div>
              <div>
                <span className="text-white text-xl font-bold"> {goalData.distance_analysis.goals_outside_box}</span>
                <span className="text-gray-400 text-sm"> ({goalData.distance_analysis.goals_outside_box_p}%)</span>
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">% Pé Direito</div>
              <div className="text-white text-xl font-bold">
                {goalData.goal_types.by_body_part
                  .find((bp) => bp.body_part.includes("Direito"))
                  ?.percentage.toFixed(1) || 0}
                %
              </div>
            </div>
          </div>
          {/* Goal Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Gols por Parte do Corpo</h3>
              <div className="space-y-3">
                {goalData.goal_types.by_body_part
                  .filter((bodyPart) => bodyPart.body_part !== "Sem-dados")
                  .map((bodyPart, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{bodyPart.body_part}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{bodyPart.goals}</span>
                        <span className="text-gray-400 text-sm">({bodyPart.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Tipos de Gol</h3>
              <div className="space-y-3">
                {goalData.goal_types.by_type
                  .filter((goal_types) => goal_types.type !== "Sem-dados")
                  .map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white text-sm">{type.type === "0" ? "Gol Normal" : type.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{type.goals}</span>
                        <span className="text-gray-400 text-sm">({type.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          <div className="max-h-[600px] overflow-y-auto">
            {sortedGoals.map((goal, index) => (
              <div key={index} className="bg-[#1a1a1a] p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={getTeamLogo(goal.opponent) || "/placeholder.svg?height=24&width=24"}
                      alt={goal.opponent}
                      className="w-6 h-6 object-contain"
                    />
                    <div>
                      <div className="text-white font-medium text-sm">
                        {goal.venue === "Home" ? "vs" : "@"} {goal.opponent.replace(/-/g, " ")}
                      </div>
                      <div className="text-gray-400 text-xs">{new Date(goal.date).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{goal.minute}'</div>
                    <div className="text-gray-400 text-xs">{goal.half_time}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Placar: </span>
                    <span className="text-white">{goal.score}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Situação: </span>
                    <span className={getScoreSituationColor(goal.score_situation)}>
                      {getScoreSituationText(goal.score_situation)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Distância: </span>
                    <span className="text-white">{goal["dist(yds)"]} metros</span>
                  </div>
                  <div>
                    <span className="text-gray-400">xG: </span>
                    <span className="text-white">{Number(goal.xg).toFixed(2)}</span>
                  </div>
                </div>
                {goal.assist && goal.assist !== "0" && (
                  <div className="mt-2 text-xs">
                    <span className="text-gray-400">Assistência: </span>
                    <span className="text-green-400">{goal.assist.replace(/-/g, " ")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === "analysis" && (
        <div className="space-y-6">
          {/* Goal Distribution by Minute Interval */}
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-6">Distribuição de Gols por Intervalo</h3>
            <div className="relative">
              <div className="flex items-start justify-center gap-2 h-64 mb-4">
                {standardIntervals.map((period) => {
                  const goalsInPeriod = minuteIntervalsData[period.range] || 0
                  const barHeight = maxGoalsInInterval > 0 ? (goalsInPeriod / maxGoalsInInterval) * 200 : 0
                  return (
                    <div key={period.range} className="flex flex-col items-center h-full">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`bg-green-500 rounded-b-md flex items-center justify-center text-white font-bold text-sm min-w-[60px] transition-all duration-300 hover:opacity-80`}
                          style={{
                            height: `${Math.max(barHeight, goalsInPeriod > 0 ? 30 : 0)}px`,
                          }}
                        >
                          <span>{goalsInPeriod > 0 ? goalsInPeriod : ""}</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <div className="text-gray-400 text-xs mt-2 text-center whitespace-nowrap">{period.label}</div>
                        <div className="text-gray-500 text-xs mt-1 text-center">
                          {allGoals.length > 0 ? ((goalsInPeriod / allGoals.length) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          {/* Goals by Half */}
          {goalData.minute_analysis?.goals_by_half && (
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Gols por Tempo de Jogo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {goalData.minute_analysis.goals_by_half.map((half, index) => (
                  <div key={index} className="text-center bg-[#0a0a0a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">{half.half}</div>
                    <div className="text-white text-2xl font-bold">{half.goals}</div>
                    <div className="text-gray-500 text-sm">
                      {allGoals.length > 0 ? ((half.goals / allGoals.length) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Score Situation Analysis */}
          {goalData.score_analysis?.by_situation && (
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Gols por Situação de Placar</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {goalData.score_analysis.by_situation.map((situation, index) => (
                  <div key={index} className="text-center bg-[#0a0a0a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">{getScoreSituationText(situation.situation)}</div>
                    <div className="text-white text-2xl font-bold">{situation.goals}</div>
                    <div className="text-gray-500 text-sm">
                      {allGoals.length > 0 ? ((situation.goals / allGoals.length) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Starting Position Analysis */}
          {goalData.starting_position && (
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Gols por Posição Inicial</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-[#0a0a0a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Como Titular</div>
                  <div className="text-white text-2xl font-bold">
                    {goalData.starting_position.goals_from_starting_eleven}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {allGoals.length > 0
                      ? ((goalData.starting_position.goals_from_starting_eleven / allGoals.length) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
                <div className="text-center bg-[#0a0a0a] p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Saindo do Banco</div>
                  <div className="text-white text-2xl font-bold">{goalData.starting_position.goals_from_bench}</div>
                  <div className="text-gray-500 text-sm">
                    {allGoals.length > 0
                      ? ((goalData.starting_position.goals_from_bench / allGoals.length) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Top Opponents */}
          {goalData.top_opponents && goalData.top_opponents.length > 0 && (
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Top vítimas</h3>
              <div className="space-y-3">
                {goalData.top_opponents.map((opponent, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={getTeamLogo(opponent.opponent) || "/placeholder.svg?height=20&width=20"}
                        alt={opponent.opponent}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-white text-sm">{opponent.opponent.replace(/-/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{opponent.goals}</span>
                      <span className="text-gray-400 text-sm">
                        ({allGoals.length > 0 ? ((opponent.goals / allGoals.length) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Top assists */}
          {goalData.assist_analysis?.top_assistants && goalData.assist_analysis?.top_assistants.length > 0 && (
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Garçons</h3>
              <div className="space-y-3">
                {goalData.assist_analysis.top_assistants.map((assist, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">{assist.player.replace(/-/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{assist.assists}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
// Updated Player vs Opponent Component (keeping existing code)
const PlayerVsOpponentCard: React.FC<{ playerData: PlayerData }> = ({ playerData }) => {
  const [showAllMatches, setShowAllMatches] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "streaks" | "detailed">("overview")
  if (!playerData.vs_opponent || playerData.vs_opponent.length === 0) {
    return (
      <div className="bg-[#111] rounded-lg p-6">
        <div className="text-white">Nenhum dado de confronto direto disponível</div>
      </div>
    )
  }
  const vsOpponentData = playerData.vs_opponent
  const meanStats = playerData.vs_opponent_mean_per_game || {}
  const statRates = playerData.vs_opponent_stat_rates || {}
  const winRate = playerData.vs_opponent_winrate || 0
  const opponentName = vsOpponentData[0]?.opponent || "Unknown"
  const totalMatches = vsOpponentData.length
  const sortedMatches = [...vsOpponentData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const displayedMatches = showAllMatches ? sortedMatches : sortedMatches.slice(0, 5)
  const totalGoals = vsOpponentData.reduce((sum, match) => sum + Number(match.gls || 0), 0)
  const totalAssists = vsOpponentData.reduce((sum, match) => sum + Number(match.ast || 0), 0)
  const homeMatches = vsOpponentData.filter((match) => match.venue === "Home")
  const awayMatches = vsOpponentData.filter((match) => match.venue === "Away")
  const wins = vsOpponentData.filter((match) => Number(match.result_code) === 1).length
  const homeWins = homeMatches.filter((match) => Number(match.result_code) === 1).length
  const awayWins = awayMatches.filter((match) => Number(match.result_code) === 1).length
  const homeWinRate = homeMatches.length > 0 ? (homeWins / homeMatches.length) * 100 : 0
  const awayWinRate = awayMatches.length > 0 ? (awayWins / awayMatches.length) * 100 : 0
  const bestMatch = vsOpponentData.reduce((best, current) => {
    const currentScore = Number(current.gls || 0) + Number(current.ast || 0)
    const bestScore = Number(best.gls || 0) + Number(best.ast || 0)
    return currentScore > bestScore ? current : best
  }, vsOpponentData[0])
  let streakType: "win" | "loss" | "draw" | "goals" | "no_goals" = "goals"
  let streakCount = 0
  for (let i = 0; i < sortedMatches.length; i++) {
    if (Number(sortedMatches[i].gls || 0) > 0) {
      streakCount++
    } else {
      break
    }
  }
  if (streakCount === 0) {
    for (let i = 0; i < sortedMatches.length; i++) {
      if (Number(sortedMatches[i].gls || 0) === 0) {
        streakCount++
      } else {
        break
      }
    }
    streakType = "no_goals"
  }
  // Function to get relevant stats based on player position
  const getPositionBasedStats = (position: string) => {
    const pos = position.toLowerCase()
    // Defender stats
    if (pos.includes("cb") || pos.includes("lb") || pos.includes("rb") || pos.includes("wb") || pos.includes("df")) {
      return [
        { key: "tklw", label: "Desarmes" },
        { key: "fls", label: "Faltas Cometidas" },
        { key: "crdy", label: "Cartões Amarelos" },
      ]
    }
    // Midfielder and Attacker stats
    if (
      pos.includes("cm") ||
      pos.includes("dm") ||
      pos.includes("am") ||
      pos.includes("lm") ||
      pos.includes("rm") ||
      pos.includes("fw") ||
      pos.includes("cf") ||
      pos.includes("lw") ||
      pos.includes("rw") ||
      pos.includes("st")
    ) {
      return [
        { key: "gls", label: "Gols" },
        { key: "ast", label: "Assistências" },
        { key: "sh", label: "Chutes" },
        { key: "sot", label: "Chutes no Gol" },
        { key: "fls", label: "Faltas Cometidas" },
        { key: "fld", label: "Faltas Sofridas" },
        { key: "crdy", label: "Cartões Amarelos" },
      ]
    }
    // Default fallback (midfielder/attacker stats)
    return [
      { key: "gls", label: "Gols" },
      { key: "ast", label: "Assistências" },
      { key: "sh", label: "Chutes" },
      { key: "sot", label: "Chutes no Gol" },
      { key: "fls", label: "Faltas Cometidas" },
      { key: "fld", label: "Faltas Sofridas" },
      { key: "crdy", label: "Cartões Amarelos" },
    ]
  }
  // Calculate streaks for each stat
  const calculateStatStreaks = (matches: VsOpponentMatch[], statKey: string) => {
    if (matches.length === 0) return { current: 0, type: "inactive" as "active" | "inactive" }
    let currentStreak = 0
    let streakType: "active" | "inactive" = "inactive"
    // Check current streak (starting from most recent match)
    for (let i = 0; i < matches.length; i++) {
      const statValue = Number(matches[i][statKey as keyof VsOpponentMatch] || 0)
      if (i === 0) {
        // Determine streak type based on first match
        streakType = statValue > 0 ? "active" : "inactive"
      }
      // Continue streak if condition matches
      if ((streakType === "active" && statValue > 0) || (streakType === "inactive" && statValue === 0)) {
        currentStreak++
      } else {
        break
      }
    }
    return { current: currentStreak, type: streakType }
  }
  // Get position-based stats for current player
  const positionStats = getPositionBasedStats(playerData.position)
  const statStreaks = positionStats.map((stat) => ({
    ...stat,
    streak: calculateStatStreaks(sortedMatches, stat.key),
  }))
  const getTeamLogo = (teamName: string) => {
    if (!teamName) return null
    const teamData = teams_logos.find(
      (t) => t.name && teamName && t.name.toLowerCase().trim() === teamName.toLowerCase().trim(),
    )
    return teamData ? teamData.logo : null
  }
  const getResultDisplay = (resultCode: string) => {
    const code = Number(resultCode)
    switch (code) {
      case 3:
        return "E" // Draw (Empate)
      case 1:
        return "V" // Victory
      case 2:
        return "D"
      default:
        return "-"
    }
  }
  const getResultColor = (resultCode: string) => {
    const code = Number(resultCode)
    switch (code) {
      case 3:
        return "text-yellow-500"
      case 1:
        return "text-green-500" // Victory
      case 2:
        return "text-red-500" // Defeat
      default:
        return "text-gray-400"
    }
  }
  // Organize stats by categories
  const statCategories = {
    attacking: [
      { key: "gls", label: "Gols" },
      { key: "ast", label: "Assistências" },
      { key: "sh", label: "Chutes" },
      { key: "sot", label: "Chutes no Gol" },
    ],
    defensive: [
      { key: "int", label: "Interceptações" },
      { key: "tklw", label: "Desarmes" },
    ],
    disciplinary: [
      { key: "fls", label: "Faltas Cometidas" },
      { key: "fld", label: "Faltas Sofridas" },
      { key: "crdy", label: "Cartões Amarelos" },
    ],
  }
  const getStatColor = (rate: number) => {
    if (rate >= 75) return "text-green-500"
    if (rate >= 50) return "text-yellow-500"
    if (rate >= 25) return "text-orange-500"
    return "text-red-500"
  }
  return (
    <div className="bg-[#111] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-lg font-semibold">Histórico vs Próx. Adversário</h2>
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1 rounded-lg">
            <img
              src={getTeamLogo(opponentName) || "/placeholder.svg?height=24&width=24"}
              alt={opponentName}
              className="w-6 h-6 object-contain"
            />
            <span className="text-white text-sm font-medium">{opponentName.replace(/-/g, " ")}</span>
          </div>
        </div>
        <div className="text-gray-400 text-sm">{totalMatches} jogos</div>
      </div>
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-[#1a1a1a] rounded-lg p-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "overview" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab("streaks")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "streaks" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Sequências Detalhadas
        </button>
        <button
          onClick={() => setActiveTab("detailed")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "detailed" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Estatísticas Detalhadas
        </button>
      </div>
      {activeTab === "overview" && (
        <>
          {/* Key Insights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Taxa de Vitória</div>
              <div className="text-white text-xl font-bold">{(winRate * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Gols/Jogo</div>
              <div className="text-white text-xl font-bold">{(meanStats.gls || 0).toFixed(1)}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Assist/Jogo</div>
              <div className="text-white text-xl font-bold">{(meanStats.ast || 0).toFixed(1)}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">% Jogos c/ Gol</div>
              <div className="text-white text-xl font-bold">{(statRates.gls || 0).toFixed(0)}%</div>
            </div>
          </div>
          {/* Advanced Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">Performance Casa vs Fora</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Taxa Vitória em Casa:</span>
                  <span className="text-white font-bold">{homeWinRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Taxa Vitória Fora:</span>
                  <span className="text-white font-bold">{awayWinRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Jogos em Casa:</span>
                  <span className="text-white font-bold">{homeMatches.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Jogos Fora:</span>
                  <span className="text-white font-bold">{awayMatches.length}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">Melhor Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Data:</span>
                  <span className="text-white font-bold">{new Date(bestMatch.date).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Resultado:</span>
                  <span className={`font-bold ${getResultColor(bestMatch.result_code)}`}>
                    {getResultDisplay(bestMatch.result_code)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Gols + Assistências:</span>
                  <span className="text-white font-bold">
                    {Number(bestMatch.gls || 0) + Number(bestMatch.ast || 0)}
                  </span>
                </div>
                <div className="mt-3 p-2 bg-[#111] rounded">
                  <div className="text-xs text-gray-400">Sequência Atual:</div>
                  <div className="text-white font-bold">
                    {streakCount} jogos {streakType === "goals" ? "com gol" : "sem gol"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {activeTab === "streaks" && (
        <div className="space-y-6">
          {/* Position-based Stat Streaks */}
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-4">
              Sequências Atuais vs {opponentName.replace(/-/g, " ")}
              <span className="text-gray-400 text-sm ml-2">({playerData.position})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statStreaks.map((stat) => (
                <div key={stat.key} className="bg-[#0a0a0a] p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white font-medium text-sm">{stat.label}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Sequência Atual:</span>
                      <span
                        className={`font-normal text-sm ${stat.streak.type === "active" ? "text-white" : "text-white"}`}
                      >
                        {stat.streak.current} jogos
                      </span>
                    </div>
                    <div className="text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          stat.streak.type === "active" ? "bg-green-600 text-white" : "bg-red-900 text-white"
                        }`}
                      >
                        {stat.streak.type === "active" ? `Com ${stat.label}` : `Sem ${stat.label}`}
                      </span>
                    </div>
                    {/* Mini progress indicator */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Últimos 5 jogos:</span>
                      </div>
                      <div className="flex gap-1">
                        {sortedMatches.slice(0, 5).map((match, index) => {
                          const hasStats = Number(match[stat.key as keyof VsOpponentMatch] || 0) > 0
                          return (
                            <div
                              key={index}
                              className={`w-4 h-4 rounded-sm ${hasStats ? "bg-green-500" : "bg-gray-600"}`}
                              title={`${match.date}: ${match[stat.key as keyof VsOpponentMatch] || 0} ${stat.label}`}
                            />
                          )
                        })}
                        {/* Fill remaining slots if less than 5 matches */}
                        {Array.from({ length: Math.max(0, 5 - sortedMatches.length) }).map((_, index) => (
                          <div key={`empty-${index}`} className="w-4 h-4 rounded-sm bg-gray-800" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === "detailed" && (
        <div className="space-y-6">
          {/* Detailed Statistics by Category */}
          {Object.entries(statCategories).map(([categoryName, stats]) => (
            <div key={categoryName} className="bg-[#1a1a1a] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4 capitalize">
                {categoryName === "attacking" && "Estatísticas Ofensivas"}
                {categoryName === "defensive" && "Estatísticas Defensivas"}
                {categoryName === "disciplinary" && "Estatísticas Disciplinares"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.key} className="bg-[#0a0a0a] p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400 text-xs">{stat.label}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Média/Jogo:</span>
                        <span className="text-white font-bold text-sm">{(meanStats[stat.key] || 0).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">% Jogos:</span>
                        <span className={`font-bold text-sm ${getStatColor(statRates[stat.key] || 0)}`}>
                          {(statRates[stat.key] || 0).toFixed(0)}%
                        </span>
                      </div>
                      {/* Progress bar for percentage */}
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            (statRates[stat.key] || 0) >= 75
                              ? "bg-green-500"
                              : (statRates[stat.key] || 0) >= 50
                                ? "bg-yellow-500"
                                : (statRates[stat.key] || 0) >= 25
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(statRates[stat.key] || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Comparison with Overall Performance */}
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-4">Resumo Comparativo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                <div className="text-gray-400 text-xs mb-1">Total de Confrontos</div>
                <div className="text-white text-2xl font-bold">{totalMatches}</div>
              </div>
              <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                <div className="text-gray-400 text-xs mb-1">Vitórias</div>
                <div className="text-green-500 text-2xl font-bold">{wins}</div>
              </div>
              <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                <div className="text-gray-400 text-xs mb-1">Gols Totais</div>
                <div className="text-white text-2xl font-bold">{totalGoals}</div>
              </div>
              <div className="bg-[#0a0a1a] p-3 rounded-lg text-center">
                <div className="text-gray-400 text-xs mb-1">Assistências Totais</div>
                <div className="text-white text-2xl font-bold">{totalAssists}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Recent Matches - Table Format */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4 mt-5">
          <h3 className="text-white font-semibold">Últimos Confrontos</h3>
          {sortedMatches.length > 5 && (
            <button
              onClick={() => setShowAllMatches(!showAllMatches)}
              className="text-green-500 text-sm hover:text-green-400 transition-colors"
            >
              {showAllMatches ? "Ver menos" : `Ver todos (${sortedMatches.length})`}
            </button>
          )}
        </div>
        <div
          className="h-auto overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(75, 85, 99, 0.3) transparent",
          }}
        >
          <table className="w-full text-white text-xs">
            <thead className="sticky top-0 bg-[#111] z-10">
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="py-2 text-left" title="Data da partida">
                  Data
                </th>
                <th className="py-2 text-left" title="Competição">
                  Comp
                </th>
                <th className="py-2 text-center" title="Resultado da partida">
                  Resultado
                </th>
                <th className="py-2 text-center" title="Local da partida">
                  Local
                </th>
                <th className="py-2 text-center" title="Gols marcados">
                  G
                </th>
                <th className="py-2 text-center" title="Assistências">
                  A
                </th>
                <th className="py-2 text-center" title="Chutes totais">
                  CH
                </th>
                <th className="py-2 text-center" title="Chutes no gol">
                  CG
                </th>
                <th className="py-2 text-center" title="Faltas cometidas">
                  FC
                </th>
                <th className="py-2 text-center" title="Faltas sofridas">
                  FS
                </th>
                <th className="py-2 text-center" title="Cartões amarelos">
                  CA
                </th>
                <th className="py-2 text-center" title="Interceptações">
                  INT
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedMatches.map((match, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-800 hover:bg-gray-900 ${
                    match.venue === "Home" ? "bg-[#1a1a1a]" : ""
                  }`}
                >
                  <td className="py-2 text-xs" title={`Partida em ${match.date}`}>
                    {(() => {
                      const [year, month, day] = match.date.split("-")
                      return `${year.slice(-2)}-${month}-${day}`
                    })()}
                  </td>
                  <td className="py-2 text-xs" title={`${match.comp}`}>
                    {match.comp}
                  </td>
                  <td className="py-2 text-center" title={`Resultado: ${getResultDisplay(match.result_code)}`}>
                    <span className={`px-1 py-0.5 rounded text-xs font-bold ${getResultColor(match.result_code)}`}>
                      {getResultDisplay(match.result_code)}
                    </span>
                  </td>
                  <td className="py-2 text-center" title={match.venue === "Home" ? "Jogou em casa" : "Jogou fora"}>
                    <span className="px-1 py-0.5 rounded text-xs text-white font-thin">
                      {match.venue === "Home" ? "C" : "F"}
                    </span>
                  </td>
                  <td className="py-2 text-center" title={`${match.gls} gols marcados`}>
                    <span
                      className={`px-1 py-0.5 rounded text-xs ${Number(match.gls) >= 1 ? "font-black" : "font-thin"}`}
                    >
                      {match.gls}
                    </span>
                  </td>
                  <td className="py-2 text-center" title={`${match.ast} assistências`}>
                    <span
                      className={`px-1 py-0.5 rounded text-xs ${Number(match.ast) >= 1 ? "font-black" : "font-thin"}`}
                    >
                      {match.ast}
                    </span>
                  </td>
                  <td className="py-2 text-center" title={`${match.sh} chutes totais`}>
                    <span
                      className={`px-1 py-0.5 rounded text-xs ${Number(match.sh) >= 1 ? "font-black" : "font-thin"}`}
                    >
                      {match.sh}
                    </span>
                  </td>
                  <td className="py-2 text-center" title={`${match.sot} chutes no gol`}>
                    <span
                      className={`px-1 py-0.5 rounded text-xs ${Number(match.sot) >= 1 ? "font-black" : "font-thin"}`}
                    >
                      {match.sot}
                    </span>
                  </td>
                  <td className="py-2 text-center" title={`${match.fls} faltas cometidas`}>
                    <span
                      className={`px-1 py-0.5 rounded text-xs ${Number(match.fls) >= 1 ? "font-black" : "font-thin"}`}
                    >
                      {match.fls}
                    </span>
                  </td>
                  <td className="py-2 text-center" title={`${match.fld} faltas sofridas`}>
                    <span
                      className={`px-1 py-0.5 rounded text-xs ${Number(match.fld) >= 1 ? "font-black" : "font-thin"}`}
                    >
                      {match.fld}
                    </span>
                  </td>
                  <td className="py-2 text-center" title={`${match.crdy} cartões amarelos`}>
                    <span
                      className={`px-1 py-0.5 rounded text-xs ${Number(match.crdy) >= 1 ? "font-black" : "font-thin"}`}
                    >
                      {match.crdy}
                    </span>
                  </td>
                  <td className="py-2 text-center" title={`${match.int} interceptações`}>
                    <span
                      className={`px-1 py-0.5 rounded text-xs ${Number(match.int) >= 1 ? "font-black" : "font-thin"}`}
                    >
                      {match.int}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default function PlayerCompPage({ params }: { params: Promise<{ playerId: string }> }) {
  const resolvedParams = use(params)
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedComp, setSelectedComp] = useState("All")
  const [selectedYear, setSelectedYear] = useState("2025") 
  const playerId = decodeURIComponent(resolvedParams.playerId)
  const [availableComps, setAvailableComps] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" })

  const getPlayerPhoto = (PlayerId: string) => {
    if (!PlayerId) return null
    const playerData = players_images.find(
      (t) => t.name && PlayerId && t.name.toLowerCase().trim() === PlayerId.toLowerCase().trim(),
    )
    return playerData ? playerData.image : null
  }
  interface PerformanceRadarChartProps {
    playerData: PlayerData
  }
  const getTeamLogo = (teamName: string) => {
    if (!teamName) return null
    const teamData = teams_logos.find(
      (t) => t.name && teamName && t.name.toLowerCase().trim() === teamName.toLowerCase().trim(),
    )
    return teamData ? teamData.logo : null
  }
  const handleSort = (key: string) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }
  // Filter matches based on selected competition
  const filteredMatches = useMemo(() => {
    if (!playerData?.matchlog_table) return []
    if (selectedComp === "All") return playerData.matchlog_table
    return playerData.matchlog_table.filter((match) => match.comp === selectedComp)
  }, [playerData?.matchlog_table, selectedComp])
  const sortedMatches = useMemo(() => {
    if (!filteredMatches.length) return []
    const sortableMatches = [...filteredMatches]
    if (sortConfig.key) {
      sortableMatches.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof MatchData]
        let bValue = b[sortConfig.key as keyof MatchData]
        // Convert to numbers for numeric columns
        if (typeof aValue === "string" && !isNaN(Number(aValue))) {
          aValue = Number(aValue)
        }
        if (typeof bValue === "string" && !isNaN(Number(bValue))) {
          bValue = Number(bValue)
        }
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }
    return sortableMatches
  }, [filteredMatches, sortConfig])

  const handleCompChange = (newComp: string) => {
    setSelectedComp(newComp)
  }

    const handleYearChange = (newYear: string) => {
    setSelectedYear(newYear)
  }

  const fetchGoalLogData = async (
    playerName: string,
    squad: string,
    comp: string, 
    season: string,
  ): Promise<GoalLogData | null> => {
    try {
      const apiBaseUrl = "https://3fwc3rm2jr.us-east-2.awsapprunner.com"
      const apiUrl = `${apiBaseUrl}/player_data/goallog/${playerName}/${selectedComp}?season=${season}`
      console.log("Fetching goal log data from:", apiUrl)
      const response = await fetch(apiUrl, {
        headers: {
          'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
        }
      });
      if (!response.ok) {
        console.warn(`Goal log data not available for ${playerName}, ${comp}, ${season}: ${response.status}`)
        return null
      }
      const goalLogData = await response.json()
      console.log("Goal log data:", goalLogData)
      return goalLogData
    } catch (error) {
      console.error("Error fetching goal log data:", error)
      return null
    }
  }
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerId) {
        console.error("Missing required parameters:", { playerId })
        setError("Parâmetros inválidos")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const apiBaseUrl = "https://3fwc3rm2jr.us-east-2.awsapprunner.com"
        const apiUrl = `${apiBaseUrl}/player_data/${playerId}/${selectedComp}?season=${selectedYear}`
        console.log("Fetching player data from:", apiUrl)
        const response = await fetch(apiUrl, {
        headers: {
          'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
        }
      });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const apiData = await response.json()
        console.log("API Response:", apiData)
        console.log("Player insights:", apiData.player_insights)
        console.log("VS Opponent data:", apiData.vs_opponent)

        const compsFromCurrentData = apiData.comps || [];
        setAvailableComps(compsFromCurrentData);
        
        if (selectedComp !== "All" && !compsFromCurrentData.includes(selectedComp)) {
          setSelectedComp("All")
        }
        const matches = apiData.matchlog_table || []
        const totalGoals = matches.reduce((sum, match) => sum + (Number(match.gls) || 0), 0)
        const homeMatches = matches.filter((match) => match.venue === "Home")
        const homeGoals = homeMatches.reduce((sum, match) => sum + (Number(match.gls) || 0), 0)
        const homeGoalsPercent = totalGoals > 0 ? +((homeGoals / totalGoals) * 100).toFixed(2) : 0
        const seasonStats = {
          matches: matches.length,
          goals: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.gls) || 0), 0),
          assists: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.ast) || 0), 0),
          shots: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.sh) || 0), 0),
          shotsOnTarget: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.sot) || 0), 0),
          fouls: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.fls) || 0), 0),
          foulsDrawn: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.fld) || 0), 0),
          yellowCards: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.crdy) || 0), 0),
          redCards: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.crdr) || 0), 0),
          err: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.err) || 0), 0),
          passBlock: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.passb) || 0), 0),
          shBlock: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.shb) || 0), 0),
          int: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.int) || 0), 0),
          gca: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.gca) || 0), 0),
          sca: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.sca) || 0), 0),
          tDibble: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.att) || 0), 0),
          succDibble: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.succ) || 0), 0),
          tklWon: matches.reduce((sum: number, match: MatchData) => sum + (Number(match.tklw) || 0), 0),
          dibblePercent:
            matches.reduce((sum, m) => sum + (Number(m.att) || 0), 0) > 0
              ? +(
                  (matches.reduce((sum, m) => sum + (Number(m.succ) || 0), 0) /
                    matches.reduce((sum, m) => sum + (Number(m.att) || 0), 0)) *
                  100
                ).toFixed(2)
              : 0,
          cmpPercent:
            matches.length > 0
              ? +(
                  matches.reduce((sum: number, match: MatchData) => sum + (Number(match.cmpp) || 0), 0) / matches.length
                ).toFixed(2)
              : 0,
          shPercent:
            matches.reduce((sum, m) => sum + (Number(m.sh) || 0), 0) > 0
              ? +(
                  (matches.reduce((sum, m) => sum + (Number(m.sot) || 0), 0) /
                    matches.reduce((sum, m) => sum + (Number(m.sh) || 0), 0)) *
                  100
                ).toFixed(2)
              : 0,
        }
        const mappedPlayerData: PlayerData = {
          name: apiData.matchlog_table?.[0]?.player?.replace(/-/g, " ") || playerId.replace(/-/g, " "),
          team: apiData.matchlog_table?.[0]?.squad?.replace(/-/g, " ") || "Unknown Team",
          competition: selectedComp === "All" ? "All Competitions" : selectedComp.replace(/-/g, " "),
          position: apiData.matchlog_table?.[0]?.pos?.replace(/-/g, " ") || "Unknown",
          availableComps: compsFromCurrentData, // Use the newly updated list
          matchlog_table: apiData.matchlog_table || [],
          metrics: apiData.metrics || {
            Attack: 0,
            Criative: 0,
            Defense: 0,
            Pass: 0,
          },
          player_mean_stats: apiData.player_mean_stats || {},
          seasons: apiData.seasons || {},
          player_max_stats: apiData.player_max_stats || {},
          league_mean_stats: apiData.league_mean_stats || {},
          player_insights: apiData.player_insights || {},
          seasonStats,
          homeGoalsPercent,
          // Add the new vs opponent data
          vs_opponent: apiData.vs_opponent || [],
          vs_opponent_mean_per_game: apiData.vs_opponent_mean_per_game || {},
          vs_opponent_stat_rates: apiData.vs_opponent_stat_rates || {},
          vs_opponent_winrate: apiData.vs_opponent_winrate || 0,
        }
        
        // Fetch goal log data if we have match data
        if (mappedPlayerData.matchlog_table && mappedPlayerData.matchlog_table.length > 0) {
          // Determine the competition to use for goal log data
          // If selectedComp is "All", use the first competition from the *currently available* comps.
          // Otherwise, use the selectedComp.
          const compToUseForGoalLog = selectedComp === "All" ? compsFromCurrentData[0] || "La-Liga" : selectedComp
          const filteredMatchesForGoalLog = mappedPlayerData.matchlog_table.filter(
            (match) => match.comp === compToUseForGoalLog,
          )
          if (filteredMatchesForGoalLog.length > 0) {
            const squadFromMatches = filteredMatchesForGoalLog[0].squad
            console.log(
              `Fetching goal log for player: ${playerId}, squad: ${squadFromMatches}, comp: ${compToUseForGoalLog}, season: ${selectedYear}`,
            )

            
            const goalLogData = await fetchGoalLogData(
              playerId,
              squadFromMatches,
              compToUseForGoalLog, // Pass the correctly determined comp
              selectedYear,
            )
            if (goalLogData) {
              mappedPlayerData.goalLogData = goalLogData
            } else {
              mappedPlayerData.goalLogData = null // Explicitly set to null if fetch fails
            }
          } else {
            // If no matches for the determined compToUseForGoalLog, set goalLogData to null
            mappedPlayerData.goalLogData = null
          }
        } else {
          // If no matchlog_table data at all, set goalLogData to null
          mappedPlayerData.goalLogData = null
        }
        setPlayerData(mappedPlayerData)
      } catch (error) {
        console.error("Error fetching player data:", error)
        setError(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    fetchPlayerData()
  }, [playerId, selectedComp, selectedYear])
  const PerformanceRadarChart: React.FC<PerformanceRadarChartProps> = ({ playerData }) => {
    const [showInfoPopup, setShowInfoPopup] = useState(false)
    if (!playerData || !playerData.player_mean_stats || !playerData.league_mean_stats) return null
    // Position-based metrics configuration
    const getMetricsForPosition = (position: string) => {
      const pos = position.toLowerCase()
      // Check if player is in attack positions
      if (pos.includes("fw") || pos.includes("cf") || pos.includes("lw") || pos.includes("rw") || pos.includes("st")) {
        return [
          { key: "ast", label: "Ast", unit: "", description: "Assistências" },
          { key: "gls", label: "Gls", unit: "", description: "Gols" },
          { key: "gca", label: "Gca", unit: "", description: "Ações Criadoras de Gol" },
          { key: "xg", label: "xG", unit: "", description: "Gols Esperados" },
          { key: "sh", label: "Sh", unit: "", description: "Chutes" },
          { key: "sot", label: "Sot", unit: "", description: "Chutes no Alvo" },
          { key: "fld", label: "Fld", unit: "", description: "Faltas Sofridas" },
        ]
      }
      // Check if player is in midfield positions
      if (pos.includes("cm") || pos.includes("dm") || pos.includes("am") || pos.includes("lm") || pos.includes("rm")) {
        return [
          { key: "ast", label: "Ast", unit: "", description: "Assistências" },
          { key: "gls", label: "Gls", unit: "", description: "Gols" },
          { key: "gca", label: "Gca", unit: "", description: "Ações Criadoras de Gol" },
          { key: "sh", label: "Sh", unit: "", description: "Chutes" },
          { key: "sot", label: "Sot", unit: "", description: "Chutes no Alvo" },
          { key: "crs", label: "Crs", unit: "", description: "Cruzamentos" },
          { key: "cmp%", label: "CPass %", unit: "%", description: "% Passes Completos" },
          { key: "crdy", label: "Crdy", unit: "", description: "Cartões Amarelos" },
          { key: "fld", label: "Fld", unit: "", description: "Faltas Sofridas" },
          { key: "fls", label: "Fls", unit: "", description: "Faltas Cometidas" },
        ]
      }
      // Check if player is in defense positions (including goalkeepers)
      if (
        pos.includes("cb") ||
        pos.includes("lb") ||
        pos.includes("rb") ||
        pos.includes("wb") ||
        pos.includes("df") ||
        pos.includes("gk")
      ) {
        return [
          { key: "int", label: "Int", unit: "", description: "Interceptações" },
          { key: "passb", label: "Passb", unit: "", description: "Passes Bloqueados" },
          { key: "blocks", label: "Blocks", unit: "", description: "Bloqueios" },
          { key: "fls", label: "Fls", unit: "", description: "Faltas Cometidas" },
          { key: "tklw.1", label: "Tklw", unit: "", description: "Desarmes Ganhos" },
          { key: "recov", label: "Recov", unit: "", description: "Recuperações de Bola" },
        ]
      }
      // Default fallback for unknown positions (use midfield stats)
      return [
        { key: "ast", label: "Ast", unit: "", description: "Assistências" },
        { key: "gls", label: "Gls", unit: "", description: "Gols" },
        { key: "gca", label: "Gca", unit: "", description: "Ações Criadoras de Gol" },
        { key: "sh", label: "Sh", unit: "", description: "Chutes" },
        { key: "sot", label: "Sot", unit: "", description: "Chutes no Alvo" },
        { key: "crs", label: "Crs", unit: "", description: "Cruzamentos" },
        { key: "cmp%", label: "CPass %", unit: "%", description: "% Passes Completos" },
        { key: "crdy", label: "Crdy", unit: "", description: "Cartões Amarelos" },
        { key: "fld", label: "Fld", unit: "", description: "Faltas Sofridas" },
        { key: "fls", label: "Fls", unit: "", description: "Faltas Cometidas" },
      ]
    }
    // Get metrics based on player position
    const metricsConfig = getMetricsForPosition(playerData.position)
    // Create data using actual player stats compared to league averages
    const data = metricsConfig.map((metric) => {
      const playerMean = playerData.player_mean_stats[metric.key] || 0
      const leagueMean = playerData.league_mean_stats[metric.key] || 0
      const playerName = playerData.matchlog_table?.[0]?.player?.replace(/-/g, " ") || "Unknown"
      let displayValue = playerMean
      let percentage = 50 // Default to middle (league average)
      // Special handling for percentage stats like cmp%
      if (metric.key === "cmp%") {
        displayValue = playerMean
        // For percentage stats, compare directly
        if (leagueMean > 0) {
          const ratio = playerMean / leagueMean
          // Scale so that league average = 100%, and adjust accordingly
          percentage = Math.min(Math.max(ratio * 100, 10), 100)
        }
      } else {
        // For other stats, calculate relative performance to league average
        if (leagueMean > 0) {
          const ratio = playerMean / leagueMean
          // Scale so that league average = 100%
          // If player equals league average, they get 100%
          percentage = Math.min(Math.max(ratio * 100, 10), 100)
        } else if (playerMean > 0) {
          // If no league data but player has stats, show at 75%
          percentage = 75
        }
      }
      return {
        label: metric.label,
        value: percentage,
        displayValue: displayValue,
        leagueAverage: leagueMean,
        unit: metric.unit,
        description: metric.description,
        player: playerName,
      }
    })
    // SVG dimensions
    const svgWidth = 500
    const svgHeight = 450
    // Center the radar chart in the SVG
    const centerX = svgWidth / 2
    const centerY = svgHeight / 2
    const maxRadius = 140
    const angleStep = (2 * Math.PI) / data.length
    // Calculate points for the polygon (mean values)
    const meanPoints = data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2
      const normalizedValue = item.value / 100
      const radius = maxRadius * normalizedValue
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      return { x, y, ...item }
    })
    // Create path for filled area (mean values)
    const meanPathData =
      meanPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ") + " Z"
    return (
      <div className="flex flex-col items-start bg-[#111] p-1 rounded-lg relative">
        <div className="flex flex-col w-[500px]">
          <div className="flex items-center justify-between mb-0">
            <h2 className="text-white text-lg font-semibold text-center flex-1">Desempenho do Jogador</h2>
            <button
              onClick={() => setShowInfoPopup(true)}
              className=" hover:bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-sm transition-colors border-[2px] border-gray-400 "
              title="Informações sobre as estatísticas"
            >
              i
            </button>
          </div>
          <svg width="600" height="500" className="mb-1 mt-1">
            {/* Grid circles - show 0, 0.25, 0.5, 0.75, and 1.0 levels with different styles */}
            {/* Bold circles for 0, 0.5, and 1.0 */}
            <circle
              cx={centerX}
              cy={centerY}
              r={maxRadius * 0}
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="2"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={maxRadius * 0.5}
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="2"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={maxRadius * 1.0}
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="2"
            />
            {/* Thin circles for 0.25 and 0.75 */}
            <circle
              cx={centerX}
              cy={centerY}
              r={maxRadius * 0.25}
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={maxRadius * 0.75}
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
            {/* Grid level labels - only show "Avg Top 10 Players" for 1.0 level */}
            <text
              x={centerX - 50}
              y={centerY - maxRadius * 1.0 - 8}
              textAnchor="center"
              className="fill-gray-400 text-xs"
              style={{ fontSize: "10px" }}
            >
              Avg Top 10 Players
            </text>
            {/* Axis lines */}
            {data.map((_, index) => {
              const angle = index * angleStep - Math.PI / 2
              const x2 = centerX + maxRadius * Math.cos(angle)
              const y2 = centerY + maxRadius * Math.sin(angle)
              return (
                <line
                  key={`axis-${index}`}
                  x1={centerX}
                  y1={centerY}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
              )
            })}
            {/* Filled area for player performance */}
            <path d={meanPathData} fill="rgba(34, 197, 94, 0.6)" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2" />
            {/* Data points */}
            {meanPoints.map((point, index) => (
              <circle key={`point-${index}`} cx={point.x} cy={point.y} />
            ))}
            {/* Labels and values - all left aligned */}
            {data.map((item, index) => {
              const angle = index * angleStep - Math.PI / 2
              const labelRadius = maxRadius + 35
              const x = centerX + labelRadius * Math.cos(angle)
              const y = centerY + labelRadius * Math.sin(angle)
              return (
                <g key={`label-${index}`}>
                  <text x={x - 4} y={y - 8} textAnchor="center" className="fill-white " style={{ fontSize: "11px" }}>
                    {item.label}
                  </text>
                  <text x={x - 4} y={y + 8} textAnchor="center" className="fill-gray-600 " style={{ fontSize: "11px" }}>
                    {item.unit === "%" ? `${item.displayValue.toFixed(1)}%` : item.displayValue.toFixed(1)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        {/* Position indicator - left aligned */}
        <div className="w-full text-left mt-[-10px]">
          <div className="text-xs text-gray-500 mt-1">Performance vs Top 10 Jogadores da Competição</div>
        </div>
        {/* Info Popup */}
        {showInfoPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#222] rounded-lg p-6 max-w-lg w-full mx-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-semibold">Legenda das Estatísticas</h3>
                <button
                  onClick={() => setShowInfoPopup(false)}
                  className="text-gray-400 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left text-white font-medium py-2">Estatística</th>
                      <th className="text-center text-gray-400 font-medium py-2">{playerId.replace(/-/g, " ")}</th>
                      <th className="text-center text-gray-400 font-medium py-2">Top 10</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index} className="border-b border-gray-600">
                        <td className="py-2">
                          <span className="text-white font-medium">{item.description}</span>
                          <span className="text-gray-400 text-xs"> ({item.label})</span>
                        </td>
                        <td className="text-center text-gray-400 py-2">
                          {item.unit === "%" ? `${item.displayValue.toFixed(1)}%` : item.displayValue.toFixed(1)}
                        </td>
                        <td className="text-center text-gray-400 py-2">
                          {item.unit === "%" ? `${item.leagueAverage.toFixed(1)}%` : item.leagueAverage.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  // Novo componente para mostrar os insights detalhados
  const PlayerInsightsComponent: React.FC<{ playerData: PlayerData }> = ({ playerData }) => {
    const [showInfoPopup, setShowInfoPopup] = useState<string | null>(null)
    if (!playerData.player_insights) return null
    const getStatLabel = (stat: string) => {
      const labels = {
        gls: "Gols",
        ast: "Assistências",
        sot: "Chutes no Gol",
        tklw: "Desarmes",
        crdy: "Cartões Amarelos",
        crdr: "Cartões Vermelhos",
        fls: "Faltas Cometidas",
        fld: "Faltas Sofridas",
        sh: "Chutes",
        int: "Interceptações",
        blocks: "Bloqueios",
        passb: "Passes Bloqueados",
        shb: "Chutes Bloqueados",
        sca: "Chances de Chute Criadas",
        gca: "Chances de Gol Criadas",
        cmp: "Passes Completos",
        att: "Tentativas de Drible",
        succ: "Dribles Bem-sucedidos",
        recov: "Recuperações de Bola",
        err: "Erros",
        off: "Impedimentos",
        prgp: "Passes Progressivos",
        prgc: "Conduções Progressivas",
      }
      return labels[stat as keyof typeof labels] || stat.toUpperCase()
    }
    const getStatDescription = (stat: string) => {
      const descriptions = {
        gls: "Número de gols marcados pelo jogador",
        ast: "Número de assistências realizadas",
        sot: "Número de chutes direcionados ao gol",
        tklw: "Número de desarmes bem-sucedidos",
        crdy: "Número de cartões amarelos recebidos",
        crdr: "Número de cartões vermelhos recebidos",
        fls: "Número de faltas cometidas",
        fld: "Número de faltas sofridas",
        sh: "Número total de chutes realizados",
        int: "Número de interceptações de passes",
        blocks: "Número de bloqueios defensivos",
        passb: "Número de passes bloqueados",
        shb: "Número de chutes bloqueados",
        sca: "Ações que levaram diretamente a um chute",
        gca: "Ações que levaram diretamente a um gol",
        cmp: "Número de passes completados com sucesso",
        att: "Número de tentativas de drible",
        succ: "Número de dribles completados com sucesso",
        recov: "Número de recuperações de posse de bola",
        err: "Número de erros que levaram a oportunidades do adversário",
        off: "Número de vezes que ficou em posição de impedimento",
        prgp: "Passes que avançaram a bola em direção ao gol",
        prgc: "Conduções que avançaram a bola em direção ao gol",
      }
      return descriptions[stat as keyof typeof descriptions] || `Estatística relacionada a ${stat}`
    }
    // Obter todas as stats disponíveis
    const availableStats = Object.keys(playerData.player_insights)
    return (
      <div className="bg-[#111] rounded-lg p-6">
        <h2 className="text-white text-lg font-semibold mb-6">Análise Detalhada de Performance por Estatística</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 w-full">
          {availableStats.map((stat) => {
            const data = playerData.player_insights[stat as keyof PlayerInsights]
            if (!data) return null
            const activeStreak = data.active_streaks
            const inactiveStreak = data.inactive_streaks
            const momentum = data.momentum
            return (
              <div key={stat} className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-green-500 w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <h3 className="text-white font-semibold text-sm">{getStatLabel(stat)}</h3>
                      <span className="text-gray-400 text-xs uppercase">{stat}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInfoPopup(showInfoPopup === stat ? null : stat)}
                    className="hover:bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-sm transition-colors border-[2px] border-gray-400"
                    title="Informações sobre esta estatística"
                  >
                    !
                  </button>
                </div>
                {/* Stat Streak (Active) */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white text-sm font-semibold">Stat Streak</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-400">Atual</div>
                      <div className="text-white font-bold text-lg">{activeStreak.current}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Média</div>
                      <div className="text-white font-bold text-lg">{activeStreak.mean.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Máx</div>
                      <div className="text-white font-bold text-lg">{activeStreak.max}</div>
                    </div>
                  </div>
                </div>
                {/* Statless Streak (Inactive) */}
                <div className="border-t border-gray-700 pt-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 text-sm font-semibold">Statless Streak</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-400">Atual</div>
                      <div className="text-white font-bold text-lg">{inactiveStreak.current}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Média</div>
                      <div className="text-white font-bold text-lg">{inactiveStreak.mean.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Máx</div>
                      <div className="text-white font-bold text-lg">{inactiveStreak.max}</div>
                    </div>
                  </div>
                </div>
                {/* Momentum */}
                <div className="border-t border-gray-700 pt-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500 text-sm font-semibold">Momentum</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Média janela (5 partidas):</span>
                      <span className="text-white font-bold">{momentum.avg_2_last_windows.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">{stat} nos últimos 5 jogos:</span>
                      <span className="text-white font-bold">{momentum.current_window_stat}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Jogos na janela atual (5 partidas)</span>
                      <span className="text-white font-bold">{momentum.current_window_match}</span>
                    </div>
                  </div>
                </div>
                {/* Info Popup para cada card */}
                {showInfoPopup === stat && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="relative">
                      <button
                        onClick={() => setShowInfoPopup(null)}
                        className="absolute -top-10 -right-4  hover text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold z-10 transition-colors"
                      >
                        ×
                      </button>
                      {/* Card do popup */}
                      <div className="bg-[#222] rounded-lg p-6 max-w-[550px] w-full mx-4">
                        <div className="text-center space-y-6">
                          <div>
                            <h3 className="text-white text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                              {getStatLabel(stat)}
                            </h3>
                            <h4 className="text-white font-medium mb-2">O que é esta estatística?</h4>
                            <p className="text-gray-300 text-sm">{getStatDescription(stat)}</p>
                          </div>
                          <div>
                            <h4 className="text-white font-medium mb-4">Explicação dos dados:</h4>
                            <div className="space-y-4 text-sm text-left">
                              <div>
                                <span className="text-white font-medium">Stat Streak:</span>
                                <p className="text-gray-300 mt-1">
                                  Sequência de jogos consecutivos COM esta estatística
                                </p>
                                <ul className="text-gray-400 text-xs ml-4 mt-2 space-y-1">
                                  <li>• Atual: Jogos consecutivos com 1 ou mais {getStatLabel(stat)}</li>
                                  <li>
                                    • Média: Média histórica de jogos consecutivos com 1 ou mais {getStatLabel(stat)}
                                  </li>
                                  <li>• Máx: Maior sequência já registrada</li>
                                </ul>
                              </div>
                              <div>
                                <span className="text-white font-medium">Statless Streak:</span>
                                <p className="text-gray-300 mt-1">
                                  Sequência de jogos consecutivos SEM esta estatística
                                </p>
                                <ul className="text-gray-400 text-xs ml-4 mt-2 space-y-1">
                                  <li>• Atual: Jogos consecutivos com 0 {getStatLabel(stat)}</li>
                                  <li>• Média: Média histórica de jogos consecutivos com 0 {getStatLabel(stat)}</li>
                                  <li>• Máx: Maior sequência já registrada</li>
                                </ul>
                              </div>
                              <div>
                                <span className="text-white font-medium">Momentum:</span>
                                <p className="text-gray-300 mt-1">Análise da performance recente</p>
                                <ul className="text-gray-400 text-xs ml-4 mt-2 space-y-1">
                                  <li>
                                    • Média janela: Calcula a média de {getStatLabel(stat)} que o jogador marcou em
                                    intervalos de 5 jogos
                                  </li>
                                  <li>• Últimos 5 jogos: Total da {getStatLabel(stat)} nos últimos 5 jogos</li>
                                  <li>• Jogos na janela: Quantidade de partidas jogadas na janela atual (máximo 5)</li>
                                </ul>
                              </div>
                              <div>
                                <span className="text-white font-medium">Como fazer o bom uso desses dados</span>
                                <p className="text-gray-300 mt-1">
                                  Esses dados servem para ajudar na análise de streak dos jogadores.
                                  <br />
                                  Stat Streak acima da média pode indicar que o jogador está prester a parar de fazer{" "}
                                  {getStatLabel(stat)}.<br />
                                  Statless Streak acima da média pode indicar que o jogador está prester a começar a
                                  fazer {getStatLabel(stat)} <br />O momentum calcula a média de {getStatLabel(stat)}{" "}
                                  que o jogador tem em intervalos de 5 dias.
                                  <br /> Se o jogador tiver poucas {getStatLabel(stat)}e ainda faltar muitos jogos para
                                  concluir a janela atual, pode significar que ele marcará {getStatLabel(stat)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando dados do jogador...</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-1">Erro ao carregar dados do jogador</div>
          <div className="text-white text-sm mb-4">Você está tentando acessar dados que não existem.</div>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }
  if (!playerData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Jogador não encontrado</div>
      </div>
    )
  }
  const selectOptions = [
    {
      value: "All",
      label: (
        <div className="flex items-center gap-2 text-white text-[12px]">
          <span>All Comps</span>
        </div>
      ),
    },
    ...availableComps.map((comp) => ({
      value: comp,
      label: (
        <div className="flex items-center gap-2 text-white text-[12px]">
          <img src={`/comps-logos/${comp}.png`} alt={comp} className="h-6 w-6 object-contain" />
          <span>{comp.replace(/-/g, " ")}</span>
        </div>
      ),
    })),
  ]
  // Adicione esta constante para as opções de ano, você pode expandir isso dinamicamente se tiver mais anos.
  // Se você tiver uma lista dinâmica de anos do seu backend, você pode gerar isso de forma semelhante a `availableComps`.
const selectYearOptions = playerData.seasons.map(season => ({
      value: season,
      label: season,
    }));
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="bg-black py-6 px-4 border-b border-gray-800">
        <div className="container mx-auto flex items-center gap-4">
          <div className="relative h-20 w-20 ml-3">
            <img
              src={getPlayerPhoto(playerId) || "/placeholder.svg?height=64&width=64"}
              alt={playerData.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">{playerData.name}</h1>
            <div className="flex items-center gap-2"></div>
            <button
              className="ml-0 mt-0 w-[120px] text-center rounded-md p-0 bg-transparent border-none"
              onClick={() => {}}
            >
              <img src="/button_compare2.png" alt="Compare" className="w-full rounded-md" />
            </button>
            <div className="flex gap-1 mt-0">
              <div>
                <Select
                  options={selectOptions}
                  value={selectOptions.find((opt) => opt.value === selectedComp)}
                  onChange={(opt) => handleCompChange(opt?.value || "All")}
                  isSearchable={false}
                  components={{ IndicatorSeparator: () => null }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "30px",
                      height: "30px",
                      background: "transparent",
                      border: "none",
                      alignItems: "center",
                      width: "auto",
                      boxShadow: "none",
                      outline: "none",
                    }),
                    input: (base) => ({
                      ...base,
                      boxShadow: "none",
                      outline: "none",
                      color: "#fff",
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      height: "30px",
                      padding: "0 6px",
                      display: "flex",
                      alignItems: "center",
                      width: "auto",
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      height: "30px",
                      width: "auto",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      width: "auto",
                      color: "#fff",
                    }),
                    option: (base, state) => ({
                      ...base,
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: state.isActive
                        ? "#001803"
                        : state.isSelected
                          ? "#001803"
                          : state.isFocused
                            ? "#222"
                            : "#111",
                      color: "#fff",
                      minHeight: "40px",
                      height: "40px",
                      width: "auto",
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "#111",
                      zIndex: 50,
                      width: "auto",
                    }),
                  }}
                />
              </div>
              <Select
                options={selectYearOptions}
                value={selectYearOptions.find((opt) => opt.value === selectedYear)}
                onChange={(opt) => handleYearChange(opt?.value || "All")}
                isSearchable={false}
                components={{ IndicatorSeparator: () => null }}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "30px",
                    height: "30px",
                    background: "transparent",
                    border: "none",
                    alignItems: "center",
                    width: "auto",
                    boxShadow: "none",
                    outline: "none",
                  }),
                  input: (base) => ({
                    ...base,
                    boxShadow: "none",
                    outline: "none",
                    color: "#fff",
                    
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    height: "30px",
                    padding: "0 6px",
                    display: "flex",
                    alignItems: "center",
                    width: "auto",
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: "30px",
                    width: "auto",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "auto",
                    color: "#fff",
                    fontSize: "12px",
                  }),
                  option: (base, state) => ({
                    ...base,
                    display: "flex",
                    alignItems: "center",
                    // Alterado para verde escuro (#001803) e texto branco quando ativo, selecionado ou focado
                    backgroundColor: state.isActive
                      ? "#001803"
                      : state.isSelected
                        ? "#001803"
                        : state.isFocused
                          ? "#222" // Cor para hover/foco sem estar selecionado
                          : "#111",
                    color: "#fff",
                    minHeight: "40px",
                    height: "40px",
                    width: "auto",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#111",
                    zIndex: 50,
                    width: "auto",
                    fontSize: "12px",
                  }),
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Log */}
        <div className="bg-[#111] rounded-lg p-6 lg:col-span-2">
          <h2 className="text-white text-lg font-semibold mb-4">Match Log</h2>
          <div
            className="h-[500px] overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(75, 85, 99, 0.3) transparent",
            }}
          >
            <table className="w-full text-white text-xs">
              <thead className="sticky top-0 bg-[#111] z-10">
                <tr className="text-gray-400 border-b border-gray-800">
                  <th
                    className="py-2 text-left cursor-pointer hover:text-white"
                    title="Data da partida"
                    onClick={() => handleSort("date")}
                  >
                    Data {sortConfig.key === "date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-left cursor-pointer hover:text-white"
                    title="Adversário"
                    onClick={() => handleSort("opponent")}
                  >
                    Adv {sortConfig.key === "opponent" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-left cursor-pointer hover:text-white"
                    title="Competição"
                    onClick={() => handleSort("comp")}
                  >
                    Comp {sortConfig.key === "comp" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Resultado da partida"
                    onClick={() => handleSort("result")}
                  >
                    Resultado {sortConfig.key === "result" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Local da partida"
                    onClick={() => handleSort("venue")}
                  >
                    Local {sortConfig.key === "venue" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Jogou como titular"
                    onClick={() => handleSort("start")}
                  >
                    Titular {sortConfig.key === "start" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Gols marcados"
                    onClick={() => handleSort("gls")}
                  >
                    G {sortConfig.key === "gls" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Assistências"
                    onClick={() => handleSort("ast")}
                  >
                    A {sortConfig.key === "ast" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Chutes totais"
                    onClick={() => handleSort("sh")}
                  >
                    CH {sortConfig.key === "sh" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Chutes no gol"
                    onClick={() => handleSort("sot")}
                  >
                    CG {sortConfig.key === "sot" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Faltas cometidas"
                    onClick={() => handleSort("fls")}
                  >
                    FC {sortConfig.key === "fls" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Faltas sofridas"
                    onClick={() => handleSort("fld")}
                  >
                    FS {sortConfig.key === "fld" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Cartões amarelos"
                    onClick={() => handleSort("crdy")}
                  >
                    CA {sortConfig.key === "crdy" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2 text-center cursor-pointer hover:text-white"
                    title="Cartões vermelhos"
                    onClick={() => handleSort("crdr")}
                  >
                    CV {sortConfig.key === "crdr" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMatches.map((match, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-800 hover:bg-gray-900 ${
                      match.venue === "Home" ? "bg-[#1a1a1a]" : ""
                    }`}
                  >
                    <td className="py-2 text-xs" title={`Partida em ${match.date}`}>
                      {(() => {
                        const [year, month, day] = match.date.split("-")
                        return `${year.slice(-2)}-${month}-${day}`
                      })()}
                    </td>
                    <td className="py-2" title={`${match.venue}`}>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400 mr-1">{match.venue === "Home" ? "x" : "em"}</span>
                        <img
                          src={getTeamLogo(match.opponent) || "/placeholder.svg?height=24&width=24"}
                          alt="Opponent"
                          className="w-5 h-5 object-contain"
                        />
                        <span className="text-xs">{match.opponent.replace(/-/g, " ")}</span>
                      </div>
                    </td>
                    <td className="py-2 text-xs" title={`${match.comp}`}>
                      {match.comp}
                    </td>
                    <td className="py-2 text-center" title={`${match.result}`}>
                      <span className={`px-1 py-0.5 rounded text-xs`}>{match.result}</span>
                    </td>
                    <td className="py-2 text-center" title={match.venue === "Home" ? "Jogou em casa" : "Jogou fora"}>
                      <span
                        className={`px-1 py-0.5 rounded text-xs text-white ${
                          match.venue === "Home" ? "font-thin" : "font-thin"
                        }`}
                      >
                        {match.venue === "Home" ? "C" : "F"}
                      </span>
                    </td>
                    <td
                      className="py-2 text-center"
                      title={match.start === "Y" ? "Jogou como titular" : "Entrou do banco"}
                    >
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${match.start === "Y" ? "font-thin" : "font-thin"}`}
                      >
                        {match.start === "Y" ? "S" : "N"}
                      </span>
                    </td>
                    <td className="py-2 text-center" title={`${match.gls} gols marcados`}>
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${Number(match.gls) >= 1 ? "font-black" : "font-thin"}`}
                      >
                        {match.gls}
                      </span>
                    </td>
                    <td className="py-2 text-center" title={`${match.ast} assistências`}>
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${Number(match.ast) >= 1 ? "font-black" : "font-thin"}`}
                      >
                        {match.ast}
                      </span>
                    </td>
                    <td className="py-2 text-center" title={`${match.sh} chutes totais`}>
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${Number(match.sh) >= 1 ? "font-black" : "font-thin"}`}
                      >
                        {match.sh}
                      </span>
                    </td>
                    <td className="py-2 text-center" title={`${match.sot} chutes no gol`}>
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${Number(match.sot) >= 1 ? "font-black" : "font-thin"}`}
                      >
                        {match.sot}
                      </span>
                    </td>
                    <td className="py-2 text-center" title={`${match.fls} faltas cometidas`}>
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${Number(match.fls) >= 1 ? "font-black" : "font-thin"}`}
                      >
                        {match.fls}
                      </span>
                    </td>
                    <td className="py-2 text-center" title={`${match.fld} faltas sofridas`}>
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${Number(match.fld) >= 1 ? "font-black" : "font-thin"}`}
                      >
                        {match.fld}
                      </span>
                    </td>
                    <td className="py-2 text-center" title={`${match.crdy} cartões amarelos`}>
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${Number(match.crdy) >= 1 ? "font-black" : "font-thin"}`}
                      >
                        {match.crdy}
                      </span>
                    </td>
                    <td className="py-2 text-center" title={`${match.crdr} cartões vermelhos`}>
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${Number(match.crdr) >= 1 ? "font-black" : "font-thin"}`}
                      >
                        {match.crdr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-[#111] rounded-lg p-3">
          <PerformanceRadarChart playerData={playerData} />
        </div>
        <div className="bg-[#111] rounded-lg p-6 lg:col-span-3">
          <h2 className="text-white text-lg font-semibold mb-4">Estatísticas da Temporada</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Jogos</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.matches}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Gols</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.goals}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Assistências</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.assists}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Chutes</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.shots}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Chutes no Gol</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.shotsOnTarget}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Cartões Amarelos</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.yellowCards}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Cartões Vermelhos</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.redCards}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Faltas Cometidas</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.fouls}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Faltas Sofridas</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.foulsDrawn}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Interceptações</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.int}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Erros que levaram a ataque</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.err}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Desarmes</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.tklWon}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Chances de chute criadas</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.sca}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Chances de gols criadas</div>
              <div className="text-white text-2xl font-bold">{playerData.seasonStats.gca}</div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Porcentagem de passes certos</div>
              <div className="text-white text-2xl font-bold flex items-baseline">
                {playerData.seasonStats.cmpPercent}
                <span className="text-[21px] text-gray-400 ml-1">%</span>
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Porcentagem de chutes no gol</div>
              <div className="text-white text-2xl font-bold flex items-baseline">
                {playerData.seasonStats.shPercent}
                <span className="text-[21px] text-gray-400 ml-1">%</span>
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Porcentagem de dibres certos</div>
              <div className="text-white text-2xl font-bold flex items-baseline">
                {playerData.seasonStats.dibblePercent}
                <span className="text-[21px] text-gray-400 ml-1">%</span>
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Porcentagem gols em casa</div>
              <div className="text-white text-2xl font-bold flex items-baseline">
                {playerData.homeGoalsPercent}
                <span className="text-[21px] text-gray-400 ml-1">%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <PlayerInsightsComponent playerData={playerData} />
        </div>
        <div className="lg:col-span-3">
          <PlayerVsOpponentCard playerData={playerData} />
        </div>
        {/* New Goal Log Component */}
        {playerData.goalLogData && (
          <div className="lg:col-span-3">
            <GoalLogComponent playerData={playerData} />
          </div>
        )}
      </main>
    </div>
  )
}
