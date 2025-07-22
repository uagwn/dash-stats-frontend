"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TeamStatsData {
  totals: {
    Total_Matches: number
    Total_Goals: number
    Total_Conceded: number
    Total_Shots: number
    Total_ShotsOnTarget: number
    Total_Corners: number
    Total_Fouls: number
    Total_YellowCards: number
    Total_RedCards: number
  }
  averages: {
    Avg_GF: number
    Avg_GA: number
    Avg_Sh: number
    Avg_SoT: number
    Avg_CK: number
    Avg_Fls: number
    Avg_CrdY: number
    Avg_CrdR: number
    Avg_Poss: number
  }
}

export default function TeamStats({ teamId }: { teamId: string }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TeamStatsData | null>(null)
  const [season, setSeason] = useState("2025")
  const [teamName, setTeamName] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
        // const response = await fetch(`${apiUrl}/api/team_stats/${encodeURIComponent(teamId)}/${season}`);
        // const data = await response.json();

        const decodedTeamName = decodeURIComponent(teamId)
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
        
        setTeamName(decodedTeamName)

        // Dados simulados para demonstração
        setData({
          totals: {
            Total_Matches: 38,
            Total_Goals: 80,
            Total_Conceded: 36,
            Total_Shots: 610,
            Total_ShotsOnTarget: 222,
            Total_Corners: 213,
            Total_Fouls: 339,
            Total_YellowCards: 58,
            Total_RedCards: 4,
          },
          averages: {
            Avg_GF: 2.11,
            Avg_GA: 0.95,
            Avg_Sh: 16.05,
            Avg_SoT: 5.84,
            Avg_CK: 5.61,
            Avg_Fls: 8.92,
            Avg_CrdY: 1.53,
            Avg_CrdR: 0.11,
            Avg_Poss: 64.5,
          },
        })

        setLoading(false)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId, season])

  if (loading) {
    return <div className="w-full h-[600px] bg-[#181818] animate-pulse rounded-lg"></div>
  }

  if (!data) {
    return <div className="text-center p-6">Dados não disponíveis</div>
  }

  const performanceData = [
    { name: "Gols", value: data.averages.Avg_GF },
    { name: "Gols Sofridos", value: data.averages.Avg_GA },
    { name: "Chutes", value: data.averages.Avg_Sh / 10 }, // Dividido por 10 para escala
    { name: "Chutes no Gol", value: data.averages.Avg_SoT },
    { name: "Escanteios", value: data.averages.Avg_CK },
    { name: "Faltas", value: data.averages.Avg_Fls / 5 }, // Dividido por 5 para escala
  ]

  return (
    <div className="space-y-6">
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="text-xl font-bold p-4 border-b border-gray-800">Estatísticas da Temporada</div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="Partidas" value={data.totals.Total_Matches} />
            <StatCard title="Gols Marcados" value={data.totals.Total_Goals} />
            <StatCard title="Gols Sofridos" value={data.totals.Total_Conceded} />
            <StatCard title="Chutes" value={data.totals.Total_Shots} />
            <StatCard title="Chutes no Gol" value={data.totals.Total_ShotsOnTarget} />
            <StatCard title="Escanteios" value={data.totals.Total_Corners} />
          </div>
        </div>
      </div>

      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="text-xl font-bold p-4 border-b border-gray-800">Médias por Partida</div>
        <div className="p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#222", border: "none" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="value" fill="#16a35f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="text-xl font-bold p-4 border-b border-gray-800">Disciplina</div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Cartões Amarelos" value={data.totals.Total_YellowCards} />
            <StatCard title="Cartões Vermelhos" value={data.totals.Total_RedCards} />
            <StatCard title="Faltas Cometidas" value={data.totals.Total_Fouls} />
            <StatCard title="Posse de Bola (média)" value={`${data.averages.Avg_Poss}%`} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-[#252525] p-3 rounded-lg">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}
