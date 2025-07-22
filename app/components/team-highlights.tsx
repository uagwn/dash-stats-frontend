"use client";

import { useEffect, useState } from "react";
import { players_images } from '../src/playersImages';

interface Partida {
  ck: number;
  comp: string;
  crdr: number;
  crdy: number;
  day: string;
  ga: number;
  gf: number;
  opponent: string;
  team: string;
  sot: number;
  venue: string;
}

interface PlayerStats {
  matches: number;
  per_match: number;
  value: number;
}

interface TeamStats {
  assists: { [player: string]: PlayerStats };
  goals: { [player: string]: PlayerStats };
  yellow_cards: { [player: string]: PlayerStats };
  shots_on_target: { [player: string]: PlayerStats };
  shots: { [player: string]: PlayerStats };
}

interface ApiResponse {
  last_games: {
    last_5_games: {
      [team: string]: Partida[];
    };
    last_5_gamesvs: {
      [team: string]: Partida[];
    };
  };
  player_stats: {
    [team: string]: TeamStats;
  };
}
const getPlayerImage = (playerName: string) => {
  const player = players_images.find(p => p.name === playerName);
  return player?.image || '/placeholder-player.png';  // fallback to placeholder if not found
};

export default function TeamHighlights({
  team1Id,
  team2Id,
  compId,
}: {
  team1Id: string;
  team2Id: string;
  compId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeamHighlightsData | null>(null);

  const normalizeTeamName = (name: string) => {
    return decodeURIComponent(name)
      .replace(/ /g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };
  
  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const team1Name = normalizeTeamName(team1Id);
        const team2Name = normalizeTeamName(team2Id);
        const comp = normalizeTeamName(compId);
        const apiUrl = "http://127.0.0.1:5000";
        const response = await fetch(
          encodeURI(`${apiUrl}/highlights/${team1Name}/${team2Name}/${comp}`),
          { signal: abortController.signal }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData: ApiResponse = await response.json();
        console.log("API Data:", apiData);

        if (!apiData || !apiData.last_games || !apiData.player_stats) {
          throw new Error("Dados da API estão incompletos ou no formato incorreto.");
        }

        const processTeamStats = (teamStats: TeamStats) => {
          const playersMap = new Map<string, any>();
          Object.entries(teamStats).forEach(([statType, stats]) => {
            Object.entries(stats).forEach(([playerName, stat]) => {
              if (!playersMap.has(playerName)) {
                playersMap.set(playerName, {
                  nome: playerName,
                  gols: 0,
                  assistencias: 0,
                  chutes: 0,
                  chutes_no_alvo: 0,
                  cartoes_amarelos: 0,
                });
              }
              const player = playersMap.get(playerName);
              switch (statType) {
                case "goals":
                  player.gols = stat.value;
                  break;
                case "assists":
                  player.assistencias = stat.value;
                  break;
                case "shots":
                  player.chutes = stat.per_match;
                  break;
                case "shots_on_target":
                  player.chutes_no_alvo = stat.per_match;
                  break;
                case "yellow_cards":
                  player.cartoes_amarelos = stat.per_match;
                  break;
              }
            });
          });

          return Array.from(playersMap.values());
        };

        const jogadoresTime1 = processTeamStats(apiData.player_stats.team1_stats);
        const jogadoresTime2 = processTeamStats(apiData.player_stats.team2_stats);

        setData({
          ultimasPartidasTime1: apiData.last_games.last_5_games[team1Name] || [],
          ultimasPartidasTime2: apiData.last_games.last_5_games[team2Name] || [],
          ultimasVsTime: apiData.last_games.last_5_gamesvs[team1Name] || [],
          destaques: {
            time1: jogadoresTime1,
            time2: jogadoresTime2,
          },
        });

      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Erro ao buscar dados:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [team1Id, team2Id, compId]);

  console.log('data', data)

  if (loading) {
    return <div className="w-full h-[600px] bg-[#181818] animate-pulse rounded-lg"></div>;
  }
  if (!data) {
    return <div className="text-center p-6">Dados não disponíveis</div>;
  }

  return (
    <div className="space-y-4">
      {/* Últimas 5 partidas do Time 1 */}
      <div className="bg-[#181818] rounded-lg overflow-hidden">
        <div className="text-sl font-bold p-2 border-b border-gray-800">
          Últimas 5 Partidas {data.ultimasPartidasTime1[0]?.team}
        </div>
        <div className="p-4">
          <div className="bg-[#121212] p-2 rounded-lg">
            <table className="min-w-full table-auto">
              <thead className="bg-[#121212]">
                <tr>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Data</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">GF</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">GA</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Adversário</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Local</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Ycard</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Rcard</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Sot</th>
                </tr>
              </thead>
              <tbody>

                {data.ultimasPartidasTime1.map((partida, index) => (
                  <tr key={index}>
                    <td className="py-1 px-1 text-[12px] text-left text-white">{partida.day}</td>

                    <td className={`py-1 px-2 text-[12px] text-center ${
                      partida.gf > partida.ga ? "text-green-500" : 
                      partida.gf < partida.ga ? "text-red-500" : 
                      "text-white"
                    }`}>
                      {partida.gf}
                    </td>
                    <td className={`py-1 px-2 text-[12px] text-center ${
                      partida.ga < partida.gf ? "text-green-500" : 
                      partida.ga > partida.gf ? "text-red-500" : 
                      "text-white"
                    }`}>
                      {partida.ga}
                    </td>

                    <td className="py-1 px-1 text-[12px] text-left text-white">{partida.opponent}</td>
                    <td className="py-1 px-2 text-[12px] text-center text-white">{partida.venue}</td>
                    <td className="py-1 px-2 text-[12px] text-center text-white">{partida.crdy}</td>
                    <td className="py-1 px-2 text-[12px] text-center text-white">{partida.crdr}</td>
                    <td className="py-1 px-2 text-[12px] text-center text-white">{partida.sot}</td>
                  </tr>
                ))}
                  <tr className="bg-[#1A1A1A]">
                  <td className="py-1 px-1 text-[12px] text-left text-white">Média</td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.gf, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.ga, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                  <td className="py-1 px-2 text-[12px] text-center text-white"></td>
                  <td className="py-1 px-2 text-[12px] text-center text-white"></td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.crdy, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.crdr, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.sot, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Legenda */}
            <div className="mt-4 text-[10px] text-gray-400 flex">
              <p>
                <strong>GF</strong>: Gols Marcados
              </p>
              <p>
                <strong>GA</strong>: Gols Tomados
              </p>
              <p>
                <strong>Ycard</strong>: Cartões Amarelos
              </p>
              <p>
                <strong>Rcard</strong>: Cartões Vermelhos
              </p>
              <p>
                <strong>Sot</strong>: Chutes no Gol
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Destaques */}
<div className="bg-[#181818] rounded-lg overflow-hidden">
  <div className="text-lg font-bold p-3 border-b border-gray-800">Destaques</div>
  <div className="p-4 space-y-4">

    {/* Gols */}
    <div className="space-y-1">
      <div className="text-white font-semibold mb-1">Gols/ Probabilidade de marcar</div>
      {data.destaques.time1
        .filter(jogador => jogador.gols > 0)
        .sort((a, b) => b.gols - a.gols)
        .map((jogador, index) => (
          <div key={`gols-${index}`} className="flex items-center gap-2 text-sm">
            <img 
              src={getPlayerImage(jogador.nome)}
              alt={jogador.nome.replace(/-/g, ' ')} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{jogador.nome.replace(/-/g, ' ')}: </span>
            <span className="font-bold">{jogador.gols} / 33%</span>
          </div>
        ))}
    </div>

    {/* Assistências */}
    <div className="space-y-1">
      <div className="text-white font-semibold mb-1">Assistências</div>
      {data.destaques.time1
        .filter(jogador => jogador.assistencias > 0)
        .sort((a, b) => b.assistencias - a.assistencias)
        .map((jogador, index) => (
          <div key={`assist-${index}`} className="flex items-center gap-2 text-sm">
            <img 
              src={getPlayerImage(jogador.nome)}
              alt={jogador.nome.replace(/-/g, ' ')} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{jogador.nome.replace(/-/g, ' ')}: </span>
            <span className="font-bold">{jogador.assistencias}</span>
          </div>
        ))}
    </div>

    {/* Chutes no Gol */}
    <div className="space-y-1">
      <div className="text-white font-semibold mb-1">Chutes no Gol p/partida</div>
      {data.destaques.time1
        .filter(jogador => jogador.chutes_no_alvo > 0)
        .sort((a, b) => b.chutes_no_alvo - a.chutes_no_alvo)
        .map((jogador, index) => (
          <div key={`assist-${index}`} className="flex items-center gap-2 text-sm">
            <img 
              src={getPlayerImage(jogador.nome)}
              alt={jogador.nome.replace(/-/g, ' ')} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{jogador.nome.replace(/-/g, ' ')}: </span>
            <span className="font-bold">{jogador.chutes_no_alvo}</span>
          </div>
        ))}
    </div>

    {/* Chutes */}
    <div className="space-y-1">
      <div className="text-white font-semibold mb-1">Chutes p/partida</div>
      {data.destaques.time1
        .filter(jogador => jogador.chutes > 0)
        .sort((a, b) => b.chutes - a.chutes)
        .map((jogador, index) => (
         <div key={`assist-${index}`} className="flex items-center gap-2 text-sm">
            <img 
              src={getPlayerImage(jogador.nome)}
              alt={jogador.nome.replace(/-/g, ' ')} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{jogador.nome.replace(/-/g, ' ')}: </span>
            <span className="font-bold">{jogador.chutes}</span>
          </div>
        ))}
    </div>

    {/* Cartões Amarelos */}
    <div className="space-y-1">
      <div className="text-white font-semibold mb-1">Cartões Amarelos p/partida</div>
      {data.destaques.time1
        .filter(jogador => jogador.cartoes_amarelos > 0)
        .sort((a, b) => b.cartoes_amarelos - a.cartoes_amarelos)
        .map((jogador, index) => (
          <div key={`assist-${index}`} className="flex items-center gap-2 text-sm">
            <img 
              src={getPlayerImage(jogador.nome)}
              alt={jogador.nome.replace(/-/g, ' ')} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{jogador.nome.replace(/-/g, ' ')}: </span>
            <span className="font-bold">{jogador.cartoes_amarelos}</span>
          </div>
        ))}
    </div>
  </div>
</div>

      {/* Últimas 5 partidas VS */}
      <div className="bg-[#181818] rounded-lg overflow-hidden">
        <div className="text-sl font-bold p-2 border-b border-gray-800">
          Últimas 5 Partidas VS {data.ultimasVsTime[0]?.team}
        </div>
        <div className="p-4">
          <div className="bg-[#121212] p-2 rounded-lg">
            <table className="min-w-full table-auto">
              <thead className="bg-[#121212]">
                <tr>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Data</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">GF</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">GA</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Adversário</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Local</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Ycard</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Rcard</th>
                  <th className="py-1 px-2 text-[15px] text-left text-white">Sot</th>
                </tr>
              </thead>
              <tbody>

                {data.ultimasVsTime.map((partida, index) => (
                  <tr key={index}>
                    <td className="py-1 px-1 text-[12px] text-left text-white">{partida.day}</td>
                   <td className={`py-1 px-2 text-[12px] text-center ${
                      partida.gf > partida.ga ? "text-green-500" : 
                      partida.gf < partida.ga ? "text-red-500" : 
                      "text-white"
                    }`}>
                      {partida.gf}
                    </td>
                    <td className={`py-1 px-2 text-[12px] text-center ${
                      partida.ga < partida.gf ? "text-green-500" : 
                      partida.ga > partida.gf ? "text-red-500" : 
                      "text-white"
                    }`}>
                      {partida.ga}
                    </td>

                    <td className="py-1 px-1 text-[12px] text-left text-white">{partida.opponent}</td>
                    <td className="py-1 px-2 text-[12px] text-center text-white">{partida.venue}</td>
                    <td className="py-1 px-2 text-[12px] text-center text-white">{partida.crdy}</td>
                    <td className="py-1 px-2 text-[12px] text-center text-white">{partida.crdr}</td>
                    <td className="py-1 px-2 text-[12px] text-center text-white">{partida.sot}</td>
                  </tr>
                ))}
                  <tr className="bg-[#1A1A1A]">
                  <td className="py-1 px-1 text-[12px] text-left text-white">Média</td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.gf, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.ga, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                  <td className="py-1 px-2 text-[12px] text-center text-white"></td>
                  <td className="py-1 px-2 text-[12px] text-center text-white"></td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.crdy, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.crdr, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                  <td className="py-1 px-2 text-[12px] text-center text-white">
                    {data.ultimasPartidasTime1.length > 0 ? (
                      data.ultimasPartidasTime1.reduce((acc, partida) => acc + partida.sot, 0) /
                      data.ultimasPartidasTime1.length
                    ).toFixed(2) : '0.00'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Legenda */}
            <div className="mt-4 text-[10px] text-gray-400 flex">
              <p>
                <strong>GF</strong>: Gols Marcados
              </p>
              <p>
                <strong>GA</strong>: Gols Tomados
              </p>
              <p>
                <strong>Ycard</strong>: Cartões Amarelos
              </p>
              <p>
                <strong>Rcard</strong>: Cartões Vermelhos
              </p>
              <p>
                <strong>Sot</strong>: Chutes no Gol
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


