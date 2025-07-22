"use client"

import { useState, useEffect, use } from "react"
import { teams_logos } from "@/app/src/teamsLogos"
import Link from "next/link"
import Select from "react-select"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface TeamData {
  name: string
  logo?: string
  competition: string
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
    ga: number
    gf: number
    opponent: string
    result: string
    time: string
    venue: string
  }[]
  playerstatsTable: {
    player: string
    gls: string
    ast: string
    crdr: string
    crdy: string
    mp: string
  }[]
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
}

export default function TeamPage({ params }: { params: { teamId: string; compId: string } }) {
  const { teamId: unwrappedTeamId, compId: unwrappedCompId } = use(params)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [showAllMatches, setShowAllMatches] = useState(false)
  const [teamStatsTemp, setTeamStatsTemp] = useState<any>(null)
  const [teamGoallog, setTeamGoallog] = useState<any>(null)

  const teamId = decodeURIComponent(unwrappedTeamId)
  const compId = decodeURIComponent(unwrappedCompId)

  // Initialize selectedSeason from URL search params or default to '2025'
  // Now picks only the first season if multiple are present, or defaults
  const initialSeasonFromUrl = searchParams.get("season") || "2025"

  const [selectedComp, setSelectedComp] = useState(compId)
  const [selectedSeason, setSelectedSeason] = useState<string>(initialSeasonFromUrl) // Changed to single string
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([])
  const [teamCompsList, setTeamCompsList] = useState<{ value: string; label: string }[]>([])
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("artilheiros")
  const [sortConfig, setSortConfig] = useState({ key: "gls", direction: "desc" })
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const colors = ["bg-green-700"]

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://3fwc3rm2jr.us-east-2.awsapprunner.com"

  useEffect(() => {
    if (activeTab === "artilheiros") {
      setSortConfig({ key: "gls", direction: "desc" })
    } else if (activeTab === "assists") {
      setSortConfig({ key: "ast", direction: "desc" })
    } else if (activeTab === "variados") {
      setSortConfig({ key: "crdy", direction: "desc" })
    }
  }, [activeTab])

  // Effect to fetch available seasons
  useEffect(() => {
    const fetchAvailableSeasons = async () => {
      try {
        const response = await fetch (`${apiBaseUrl}/team_data/seasons/${teamId}`, {
        headers: {
          'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
        }

       });
        if (response.ok) {
          const rawSeasonsData = await response.json()
          let seasonsArray: string[] = []

          if (typeof rawSeasonsData === 'object' && rawSeasonsData !== null && !Array.isArray(rawSeasonsData)) {
            const teamKey = Object.keys(rawSeasonsData)[0];
            if (teamKey && Array.isArray(rawSeasonsData[teamKey])) {
              seasonsArray = rawSeasonsData[teamKey];
            } else {
              console.warn("API for available seasons returned an object but not in expected format:", rawSeasonsData);
            }
          } else if (Array.isArray(rawSeasonsData)) {
            seasonsArray = rawSeasonsData;
          } else {
            console.warn("API for available seasons did not return an array or expected object format:", rawSeasonsData);
          }

          if (seasonsArray.length > 0) {
            const sortedSeasons = seasonsArray.sort((a, b) => Number(b) - Number(a)); // Sort descending
            setAvailableSeasons(sortedSeasons);
            // If no season was selected from URL, default to the latest available season
            if (!searchParams.get("season") && sortedSeasons.length > 0) {
              setSelectedSeason(sortedSeasons[0]);
            }
          } else {
            setAvailableSeasons(["2025"]); // Fallback if no seasons found or invalid format
          }
        } else {
          console.error("Failed to fetch available seasons:", response.status, response.statusText)
          setAvailableSeasons(["2025"]) // Fallback
        }
      } catch (error) {
        console.error("Error fetching available seasons:", error)
        setAvailableSeasons(["2025"]) // Fallback
      }
    }
    fetchAvailableSeasons()
  }, [teamId, apiBaseUrl, searchParams]) // Added searchParams to dependencies to react to URL changes

  function formatTeamName(name: string) {
    return name.replace(/^[a-zA-Z]{2,3}-/, "").replace(/-/g, " ")
  }

  const calculatePerformanceMetrics = () => {
    if (!teamStatsTemp) return null

    const teamStandingData = getTeamStandingData()

    const calculateLeagueAverages = () => {
      if (!teamData || !teamData.leagueStandings) return { xg: 0 }

      const allTeams = Object.values(teamData.leagueStandings)
      const totalXG = allTeams.reduce((sum, team) => sum + (Number.parseFloat(team.xG) || 0), 0)

      return {
        xg: totalXG / allTeams.length,
      }
    }

    const leagueAverages = calculateLeagueAverages()

    let attack = 50

    if (teamStandingData && teamStandingData.xG && teamStandingData.GF) {
      const xG = Number.parseFloat(teamStandingData.xG) || 0
      const GF = Number.parseFloat(teamStandingData.GF) || 0

      const xgGfDifference = GF - xG
      console.log("xgGfDifference", xgGfDifference)

      if (xgGfDifference > 0) {
        attack += Math.min(15, xgGfDifference * 1.5)
      } else {
        attack += Math.max(-10, xgGfDifference * 1)
      }
    }

    if (teamStandingData && teamStandingData.xG && teamStandingData.GF) {
      const xG = Number.parseFloat(teamStandingData.xG) || 0

      if (leagueAverages.xg > 0) {
        const gfRatio = xG / leagueAverages.xg
        console.log("gfRatio", gfRatio)

        if (gfRatio >= 1.5) {
          attack += 10
        } else if (gfRatio >= 1.2) {
          attack += 8
        } else if (gfRatio >= 1.0) {
          attack += 5
        } else if (gfRatio >= 0.8) {
          attack += 0
        } else {
          attack -= 3
        }
      }
    }

    if (teamStatsTemp.sh_mean && teamStatsTemp.sh_comp_mean) {
      const shRatio = teamStatsTemp.sh_mean / teamStatsTemp.sh_comp_mean
      console.log("shRatio", shRatio)

      if (shRatio >= 1.3) {
        attack += 5
      } else if (shRatio >= 1.1) {
        attack += 3
      } else if (shRatio >= 0.9) {
        attack += 2
      } else if (shRatio >= 0.7) {
        attack -= 2
      } else {
        attack -= 6
      }
    }

    if (teamStatsTemp.sot_mean && teamStatsTemp.sot_comp_mean) {
      const sotRatio = teamStatsTemp.sot_mean / teamStatsTemp.sot_comp_mean
      console.log("sotRatio", sotRatio)

      if (sotRatio >= 1.3) {
        attack += 10
      } else if (sotRatio >= 1.1) {
        attack += 6
      } else if (sotRatio >= 0.9) {
        attack += 5
      } else if (sotRatio >= 0.7) {
        attack -= 3
      } else {
        attack -= 7
      }
    }

    if (teamStatsTemp.gf_mean && teamStatsTemp.gf_comp_mean) {
      const gfRatio = teamStatsTemp.gf_mean / teamStatsTemp.gf_comp_mean
      console.log("gfRatio", gfRatio)

      if (gfRatio >= 1.5) {
        attack += 12
      } else if (gfRatio >= 1.2) {
        attack += 8
      } else if (gfRatio >= 0.9) {
        attack += 5
      } else if (gfRatio >= 0.7) {
        attack -= 3
      } else {
        attack -= 9
      }
    }

    attack = Math.min(100, Math.max(20, attack))

    let defense = 50

    if (teamStandingData && teamStandingData.xGA && teamStandingData.GA) {
      const xGA = Number.parseFloat(teamStandingData.xGA) || 0
      const GA = Number.parseFloat(teamStandingData.GA) || 0

      const xgaGaDifference = xGA - GA
      console.log("xgaGaDifference", xgaGaDifference)

      if (xgaGaDifference > 0) {
        defense += Math.min(15, xgaGaDifference * 2)
        console.log(defense, "defense xga")
      } else {
        defense += Math.max(-10, xgaGaDifference * 10)
      }
    }

    if (teamStatsTemp.ga_mean && teamStatsTemp.ga_comp_mean) {
      const gaRatio = teamStatsTemp.ga_mean / teamStatsTemp.ga_comp_mean
      console.log("gaRatio", gaRatio)

      if (gaRatio >= 1.3) {
        defense -= 10
      } else if (gaRatio >= 1.1) {
        defense -= 8
      } else if (gaRatio >= 0.9) {
        defense += 5
      } else if (gaRatio >= 0.7) {
        defense += 13
      } else if (gaRatio >= 0.6) {
        defense += 15
      } else if (gaRatio >= 0.5) {
        defense += 20
      } else {
        defense += 25
      }
    }

    if (teamStatsTemp.tklw_mean && teamStatsTemp.tklw_comp_mean) {
      const tklwRatio = teamStatsTemp.tklw_mean / teamStatsTemp.tklw_comp_mean
      console.log("tklwRatio", tklwRatio)

      if (tklwRatio >= 1.3) {
        defense += 8
      } else if (tklwRatio >= 1.1) {
        defense += 5
      } else if (tklwRatio >= 0.9) {
        defense += 3
      } else if (tklwRatio >= 0.7) {
        defense -= 2
      } else {
        defense -= 1
      }
    }

    if (teamStatsTemp.recov_mean && teamStatsTemp.recov_comp_mean) {
      const recovRatio = teamStatsTemp.recov_mean / teamStatsTemp.recov_comp_mean
      console.log("recovRatio", recovRatio)

      if (recovRatio >= 1.3) {
        defense += 8
      } else if (recovRatio >= 1.1) {
        defense += 5
      } else if (recovRatio >= 0.9) {
        defense += 3
      } else if (recovRatio >= 0.7) {
        defense -= 2
      } else {
        defense -= 1
      }
    }

    if (teamStatsTemp.err_mean && teamStatsTemp.err_comp_mean) {
      const errRatio = teamStatsTemp.err_mean / teamStatsTemp.err_comp_mean
      console.log("errRatio", errRatio)

      if (errRatio <= 0.7) {
        defense += 8
      } else if (errRatio <= 0.9) {
        defense += 5
      } else if (errRatio <= 1.1) {
        defense += 2
      } else if (errRatio <= 1.3) {
        defense -= 2
      } else {
        defense -= 3
      }
    }

    defense = Math.min(100, Math.max(20, defense))

    let passing = 50

    if (teamStatsTemp.cmppt_mean && teamStatsTemp.cmppt_comp_mean) {
      const cmpRatio = teamStatsTemp.cmppt_mean / teamStatsTemp.cmppt_comp_mean
      console.log("cmpRatio", cmpRatio)

      if (cmpRatio >= 1.1) {
        passing += 25
      } else if (cmpRatio >= 1.05) {
        passing += 20
      } else if (cmpRatio >= 0.95) {
        passing += 10
      } else if (cmpRatio >= 0.9) {
        passing += 5
      } else if (cmpRatio >= 0.7) {
        passing += 4
      } else {
        passing -= 10
      }
    }

    if (teamStatsTemp.ast_mean && teamStatsTemp.ast_comp_mean) {
      const astRatio = teamStatsTemp.ast_mean / teamStatsTemp.ast_comp_mean
      console.log("astRatio", astRatio)

      if (astRatio >= 1.3) {
        passing += 13
      } else if (astRatio >= 1.1) {
        passing += 8
      } else if (astRatio >= 0.9) {
        passing += 3
      } else if (astRatio >= 0.7) {
        passing -= 5
      } else {
        passing -= 12
      }
    }

    passing = Math.min(100, Math.max(20, passing))

    let efficiency = 50

    if (teamStandingData && teamStandingData.xG && teamStandingData.GF) {
      const xG = Number.parseFloat(teamStandingData.xG) || 0
      const GF = Number.parseFloat(teamStandingData.GF) || 0

      if (xG > 0) {
        const efficiencyRatio = GF / xG

        if (efficiencyRatio >= 1.4) {
          efficiency = 100
        } else if (efficiencyRatio >= 1.2) {
          efficiency = 85
        } else if (efficiencyRatio >= 1.0) {
          efficiency = 70
        } else if (efficiencyRatio >= 0.8) {
          efficiency = 50
        } else if (efficiencyRatio >= 0.6) {
          efficiency = 35
        } else {
          efficiency = 20
        }

        console.log(
          `Efficiency calculation: GF=${GF}, xG=${xG}, ratio=${efficiencyRatio.toFixed(3)}, efficiency=${efficiency.toFixed(1)}%`,
        )
      }
    }

    let momentum = 50

    const currentWinStreak = teamStatsTemp.current_winstreak || 0
    const maxWinStreak = teamStatsTemp.max_winstreak || 1
    const avgWinStreak = teamStatsTemp.avg_winstreak || 0

    const winStreakRatio = currentWinStreak / Math.max(maxWinStreak, 1)

    if (winStreakRatio >= 1.0) {
      momentum += 20
    } else if (winStreakRatio >= 0.8) {
      momentum += 15
    } else if (winStreakRatio >= 0.6) {
      momentum += 10
    } else if (winStreakRatio >= 0.4) {
      momentum += 5
    } else if (winStreakRatio >= 0.2) {
      momentum -= 5
    } else {
      momentum -= 10
    }

    const winLast10 = teamStatsTemp.win_last_10 || 0
    const lossLast10 = teamStatsTemp.loss_last_10 || 0
    const drawLast10 = teamStatsTemp.draw_last_10 || 0
    const totalLast10 = winLast10 + lossLast10 + drawLast10

    if (totalLast10 > 0) {
      const winPercentageLast10 = (winLast10 / totalLast10) * 100

      if (winPercentageLast10 >= 80) {
        momentum += 15
      } else if (winPercentageLast10 >= 60) {
        momentum += 10
      } else if (winPercentageLast10 >= 40) {
        momentum += 5
      } else if (winPercentageLast10 >= 20) {
        momentum -= 5
      } else {
        momentum -= 10
      }
    }

    if (teamStatsTemp.gf_pgame_last_10 !== undefined) {
      const gfPgameLast10 = teamStatsTemp.gf_pgame_last_10

      if (gfPgameLast10 >= 1.5) {
        momentum += 10
      } else if (gfPgameLast10 >= 1.2) {
        momentum += 7
      } else if (gfPgameLast10 >= 1.0) {
        momentum += 5
      } else if (gfPgameLast10 >= 0.7) {
        momentum += 2
      } else {
        momentum -= 5
      }
    }

    if (teamStandingData && teamStandingData.xG && teamStandingData.xGA) {
      const xG = Number.parseFloat(teamStandingData.xG) || 0
      const xGA = Number.parseFloat(teamStandingData.xGA) || 0
      const GF = Number.parseFloat(teamStandingData.GF) || 0
      const GA = Number.parseFloat(teamStandingData.GA) || 0

      const attackTrend = GF - xG
      const defenseTrend = xGA - GA
      const overallTrend = attackTrend + defenseTrend

      if (overallTrend >= 3) {
        momentum += 5
      } else if (overallTrend >= 1) {
        momentum += 3
      } else if (overallTrend >= -1) {
        momentum += 1
      } else if (overallTrend >= -3) {
        momentum -= 2
      } else {
        momentum -= 5
      }
    }

    momentum = Math.min(100, Math.max(20, momentum))

    console.log(`Attack calculation: base=50, final=${attack}`)
    console.log(`Defense calculation: base=50, final=${defense}`)
    console.log(`Passing calculation: base=50, final=${passing}`)
    console.log(
      `Momentum calculation: base=50, final=${momentum}, current_streak=${currentWinStreak}, max_streak=${maxWinStreak}, win_ratio=${winStreakRatio.toFixed(2)}, gf_pgame_last_10=${teamStatsTemp.gf_pgame_last_10}`,
    )

    return {
      attack: Math.round(attack),
      defense: Math.round(defense),
      passing: Math.round(passing),
      efficiency: Math.round(efficiency),
      momentum: Math.round(momentum),
    }
  }

  const PerformanceRadarChart = () => {
    const metrics = calculatePerformanceMetrics()
    if (!metrics) return null

    const data = [
      { label: "Ataque", value: metrics.attack, color: "#ef4444" },
      { label: "Defesa", value: metrics.defense, color: "#3b82f6" },
      { label: "Passe", value: metrics.passing, color: "#10b981" },
      { label: "Aproveitamento", value: metrics.efficiency, color: "#f59e0b" },
      { label: "Momentum", value: metrics.momentum, color: "#8b5cf6" },
    ]

    const centerX = 225
    const centerY = 225
    const radius = 150
    const angleStep = (2 * Math.PI) / data.length

    const points = data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2
      const x = centerX + ((radius * item.value) / 100) * Math.cos(angle)
      const y = centerY + ((radius * item.value) / 100) * Math.sin(angle)
      return { x, y, ...item }
    })

    const pathData = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ") + " Z"

    return (
      <div className="flex flex-col items-center mb-5">
        <svg width="450" height="450" className="mb-4">
          {[20, 40, 60, 80, 100].map((percent) => (
            <circle
              key={percent}
              cx={centerX}
              cy={centerY}
              r={(radius * percent) / 100}
              fill="none"
              stroke="#374151"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {data.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2
            const x = centerX + radius * Math.cos(angle)
            const y = centerY + radius * Math.sin(angle)
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#374151"
                strokeWidth="1"
                opacity="0.3"
              />
            )
          })}

          <path d={pathData} fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2" />

          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill={point.color}
                stroke="#fff"
                strokeWidth="2"
                className="cursor-pointer hover:r-8 transition-all duration-200"
                onMouseEnter={(e) => {
                  const tooltip = e.currentTarget.parentNode?.querySelector(".tooltip")
                  if (tooltip) (tooltip as HTMLElement).style.display = "block"
                }}
                onMouseLeave={(e) => {
                  const tooltip = e.currentTarget.parentNode?.querySelector(".tooltip")
                  if (tooltip) (tooltip as HTMLElement).style.display = "none"
                }}
              />
              <text
                className="tooltip fill-white text-xs font-medium pointer-events-none"
                x={point.x}
                y={point.y - 15}
                textAnchor="middle"
                style={{ display: "none" }}
              >
                {point.label}: {point.value}
              </text>
            </g>
          ))}

          {data.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2
            const labelRadius = radius + 45
            const x = centerX + labelRadius * Math.cos(angle)
            const y = centerY + labelRadius * Math.sin(angle)

            return (
              <text
                key={index}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-xs font-medium"
              >
                {item.label}
              </text>
            )
          })}
        </svg>

        <div className="flex flex-col gap-1 text-xs">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-gray-400 text-xs">{item.label}</span>
              <span className="text-white font-bold text-xs ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const GoallogAnalysis = () => {
    if (!teamGoallog) return null

    return (
      <div className="rounded-lg col-span-1 md:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#111] p-4 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-2">Distância dos Gols</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Distância média</span>
                <span className="text-white font-bold">
                  {teamGoallog.distance_analysis.average_distance_m.toFixed(1)} metros
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Gols fora da área</span>
                <span className="text-white font-bold">
                  {teamGoallog.distance_analysis.goals_outside_box}
                  <span className="text-gray-400 text-xs ml-1">
                    (
                    {(
                      (teamGoallog.distance_analysis.goals_outside_box /
                        teamGoallog.distance_analysis.total_goals_with_distance_data) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#111] p-4 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-3">Gols por Parte do Corpo</h3>
            <div className="space-y-2">
              {teamGoallog.goal_types.by_body_part.slice(0, 3).map((bodyPart: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">{bodyPart.body_part || "Outros"}</span>
                  <span className="text-white font-bold">
                    {bodyPart.goals}
                    <span className="text-gray-400 text-xs ml-1">({bodyPart.percentage.toFixed(1)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111] p-4 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-3">Gols por tipo</h3>
            <div className="space-y-2">
              {teamGoallog.goal_types.by_type.slice(0, 3).map((type: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">{type.type || "Outros"}</span>
                  <span className="text-white font-bold">
                    {type.goals}
                    <span className="text-gray-400 text-xs ml-1">({type.percentage.toFixed(1)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111] p-4 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-3">Gols por Tempo</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Melhor intervalo</span>
                <span className="text-white font-bold">
                  {teamGoallog.minute_analysis.top_interval.interval}min
                  <span className="text-gray-400 text-xs ml-1">
                    ({teamGoallog.minute_analysis.top_interval.goals} gols)
                  </span>
                </span>
              </div>
              {teamGoallog.minute_analysis.goals_by_half.map((half: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm ">{half.half}</span>
                  <span className="text-white font-bold">
                    {half.goals}
                    <span className="text-gray-400 text-xs ml-1">
                      ({((half.goals / teamGoallog.total_goals) * 100).toFixed(1)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col justify-center h-full space-y-3 gap-4 ">
            <div className="bg-[#111] p-6 rounded-lg flex-1 flex flex-col justify-center">
              <h3 className="text-white text-lg font-semibold mb-6">Gols do Banco e Titulares</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-base">Gols do Banco:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">
                      {teamGoallog.starting_position?.goals_from_bench || 0}
                    </span>
                    <span className="text-gray-400 text-xs font-semibold">
                      ({((teamGoallog.starting_position.goals_from_bench / teamGoallog.total_goals) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-base">Gols de Titular:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">
                      {teamGoallog.starting_position?.goals_from_starting_eleven || 0}
                    </span>
                    <span className="text-gray-400 text-xs font-semibold">
                      (
                      {(
                        (teamGoallog.starting_position.goals_from_starting_eleven / teamGoallog.total_goals) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111] p-6 rounded-lg flex-1 flex flex-col justify-center">
              <h3 className="text-white text-lg font-semibold mb-4">Principais Vítimas</h3>
              <div className="space-y-1">
                {teamGoallog.top_opponents?.slice(0, 3).map((victim: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-400 text-base">{victim.opponent}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">{victim.goals || 0}</span>
                      <span className="text-gray-400 text-xs font-semibold">gols</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#111] p-2 rounded-lg md:col-span-2">
            <h3 className="text-white text-lg font-semibold mt-7 text-left ml-[100px]">
              Distribuição de Gols por Intervalo
            </h3>
            <div className="flex items-end justify-center gap-5 h-80">
              {teamGoallog.minute_analysis.all_intervals
                .sort((a: any, b: any) => {
                  const aStart = Number.parseInt(a.interval.split("-")[0])
                  const bStart = Number.parseInt(b.interval.split("-")[0])
                  return aStart - bStart
                })
                .map((interval: any, index: number) => {
                  const maxGoals = Math.max(...teamGoallog.minute_analysis.all_intervals.map((i: any) => i.goals))
                  const height = Math.max((interval.goals / maxGoals) * 100, 8)
                  return (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div className="relative flex flex-col items-center justify-start h-60">
                        <div
                          className="bg-green-600 rounded-b-md transition-all duration-300 hover:bg-green-800 cursor-pointer min-w-[60px] relative flex items-end justify-center pb-1"
                          style={{ height: `${height}%` }}
                          onMouseEnter={() => setHoveredBar(index)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          <span className="text-white text-[13px] font-bold">{interval.goals}</span>
                        </div>
                      </div>
                      <div className="text-[13px] text-gray-400 font-medium text-center mt-2">
                        {interval.interval}min
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#111] p-4 rounded-lg">
            <h3 className="text-white text-sm font-semibold mb-4">Gols por Situação</h3>
            <div className="space-y-3">
              {teamGoallog.score_analysis.by_situation.map((situation: any, index: number) => {
                const maxGoals = Math.max(...teamGoallog.score_analysis.by_situation.map((s: any) => s.goals))
                const percentage = (situation.goals / maxGoals) * 100
                const barColor = colors[index % colors.length]
                const situationLabel =
                  situation.situation === "winning"
                    ? "Vencendo"
                    : situation.situation === "tied"
                      ? "Empatando"
                      : "Perdendo"

                return (
                  <div key={index}>
                    <div className="w-full bg-green-950 rounded h-10 relative">
                      <div
                        className={`${barColor} h-10 rounded transition-all duration-300 top-0 left-0`}
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute top-0 left-0 h-10 flex items-center p-3">
                          <span className="text-white text-[13px] font-medium drop-shadow-lg">
                            {situationLabel} - {situation.goals} (
                            {((situation.goals / teamGoallog.total_goals) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#111] p-4 rounded-lg">
            <h3 className="text-white text-sm font-semibold mb-4">Gols Quando Vencendo</h3>
            <div className="space-y-3">
              {teamGoallog.score_analysis.most_common_when_winning.slice(0, 3).map((score: any, index: number) => {
                const totalWinningGoals = Math.max(
                  ...teamGoallog.score_analysis.most_common_when_winning.slice(0, 3).map((s: any) => s.goals),
                )
                const percentage = (score.goals / totalWinningGoals) * 100
                const barColor = colors[index % colors.length]

                return (
                  <div key={index}>
                    <div className="w-full bg-green-950 rounded h-10 relative">
                      <div
                        className={`${barColor} h-10 rounded transition-all duration-300 flex items-center justify-start pl-3 top-0 left-0 relatve`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 0 && (
                          <span className="absolute text-white text-[13px] font-medium tracking-wider">
                            por {score.score} : {score.goals} (
                            {((score.goals / teamGoallog.total_goals) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#111] p-4 rounded-lg">
            <h3 className="text-white text-sm font-semibold mb-4">Gols Quando Perdendo</h3>
            <div className="space-y-3">
              {teamGoallog.score_analysis.most_common_when_losing.slice(0, 3).map((score: any, index: number) => {
                const totalLosingGoals = Math.max(
                  ...teamGoallog.score_analysis.most_common_when_losing.slice(0, 3).map((s: any) => s.goals),
                )
                const percentage = (score.goals / totalLosingGoals) * 100
                const barColor = colors[index % colors.length]

                return (
                  <div key={index}>
                    <div className="w-full bg-green-950 rounded h-10 relative">
                      <div
                        className={`${barColor} h-10 rounded transition-all duration-300 flex items-center justify-start pl-3 top-0 left-0 relatve`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 0 && (
                          <span className="absolute text-white text-[13px] font-medium tracking-wider">
                            por {score.score} : {score.goals} (
                            {((score.goals / teamGoallog.total_goals) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#111] p-4 rounded-lg">
            <h3 className="text-white text-sm font-semibold mb-4">Gols Quando Empatando</h3>
            <div className="space-y-3">
              {teamGoallog.score_analysis.most_common_when_tied.slice(0, 3).map((score: any, index: number) => {
                const totalTiedGoals = Math.max(
                  ...teamGoallog.score_analysis.most_common_when_tied.slice(0, 3).map((s: any) => s.goals),
                )
                const percentage = (score.goals / totalTiedGoals) * 100
                const barColor = colors[index % colors.length]

                return (
                  <div key={index}>
                    <div className="w-full bg-green-950 rounded h-10 relative">
                      <div
                        className={`${barColor} h-10 rounded transition-all duration-300 flex items-center justify-start pl-3 top-0 left-0 relatve`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 0 && (
                          <span className="absolute text-white text-[13px] font-medium tracking-wider">
                            por {score.score} : {score.goals} (
                            {((score.goals / teamGoallog.total_goals) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true)
        const decodedTeamName = teamId
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        let leagueStandings = {}
        let recentMatches = {}
        let playerstatsTable: any = []
        let teamComps = {}

        try {
          const apiCompId = selectedComp
          // Construct season query parameter for the API calls (single season)
          const seasonQueryString = `season=${selectedSeason}`

          console.log("=== DEBUG API CALLS ===")
          console.log("selectedComp:", selectedComp)
          console.log("selectedSeason (single):", selectedSeason)
          console.log("seasonQueryString:", seasonQueryString)
          console.log("apiCompId:", apiCompId)
          console.log("teamId:", teamId)
          console.log("apiBaseUrl:", apiBaseUrl)

          const playerstatsUrl = `${apiBaseUrl}/team_data/standard_table/${teamId}/${apiCompId}?${seasonQueryString}`
          const teamCompsUrl = `${apiBaseUrl}/team_data/comps/${teamId}`
          const teamGoallogUrl = `${apiBaseUrl}/team_data/goallog/${teamId}/${apiCompId}?${seasonQueryString}`
          const statsTempUrl = `${apiBaseUrl}/team_data/team_stats_temp/${teamId}/${apiCompId}?${seasonQueryString}`
          const tableUrl = `${apiBaseUrl}/team_data/table/${apiCompId}?${seasonQueryString}`
          const recentMatchesUrl = `${apiBaseUrl}/team_data/recent_matches/${teamId}/${apiCompId}?${seasonQueryString}`

          console.log("URLs construídas:")
          console.log("playerstats:", playerstatsUrl)
          console.log("teamComps:", teamCompsUrl)
          console.log("statsTemp:", statsTempUrl)
          console.log("table:", tableUrl)
          console.log("recentMatches:", recentMatchesUrl)
          console.log("teamGoallogUrl:", teamGoallogUrl)

          let playerstatsResponse,
            teamCompsResponse,
            statsTempResponse,
            tableResponse,
            recentmResponse,
            teamgoallogResponse

          try {
            console.log("Fazendo chamada para playerstats...")
            
            playerstatsResponse = await fetch(playerstatsUrl, {
              headers: {
              'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
            }})
            console.log("playerstats response:", playerstatsResponse.status, playerstatsResponse.statusText)
          } catch (error) {
            console.error("Erro na chamada playerstats:", error)
            playerstatsResponse = { ok: false, status: 0 } as Response
          }

          try {
            console.log("Fazendo chamada para teamgoallog...")
            teamgoallogResponse = await fetch(teamGoallogUrl, {
              headers: {
              'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
            }})
            console.log("teamgoallog response:", teamgoallogResponse.status, teamgoallogResponse.statusText)
          } catch (error) {
            console.error("Erro na chamada teamgoallog:", error)
            teamgoallogResponse = { ok: false, status: 0 } as Response
          }

          try {
            console.log("Fazendo chamada para teamComps...")
            teamCompsResponse = await fetch(teamCompsUrl, {
              headers: {
              'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
            }})
            console.log("teamComps response:", teamCompsResponse.status, teamCompsResponse.statusText)
          } catch (error) {
            console.error("Erro na chamada teamComps:", error)
            teamCompsResponse = { ok: false, status: 0 } as Response
          }

          try {
            console.log("Fazendo chamada para statsTemp...")
            statsTempResponse = await fetch(statsTempUrl, {
              headers: {
              'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
            }})
            console.log("statsTemp response:", statsTempResponse.status, statsTempResponse.statusText)
          } catch (error) {
            console.error("Erro na chamada statsTemp:", error)
            statsTempResponse = { ok: false, status: 0 } as Response
          }

          try {
            console.log("Fazendo chamada para table...")
            tableResponse = await fetch(tableUrl, {
              headers: {
              'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
            }})
            console.log("table response:", tableResponse.status, tableResponse.statusText)
          } catch (error) {
            console.error("Erro na chamada table:", error)
            tableResponse = { ok: false, status: 0 } as Response
          }

          try {
            console.log("Fazendo chamada para recentMatches...")
            recentmResponse = await fetch(recentMatchesUrl, {
              headers: {
              'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
            }})
            console.log("recentMatches response:", recentmResponse.status, recentmResponse.statusText)
          } catch (error) {
            console.error("Erro na chamada recentMatches:", error)
            recentmResponse = { ok: false, status: 0 } as Response
          }

          console.log("=== FIM DEBUG API CALLS ===")

          if (statsTempResponse.ok) {
            try {
              const statsTempData = await statsTempResponse.json()
              setTeamStatsTemp(statsTempData)
            } catch (error) {
              console.error("Error parsing team stats temp JSON:", error)
              setTeamStatsTemp(null)
            }
          }

          if (teamgoallogResponse.ok) {
            try {
              const teamGoallogData = await teamgoallogResponse.json()
              setTeamGoallog(teamGoallogData)
            } catch (error) {
              console.error("Error parsing team goallog temp JSON:", error)
              setTeamGoallog(null)
            }
          }

          if (tableResponse.ok) {
            try {
              const tableData = await tableResponse.json()
              leagueStandings = tableData
              console.log("Table data (league standings):", tableData)
            } catch (error) {
              console.error("Error parsing table JSON:", error)
              leagueStandings = {}
            }
          }

          if (recentmResponse.ok) {
            try {
              const responseText = await recentmResponse.text()
              const cleanedResponse = responseText.replace(/:\s*NaN/g, ": null")
              recentMatches = JSON.parse(cleanedResponse)
              console.log("Recent matches parsed:", recentMatches)
            } catch (error) {
              console.error("Error parsing recent matches JSON:", error)
              recentMatches = []
            }
          } else {
            console.warn("Recent matches request failed:", recentmResponse.status)
            recentMatches = []
          }

          if (teamCompsResponse.ok) {
            try {
              teamComps = await teamCompsResponse.json()
            } catch (error) {
              console.error("Error parsing team comps JSON:", error)
              teamComps = {}
            }
          }

          const compsArray = teamComps[decodedTeamName] || teamComps[teamId] || []
          const teamCompsListData = Array.isArray(compsArray)
            ? compsArray.map((comp) => ({
                value: comp,
                label: comp.charAt(0).toUpperCase() + comp.slice(1),
              }))
            : []

          setTeamCompsList(teamCompsListData)

          if (playerstatsResponse.ok) {
            try {
              const playerstatsData = await playerstatsResponse.json()
              console.log("Player stats data:", playerstatsData)

              if (playerstatsData && typeof playerstatsData === "object") {
                playerstatsTable = Object.entries(playerstatsData).map(([playerName, stats]: [string, any]) => {
                  const gols = Number(stats.gls || "0")
                  const jogos = Number(stats.mp || "0")
                  const ast = Number(stats.ast || "0")
                  const crdr = Number(stats.crdr || "0")
                  const crdy = Number(stats.crdy || "0")

                  return {
                    player: playerName.replace(/-/g, " "),
                    gls: stats.gls || "0",
                    ast: stats.ast || "0",
                    crdr: stats.crdr || "0",
                    crdy: stats.crdy || "0",
                    mp: stats.mp || "0",
                    gj: jogos > 0 ? (gols / jogos).toFixed(2) : "0.00",
                    astj: jogos > 0 ? (ast / jogos).toFixed(2) : "0.00",
                    crdrj: jogos > 0 ? (crdr / jogos).toFixed(2) : "0.00",
                    crdyj: jogos > 0 ? (crdy / jogos).toFixed(2) : "0.00",
                  }
                })
              }
            } catch (error) {
              console.error("Error parsing player stats JSON:", error)
              playerstatsTable = []
            }
          } else {
            console.log("Player stats request failed:", playerstatsResponse.status)
            playerstatsTable = []
          }
        } catch (error) {
          console.error("API Error:", error)
          setDebugInfo((prev) => [
            ...prev,
            `Erro na requisição da API: ${error instanceof Error ? error.message : String(error)}`,
          ])
        }

        const mappedrecentMatches =
          Array.isArray(recentMatches) && recentMatches.length > 0
            ? recentMatches.map((match: any) => ({
                date: match.date || "Data não disponível",
                time: match.time || "",
                home: decodedTeamName,
                away: match.opponent || "Oponente não disponível",
                gf: isNaN(match.gf) ? 0 : match.gf || 0,
                ga: isNaN(match.ga) ? 0 : match.ga || 0,
                score: `${isNaN(match.gf) ? 0 : match.gf || 0}-${isNaN(match.ga) ? 0 : match.ga || 0}`,
                result: match.result || "N/A",
                venue: match.venue || "Local não disponível",
              }))
            : []

        console.log("Mapped recent matches:", mappedrecentMatches)

        if (mappedrecentMatches.length === 0) {
          console.warn("No recent matches found for:", decodedTeamName, "in competition:", selectedComp)
        }

        if (playerstatsTable.length === 0) {
          console.warn("No player stats found for:", decodedTeamName, "in competition:", selectedComp)
        }

        setTeamData({
          name: decodedTeamName,
          competition: compId.split("-").join(" "),
          leagueStandings: leagueStandings,
          recentMatches: mappedrecentMatches,
          playerstatsTable: playerstatsTable,
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching team data:", error)
        setDebugInfo((prev) => [...prev, `Erro geral: ${error instanceof Error ? error.message : String(error)}`])
        setLoading(false)
      }
    }

    // Only fetch team data if selectedSeason is not empty
    if (selectedSeason) {
      fetchTeamData()
    } else {
      setLoading(false)
      setTeamData(null)
    }
  }, [teamId, selectedComp, selectedSeason, apiBaseUrl])

  console.log("teamGoallog", teamGoallog)

  const getTeamLogo = (teamName: string) => {
    if (!teamName) return null

    const teamData = teams_logos.find(
      (t) => t.name && teamName && t.name.toLowerCase().trim() === teamName.toLowerCase().trim(),
    )

    return teamData ? teamData.logo : null
  }

  const findTeamPosition = () => {
    if (!teamData || !teamData.leagueStandings) return null

    const normalize = (str: string) => str.toLowerCase().replace(/[\s-]+/g, "")
    const standingsArray = Object.entries(teamData.leagueStandings)
    const position = standingsArray.findIndex(([_, team]) => normalize(team.Squad) === normalize(teamData.name))

    return position !== -1 ? position + 1 : null
  }

  const getTeamStandingData = () => {
    if (!teamData || !teamData.leagueStandings) return null

    const normalize = (str: string) => str.toLowerCase().replace(/[\s-]+/g, "")

    return Object.values(teamData.leagueStandings).find((team) => normalize(team.Squad) === normalize(teamData.name))
  }

  const getFilteredStandings = () => {
    if (!teamData || !teamData.leagueStandings) return []

    const standingsArray = Object.entries(teamData.leagueStandings)
    const normalize = (str: string) => str.toLowerCase().replace(/[\s-]+/g, "-")
    const teamPosition = standingsArray.findIndex(([_, team]) => normalize(team.Squad) === normalize(teamData.name))

    if (teamPosition === -1) return standingsArray

    const total = standingsArray.length
    let startIndex = Math.max(0, teamPosition - 4)
    const endIndex = Math.min(total, startIndex + 10)

    if (endIndex - startIndex < 10) {
      startIndex = Math.max(0, endIndex - 10)
    }

    return standingsArray.slice(startIndex, endIndex)
  }

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return { key, direction: prevConfig.direction === "asc" ? "desc" : "asc" }
      }
      return { key, direction: "desc" }
    })
  }

  const compOptions = teamCompsList.map((comp) => ({
    value: comp.value,
    label: (
      <div className="flex items-center gap-2 text-white text-[12px]">
        <img src={`/comps-logos/${comp.value}.png`} alt={comp.value} className="h-6 w-6 object-contain" />
        <span>{comp.label.replace(/-/g, " ")}</span>
      </div>
    ),
  }))

  // Generate season options from the fetched availableSeasons
  const seasonOptions = availableSeasons.map((season) => ({
    value: season,
    label: season,
  }))

  const getSortedPlayers = (players: any[], sortKey: string, sortDirection: string) => {
    if (!players || players.length === 0) return []

    return [...players].sort((a, b) => {
      const aValue = Number.parseFloat(a[sortKey]) || 0
      const bValue = Number.parseFloat(b[sortKey]) || 0

      if (sortDirection === "asc") {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
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
        <div className="text-white text-xl">
          Time não encontrado ou dados indisponíveis para a temporada selecionada.
        </div>
      </div>
    )
  }

  const teamPosition = findTeamPosition()
  const teamStandingData = getTeamStandingData()

  console.log("teamdataname", teamData.name)

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="bg-black py-6 px-4 border-b border-gray-800">
        <div className="container mx-auto flex items-center gap-4">
          <div className="relative h-16 w-16 ml-3">
            <img
              src={getTeamLogo(teamId) || "/placeholder.svg?height=64&width=64"}
              alt={teamData.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">{teamData.name}</h1>
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
                  options={compOptions}
                  value={compOptions.find((opt) => opt.value === selectedComp)}
                  onChange={(opt) => setSelectedComp((opt as { value: string }).value)}
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
              {/* Single-season Select */}
              <div>
                <Select
                  options={seasonOptions}
                  value={seasonOptions.find((option) => option.value === selectedSeason)} // Find single selected value
                  onChange={(selectedOption) => {
                    const newSeason = selectedOption ? selectedOption.value : ""; // Get single value
                    setSelectedSeason(newSeason);

                    // Update URL with single season query parameter
                    const newSearchParams = new URLSearchParams();
                    if (newSeason) {
                      newSearchParams.set("season", newSeason);
                    }
                    router.push(`${pathname}?${newSearchParams.toString()}`);
                  }}
                  isMulti={false} // Set to false for single selection
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
                      padding: "0 6px",
                      display: "flex",
                      alignItems: "center",
                      width: "auto",
                      minHeight: "30px",
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
                      fontSize: '12px',
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
                      height: "30px",
                      width: "auto",
                      fontSize: '12px',

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
            </div>
          </div>
        </div>

      <main className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] rounded-lg p-6 col-span-1">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Classificações
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="text-gray-400 text-sm font-thin ">
                  <th className="py-2 text-left"></th>
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
                        team.Squad === teamData.name.replace(/\s+/g, "-") ? "bg-green-600/10 " : ""
                      }`}
                    >
                      <td className="py-2 text-center">{position}</td>
                      <td className="py-2 text-left">
                        <Link href={`/team/${team.Squad.replace(/\s+/g, "-")}/${selectedComp}`} className="text-white ">
                          {team.Squad.replace(/-/g, " ")}
                        </Link>
                      </td>
                      <td className="py-2 text-center">{team.MP}</td>
                      <td className="py-2 text-center">{team.W}</td>
                      <td className="py-2 text-center">{team.D}</td>
                      <td className="py-2 text-center">{team.L}</td>
                      <td className="py-2 text-center font-bold">{team.Pts}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg p-6 col-span-1">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Partidas Recentes
            </h2>
          </div>
          <div className="space-y-4">
            {teamData.recentMatches && teamData.recentMatches.length > 0 ? (
              teamData.recentMatches.slice(0, 5).map((match, index) => (
                <div key={index} className="bg-[#1a1a1a] p-3 rounded">
                  <div className="text-gray-400 text-sm mb-2">
                    {match.date} {match.time} {match.venue}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={getTeamLogo(teamId) || "/placeholder.svg?height=24&width=24"}
                        alt={match.home}
                        className="h-6 w-6 object-contain"
                      />
                      <span className="text-white">{match.home}</span>
                      {match.gf > match.ga ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold">
                          W
                        </span>
                      ) : match.gf < match.ga ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold">
                          L
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-500 text-white text-xs font-bold">
                          D
                        </span>
                      )}
                    </div>
                    <div className="text-white font-bold">{match.score}</div>
                    <div className="flex items-center gap-2">
                      <Link href={`/team/${match.away}/${selectedComp}`} className="text-white ">
                        {formatTeamName(match.away)}
                      </Link>
                      <img
                        src={getTeamLogo(match.away) || "/placeholder.svg?height=24&width=24"}
                        alt={match.away}
                        className="h-6 w-6 object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#1a1a1a] p-3 rounded text-center">
                <div className="text-gray-400 text-sm">Nenhuma partida recente encontrada para esta competição</div>
              </div>
            )}
          </div>
          <button
            className="w-full mt-4 bg-green-600 text-white py-2 rounded text-sm"
            onClick={() => setShowAllMatches(true)}
          >
            Ver todas as partidas
          </button>
        </div>

        {showAllMatches && (
          <div className="fixed inset-0 z-0 flex items-center justify-center " onClick={() => setShowAllMatches(false)}>
            <div
              className="bg-[#181818] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto only-thumb "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-xl font-bold">Todas as partidas</h3>
                <button
                  className="text-gray-400 hover:text-white text-2xl"
                  onClick={() => setShowAllMatches(false)}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                {teamData.recentMatches.map((match, index) => (
                  <div key={index} className="bg-[#222] p-3 rounded">
                    <div className="text-gray-400 text-sm mb-2">
                      {match.date} {match.time} {match.venue}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={getTeamLogo(teamId) || "/placeholder.svg?height=24&width=24"}
                          alt={match.home}
                          className="h-6 w-6 object-contain"
                        />
                        <span className="text-white">{match.home}</span>
                        {match.gf > match.ga ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold">
                            W
                          </span>
                        ) : match.gf < match.ga ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold">
                            L
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-500 text-white text-xs font-bold">
                            D
                          </span>
                        )}
                      </div>
                      <div className="text-white font-bold">{match.score}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{formatTeamName(match.away)}</span>
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
            </div>
          </div>
        )}

        <div className="bg-[#111] rounded-lg p-4 col-span-1">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Estatística jogadores
            </h2>
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
                    <th className="py-2 text-center" title="Jogos">
                      J
                    </th>
                    <th
                      className="py-2 text-center cursor-pointer hover:text-white"
                      title="Gols"
                      onClick={() => handleSort("gls")}
                    >
                      G {sortConfig.key === "gls" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="py-2 text-center cursor-pointer hover:text-white"
                      title="Gols por jogo"
                      onClick={() => handleSort("gj")}
                    >
                      G/J {sortConfig.key === "gj" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.playerstatsTable && teamData.playerstatsTable.length > 0 ? (
                    getSortedPlayers(teamData.playerstatsTable, sortConfig.key, sortConfig.direction)
                      .slice(0, 10)
                      .map((player, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2 text-left ">
                            <Link
                              href={`/player/${player.player.replace(/ /g, "-")}`}
                              className="text-white hover:text-green-800 transition-colors"
                            >
                              {player.player}
                            </Link>
                          </td>
                          <td className="py-2 text-center">{player.mp}</td>
                          <td className="py-2 text-center">{player.gls}</td>
                          <td className="py-2 text-center">{player.gj}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400 text-sm">
                        Nenhuma estatística de jogador encontrada para esta competição
                      </td>
                    </tr>
                  )}
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
                    <th className="py-2 text-center" title="Jogos">
                      J
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
                      title="Assistências por jogo"
                      onClick={() => handleSort("astj")}
                    >
                      A/J {sortConfig.key === "astj" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.playerstatsTable && teamData.playerstatsTable.length > 0 ? (
                    getSortedPlayers(teamData.playerstatsTable, sortConfig.key, sortConfig.direction)
                      .slice(0, 10)
                      .map((player, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2 text-left">
                            <Link
                              href={`/player/${player.player.replace(/ /g, "-")}`}
                              className="text-white hover:text-green-800 transition-colors"
                            >
                              {player.player}
                            </Link>
                          </td>
                          <td className="py-2 text-center">{player.mp}</td>
                          <td className="py-2 text-center">{player.ast}</td>
                          <td className="py-2 text-center">{player.astj}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400 text-sm">
                        Nenhuma estatística de jogador encontrada para esta competição
                      </td>
                    </tr>
                  )}
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
                    <th className="py-2 text-center" title="Jogos">
                      J
                    </th>
                    <th
                      className="py-2 text-center cursor-pointer hover:text-white"
                      title="Cartões Amarelos"
                      onClick={() => handleSort("crdy")}
                    >
                      CA {sortConfig.key === "crdy" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="py-2 text-center cursor-pointer hover:text-white"
                      title="Cartões Amarelos por jogo"
                      onClick={() => handleSort("crdyj")}
                    >
                      CA/J {sortConfig.key === "crdyj" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="py-2 text-center cursor-pointer hover:text-white"
                      title="Cartões Vermelhos"
                      onClick={() => handleSort("crdr")}
                    >
                      CV {sortConfig.key === "crdr" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="py-2 text-center cursor-pointer hover:text-white"
                      title="Cartões Vermelhos por jogo"
                      onClick={() => handleSort("crdrj")}
                    >
                      CV/J {sortConfig.key === "crdrj" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedPlayers(teamData.playerstatsTable, sortConfig.key, sortConfig.direction)
                    .slice(0, 10)
                    .map((player, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-2 text-left">
                          <Link
                            href={`/player/${player.player.replace(/ /g, "-")}`}
                            className="text-white hover:text-green-800 transition-colors"
                          >
                            {player.player}
                          </Link>
                        </td>
                        <td className="py-2 text-center">{player.mp}</td>
                        <td className="py-2 text-center">{player.crdy}</td>
                        <td className="py-2 text-center">{player.crdyj}</td>
                        <td className="py-2 text-center">{player.crdr}</td>
                        <td className="py-2 text-center">{player.crdrj}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-[#111] rounded-lg p-4 col-span-1 md:col-span-3">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Estatísticas da Temporada - {teamData.name} {teamPosition && `(${teamPosition}º)`}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teamStandingData && (
              <>
                {teamStandingData.MP !== undefined && teamStandingData.MP !== null && teamStandingData.MP !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Jogos</div>
                    <div className="text-white text-2xl font-bold">{teamStandingData.MP}</div>
                  </div>
                )}

                {teamStandingData.Pts !== undefined && teamStandingData.Pts !== null && teamStandingData.Pts !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Pontos</div>
                    <div className="text-white text-2xl font-bold">{teamStandingData.Pts}</div>
                  </div>
                )}

                {teamStandingData["Pts/MP"] !== undefined &&
                  teamStandingData["Pts/MP"] !== null &&
                  teamStandingData["Pts/MP"] !== "" && (
                    <div className="bg-[#1a1a1a] p-3 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Pontos por Jogo</div>
                      <div className="text-white text-2xl font-bold">{teamStandingData["Pts/MP"]}</div>
                    </div>
                  )}

                {teamStandingData.W !== undefined && teamStandingData.W !== null && teamStandingData.W !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Vitórias</div>
                    <div className="text-white text-2xl font-bold">{teamStandingData.W}</div>
                  </div>
                )}

                {teamStandingData.D !== undefined && teamStandingData.D !== null && teamStandingData.D !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Empates</div>
                    <div className="text-white text-2xl font-bold">{teamStandingData.D}</div>
                  </div>
                )}

                {teamStandingData.L !== undefined && teamStandingData.L !== null && teamStandingData.L !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Derrotas</div>
                    <div className="text-white text-2xl font-bold">{teamStandingData.L}</div>
                  </div>
                )}

                {teamStandingData.Attendance !== undefined &&
                  teamStandingData.Attendance !== null &&
                  teamStandingData.Attendance !== "" &&
                  Number(teamStandingData.Attendance) > 0 && (
                    <div className="bg-[#1a1a1a] p-3 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Público Médio</div>
                      <div className="text-white text-2xl font-bold">
                        {Number(teamStandingData.Attendance).toLocaleString()}
                      </div>
                    </div>
                  )}

                {teamStandingData.GD !== undefined && teamStandingData.GD !== null && teamStandingData.GD !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Saldo de Gols</div>
                    <div className="text-white text-2xl font-bold">{teamStandingData.GD}</div>
                  </div>
                )}

                {teamStandingData["Top Team Scorer"] !== undefined &&
                  teamStandingData["Top Team Scorer"] !== null &&
                  teamStandingData["Top Team Scorer"] !== "" && (
                    <div className="bg-[#1a1a1a] p-3 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Artilheiro</div>
                      <div className="text-white text-xl font-bold">{teamStandingData["Top Team Scorer"]}</div>
                    </div>
                  )}
              </>
            )}
            {teamStatsTemp && (
              <>
                {teamStatsTemp.sh_sum !== undefined && teamStatsTemp.sh_sum !== null && teamStatsTemp.sh_sum !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Chutes</div>
                    <div className="text-white text-2xl font-bold">{Number(teamStatsTemp.sh_sum)}</div>
                  </div>
                )}

                {teamStatsTemp.sot_sum !== undefined &&
                  teamStatsTemp.sot_sum !== null &&
                  teamStatsTemp.sot_sum !== "" && (
                    <div className="bg-[#1a1a1a] p-3 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Chutes no Gol</div>
                      <div className="text-white text-2xl font-bold">{Number(teamStatsTemp.sot_sum)}</div>
                    </div>
                  )}

                {teamStatsTemp.xg_sum !== undefined && teamStatsTemp.xg_sum !== null && teamStatsTemp.xg_sum !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Gols esperados</div>
                    <div className="text-white text-2xl font-bold">{Number(teamStatsTemp.xg_sum).toFixed(0)}</div>
                  </div>
                )}

                {teamStatsTemp.gf_sum !== undefined && teamStatsTemp.gf_sum !== null && teamStatsTemp.gf_sum !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Gols marcados</div>
                    <div className="text-white text-2xl font-bold">{Number(teamStatsTemp.gf_sum)}</div>
                  </div>
                )}

                {teamStatsTemp.ga_sum !== undefined && teamStatsTemp.ga_sum !== null && teamStatsTemp.ga_sum !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Gols sofridos</div>
                    <div className="text-white text-2xl font-bold">{Number(teamStatsTemp.ga_sum)}</div>
                  </div>
                )}

                {teamStatsTemp.ast_sum !== undefined &&
                  teamStatsTemp.ast_sum !== null &&
                  teamStatsTemp.ast_sum !== "" && (
                    <div className="bg-[#1a1a1a] p-3 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Assistências</div>
                      <div className="text-white text-2xl font-bold">{Number(teamStatsTemp.ast_sum)}</div>
                    </div>
                  )}

                {teamStatsTemp.ck_sum !== undefined && teamStatsTemp.ck_sum !== null && teamStatsTemp.ck_sum !== "" && (
                  <div className="bg-[#1a1a1a] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Escanteios</div>
                    <div className="text-white text-2xl font-bold">{Number(teamStatsTemp.ck_sum)}</div>
                  </div>
                )}

                {teamStatsTemp.crdy_sum !== undefined &&
                  teamStatsTemp.crdy_sum !== null &&
                  teamStatsTemp.crdy_sum !== "" && (
                    <div className="bg-[#1a1a1a] p-3 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Cartões amarelos</div>
                      <div className="text-white text-2xl font-bold">{Number(teamStatsTemp.crdy_sum)}</div>
                    </div>
                  )}

                {teamStatsTemp.crdr_sum !== undefined &&
                  teamStatsTemp.crdr_sum !== null &&
                  teamStatsTemp.crdr_sum !== "" && (
                    <div className="bg-[#1a1a1a] p-3 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Cartões vermelhos</div>
                      <div className="text-white text-2xl font-bold">{Number(teamStatsTemp.crdr_sum)}</div>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>

        <div className="bg-[#111] rounded-lg p-4 col-span-1 md:col-span-3">
          <div className="flex justify-between items-center mb-4 gap-1">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Médias por partida
            </h2>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {teamStatsTemp &&
              [
                { key: "sh", label: "Chutes" },
                { key: "sot", label: "Chutes no gol" },
                { key: "gf", label: "Gols feitos" },
                { key: "xg", label: "Gols esperados" },
                { key: "ga", label: "Gols sofridos" },
                { key: "ck", label: "Escanteios" },
                { key: "crdy", label: "Cartões amarelos" },
                { key: "off", label: "Impedimentos" },
                { key: "crs", label: "Cruzamentos" },
                { key: "ast", label: "Assistências" },
                { key: "xga", label: "Assistências esperadas" },
                { key: "fld", label: "Faltas sofridas" },
                { key: "fls", label: "Faltas cometidas" },
                { key: "int", label: "Interceptações" },
                { key: "shb", label: "Chutes bloqueados" },
                { key: "tklw", label: "Desarmes" },
              ].map((stat) => {
                const teamValue = Number(teamStatsTemp[`${stat.key}_mean`] || 0)
                const compValue = Number(teamStatsTemp[`${stat.key}_comp_mean`] || 0)
                const maxValue = Math.max(teamValue, compValue, 1)
                const scale = maxValue > 15 ? 150 / maxValue : 10
                const teamHeight = Math.max(teamValue * scale, 5)
                const compHeight = Math.max(compValue * scale, 5)
                const teamIsBigger = teamHeight >= compHeight

                return (
                  <div key={stat.key} className="flex-1 flex flex-col items-center justify-end">
                    <div className="relative w-full h-full flex flex-col justify-end">
                      {teamIsBigger ? (
                        <>
                          <div
                            className="bg-green-600 w-full absolute bottom-0 z-0 group rounded"
                            style={{ height: `${teamHeight}px` }}
                            title={`Time: ${teamValue.toFixed(1)}`}
                          >
                            <span className="hidden group-hover:flex absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-auto z-20">
                              Time: {teamValue.toFixed(1)}
                            </span>
                          </div>
                          <div
                            className="bg-green-800 w-full absolute bottom-0 z-1 group rounded"
                            style={{ height: `${compHeight}px` }}
                            title={`Competição: ${compValue.toFixed(1)}`}
                          >
                            <span className="hidden group-hover:flex absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-auto z-20">
                              Competição: {compValue.toFixed(1)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="bg-green-800 w-full absolute bottom-0 z-0 group rounded"
                            style={{ height: `${compHeight}px` }}
                            title={`Competição: ${compValue.toFixed(1)}`}
                          >
                            <span className="hidden group-hover:flex absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-auto z-20">
                              Competição: {compValue.toFixed(1)}
                            </span>
                          </div>
                          <div
                            className="bg-green-600 w-full absolute bottom-0 z-1 group rounded"
                            style={{ height: `${teamHeight}px` }}
                            title={`Time: ${teamValue.toFixed(1)}`}
                          >
                            <span className="hidden group-hover:flex absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-auto z-20">
                              Time: {teamValue.toFixed(1)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 h-8 flex items-center justify-center text-center">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-xs text-gray-400">{teamData.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-800 rounded"></div>
              <span className="text-xs text-gray-400">Média da competição</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg p-4 col-span-1 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis mb-2">
              Destaques da Temporada
            </h2>
          </div>
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="text-gray-400 text-sm mb-1">Melhores formações contra</div>
              <div className="text-white text-lg font-bold">
                {teamStatsTemp.best_oppformation.best_oppformation_1}
                <span className="ml-2 text-xs font-normal text-gray-300">
                  ({teamStatsTemp.best_oppformation["%oppf1"]}% de vitórias em{" "}
                  {teamStatsTemp.best_oppformation.total_games_1} jogos)
                </span>
                <br />
                {teamStatsTemp.best_oppformation.best_oppformation_2}
                <span className="ml-2 text-xs font-normal text-gray-300">
                  ({teamStatsTemp.best_oppformation["%oppf2"]}% de vitórias em{" "}
                  {teamStatsTemp.best_oppformation.total_games_2} jogos)
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">Formação adversária que o {teamId} mais venceu.</p>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Chute x gol</div>
                  <div className="text-white text-lg font-bold">{teamStatsTemp.shxgoals.toFixed(2)}</div>
                  <p className="text-gray-500 text-xs">
                    Um gol é marcado a cada {teamStatsTemp.shxgoals.toFixed(2)} chutes.
                  </p>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Chute no gol x gol</div>
                  <div className="text-white text-lg font-bold">{teamStatsTemp.sotxgoals.toFixed(2)}</div>
                  <p className="text-gray-500 text-xs">
                    Um gol é marcado a cada {teamStatsTemp.sotxgoals.toFixed(2)} chutes ao gol
                  </p>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Gols esperados x gols feitos</div>
                  <div className="text-white text-lg font-bold">{teamStatsTemp.xgxgoals.toFixed(2)}</div>
                  <p className="text-gray-500 text-xs">Mostra o aproveitamento das chances de chutes.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Média Win Streak</div>
                  <div className="text-white text-lg font-bold">{teamStatsTemp.avg_winstreak}</div>
                  <p className="text-gray-500 text-xs">Média da sequência de vitórias do time.</p>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Win Streak atual</div>
                  <div className="text-white text-lg font-bold text-left">{teamStatsTemp.current_winstreak}</div>
                  <p className="text-gray-500 text-xs">Sequência de vitórias do time.</p>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Win Streak max</div>
                  <div className="text-white text-lg font-bold text-left">{teamStatsTemp.max_winstreak}</div>
                  <p className="text-gray-500 text-xs">Sequência máxima de vitórias do time.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Média clean sheet</div>
                  <div className="text-white text-lg font-bold">{teamStatsTemp.average_clean_sheet_streak}</div>
                  <p className="text-gray-500 text-xs">Média da sequência de jogos sem tomar gols.</p>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Clean sheet atual</div>
                  <div className="text-white text-lg font-bold text-left">
                    {teamStatsTemp.current_clean_sheet_streak}
                  </div>
                  <p className="text-gray-500 text-xs">Sequência de jogos sem tomar.</p>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Clean sheet max</div>
                  <div className="text-white text-lg font-bold text-left">{teamStatsTemp.max_clean_sheet_streak}</div>
                  <p className="text-gray-500 text-xs">Sequência máxima de jogos sem tomar gol.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Média goal streak</div>
                  <div className="text-white text-lg font-bold">{teamStatsTemp.average_goal_streak}</div>
                  <p className="text-gray-500 text-xs">Média da sequência de jogos com 1 ou mais gol feito.</p>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Goal streak atual</div>
                  <div className="text-white text-lg font-bold text-left">{teamStatsTemp.current_goal_streak}</div>
                  <p className="text-gray-500 text-xs">Sequência de jogos com 1 ou mais gol feito.</p>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Goal streak max</div>
                  <div className="text-white text-lg font-bold text-left">{teamStatsTemp.max_goal_streak}</div>
                  <p className="text-gray-500 text-xs">Sequência máxima de jogos com 1 ou mais gol feito.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg p-6 col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-lg font-semibold">Desempenho do Time</h2>
          </div>
          <div className="flex flex-col items-center justify-center h-full">
            <PerformanceRadarChart />
          </div>
        </div>

        <GoallogAnalysis />
      </main>
    </div>
    </div>
  )
}
