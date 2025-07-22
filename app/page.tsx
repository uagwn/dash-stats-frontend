"use client";
import { useState, useEffect } from "react";
import { Search, Settings } from "lucide-react";
import { teams_logos } from "./src/teamsLogos";
import Link from "next/link"
import RootLayout from './layout'; 

interface Match {
  round: string;
  time: string;
  home: string;
  away: string;
  venue: string;
  notes: string;
  date: string;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [leftSidebarVisible, setLeftSidebarVisible] = useState<boolean>(true);
  const [rightSidebarVisible, setRightSidebarVisible] = useState<boolean>(true);
  const [winStreakData, setWinStreakData] = useState<any[]>([]);
  const [topWinRate, setTopWinRate] = useState<any[]>([]);
  const [topteamSot, setTopteamSot] = useState<any[]>([]);
  const [topteamCk, settopteamCk] = useState<any[]>([]);
  const [topteamGf, settopteamGf] = useState<any[]>([]);



  const fetchGetData = async () => {
    try {
      const response = await fetch("https://3fwc3rm2jr.us-east-2.awsapprunner.com/get_calendar_stats" , {
              headers: {
              'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
            }});
      const data = await response.json();

      setWinStreakData(data["top5_times_winstreak"] || []);
      setTopWinRate(data["top5_w_total"] || []);
      setTopteamSot(data["top5_teams_avg_sot"] || []);
      settopteamCk(data["top5_teams_avg_ck"] || []);
      settopteamGf(data["top5_teams_avg_gf"] || []);



    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  };

  useEffect(() => {
    //calendario
    const fetchMatches = async () => {
      try {
        const response = await fetch("https://3fwc3rm2jr.us-east-2.awsapprunner.com/get_calendar", {
              headers: {
              'x-api-key': 'Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w',
            }});

        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`Erro ao buscar dados das prox partidas. Status: ${response.status}. Detalhes: ${errorDetails}`);
        }
        const data: Match[] = await response.json();
        const today = new Date();
        setMatches(data)
        today.setHours(0, 0, 0, 0);
        console.log(data)
        {/* pegar apenas dados futuros para evitar erros
        const futureMatches = data.filter((match) => {
          if (!match.date || typeof match.date !== "string") return false;
          const [day, month] = match.date.split("/").map(Number);
          const matchDate = new Date(today.getFullYear(), month - 1, day);
          return matchDate >= today;
        });
        setMatches(futureMatches);
        */}

      } catch (error) {
        console.error("Erro ao fazer a requisição", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    fetchGetData();  
  }, []);
  console.log('matches', matches)
  const normalizeForUrl = (str: string) =>
    encodeURIComponent(str.replace(/ /g, "-"));

  const getTeamLogo = (teamName: string) => {
    const team = teams_logos.find((t) => t.name.toLowerCase() === teamName.toLowerCase());
    return team ? team.logo : null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <main className="flex flex-col items-center p-6">
        {/* Card fixado à esquerda (sidebar) */}
        <div
          className={`fixed bottom-0 left-10 w-[400px] h-[600px] bg-[#181818] p-6 text-white shadow-lg cursor-pointer transition-transform duration-300 rounded-lg shadow lg z-10 ${leftSidebarVisible ? "translate-x-0" : "-translate-x-full"}`}
          onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
        >
          <div>
            <h3 className="font-bold text-xl mb-1">Sequência de vitórias</h3>
            <div className="border-t-[1px] border-[#2B2B2B] flex-1 mb-4"></div>
            {winStreakData.length > 0 ? (
              <ul className="text-white">
                
                {winStreakData.map((Win_Streak, index) => (
                  <li key={index} className="mb-4 text-lg flex items-center mt-2">

                    {getTeamLogo(Win_Streak.Team) && (
                   <img src={getTeamLogo(Win_Streak.Team)} alt={Win_Streak.Team} className="h-6 mr-2" />
                    )} 
                    {`${Win_Streak.Team} -  ${Win_Streak.Win_Streak}`}
                    
                    <div className="flex gap-1 ml-4 ">
                      {Array.from({ length: Win_Streak.Win_Streak }).map((_, idx) => (
                        <div key={idx} className="w-4 h-4 rounded-full bg-green-500 mr-1"></div>
                      ))}                
                    </div>
                  </li>
      
                ))}
              </ul>

            ) : (
              <p>Sem dados de sequência de vitórias.</p>
            )}
  

            <div>
            <h3 className="font-bold text-xl mb-2">Top % de vitórias</h3>
            <div className="border-t-[1px] border-[#2B2B2B] flex-1 mb-4"></div>

            {topWinRate.length > 0 ? (
              <ul className="text-white">
                {topWinRate.map((Team, index) => {
                  const porcentagem = parseFloat(Team.porcentagem_vitoria_total);
                  return (
                    <li key={index} className="mb-4 text-lg flex">
                      {getTeamLogo(Team.Team) && (
                        <img src={getTeamLogo(Team.Team)} alt={Team.Team} className="h-6 mr-2" />
                      )}
                      <span className="mr-2 ml-2"> {Team.Team} </span> - 
                      <span className="ml-2"> {isNaN(porcentagem) ? "N/A" : porcentagem.toFixed(2)}%</span>
                    </li>
                  );
                })}
              </ul> 
            ) : (
              <p>Sem dados de % vitória.</p>
            )}
            <p className="text-[12px]">*Dados referente aos times que vão jogar hoje</p>
          </div>
          </div>
        </div>

        {/* Card fixado à direita (sidebar) */}
        <div
          className={`fixed bottom-0 right-10 w-[400px] h-[650px] bg-[#181818] p-6 text-white shadow-lg cursor-pointer transition-transform duration-300 rounded-lg shadow lg z-10 ${rightSidebarVisible ? "translate-x-0" : "translate-x-full"}`}
          onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
        >
          <div>
            <h3 className="font-bold text-[20px] mb-1">Top chute a gols por partida</h3>
            <div className="border-t-[1px] border-[#2B2B2B] flex-1 mb-2"></div>
            {topteamSot.length > 0 ? (
              <ul className="text-white">
                
                {topteamSot.map((topteamSot, index) => (
                  <li key={index} className="mb-2 text-[16px] flex items-center mt-2">

                    {getTeamLogo(topteamSot.Team) && (
                   <img src={getTeamLogo(topteamSot.Team)} alt={topteamSot.Team} className="h-6 mr-2" />
                    )} 
                
                    {`${topteamSot.Team} -  ${(Number(topteamSot.Avg_SoT) || 0).toFixed(1)}`}
                    
                  </li>
                  
                ))}
              </ul>
            ) : (
              <p>Sem dados de chute a gol.</p>
            )}
            </div>

            <div>
            <h3 className="font-bold text-[20px] mb-1">Top gols feitos por partida</h3>
            <div className="border-t-[1px] border-[#2B2B2B] flex-2 mb-"></div>
            {topteamGf.length > 0 ? (
              <ul className="text-white">
                
                {topteamGf.map((topteamGf, index) => (
                  <li key={index} className="mb-2 text-[16px] flex items-center mt-2">

                    {getTeamLogo(topteamGf.Team) && (
                   <img src={getTeamLogo(topteamGf.Team)} alt={topteamGf.Team} className="h-6 mr-2" />
                    )} 
                
                    {`${topteamGf.Team} -  ${(Number(topteamGf.Avg_GF) || 0).toFixed(1)}`}
                    
                  </li>
                  
                ))}
              </ul>
            ) : (
              <p>Sem dados de gols feitos.</p>
            )}
            </div>

            <div>
            <h3 className="font-bold text-[20px] mb-1">Top escanteios por partida</h3>
            <div className="border-t-[1px] border-[#2B2B2B] flex-1 mb-2"></div>
            {topteamSot.length > 0 ? (
              <ul className="text-white">
                
                {topteamCk.map((topteamCk, index) => (
                  <li key={index} className="mb-2 text-[16px] flex items-center mt-2">

                    {getTeamLogo(topteamCk.Team) && (
                   <img src={getTeamLogo(topteamCk.Team)} alt={topteamCk.Team} className="h-6 mr-2" />
                    )} 
                
                    {`${topteamCk.Team} -  ${(Number(topteamCk.Avg_CK) || 0).toFixed(1)}`}
                    
                  </li>
                  
                ))}
              </ul>
            ) : (
              <p>Sem dados de escanteios</p>
            )}
             <p className="text-[10px]">*Dados referente aos times que vão jogar hoje</p>

            </div>
          
            
        </div>

        {/* Botões para mostrar as sidebars */}
        {!leftSidebarVisible && (
          <button
            className="fixed left-0 bottom-10 bg-green-500 text-white px-4 py-2 rounded-r-lg shadow-md z-10"
            onClick={() => setLeftSidebarVisible(true)}
          >
            Mostrar dados
          </button>
        )}

        {!rightSidebarVisible && (
          <button
            className="fixed right-0 bottom-10 bg-green-500 text-white px-4 py-2 rounded-l-lg shadow-md z-10"
            onClick={() => setRightSidebarVisible(true)}
          >
            Mostrar dados
          </button>
        )}

        <div className="w-full max-w-2xl bg-[#101010] p-10 rounded-lg space-y-4">
          <h1 className="text-3xl font-bold mb-6 text-white text-left">Próximas Partidas</h1>

          {loading ? (
            <p className="text-white">Carregando partidas...</p>
          ) : matches.length > 0 ? (
            matches.map((match, index) => (
              <Link
               href={`/comparacao/${normalizeForUrl(match.home)}/${normalizeForUrl(match.away)}/${normalizeForUrl(match.round)}`}
              key={index}
              className="block bg-[#1a1a17] p-4 rounded-lg shadow-md text-white hover:bg-[#252520] transition-colors"
              >
                <div key={index} className="bg-[#1a1a17] p-4 rounded-lg shadow-md text-white">
                  <p className="text-sm text-white">
                    {match.date} • {match.time} - {match.round}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTeamLogo(match.home) && (
                        <img src={getTeamLogo(match.home)} alt={match.home} className="h-7 mr-2" />
                      )}
                      <p className="text-lg font-semibold text-gray-800 mt-1 truncate text-white">
                        {match.home}
                      </p>
                    </div>

                    <span className="text-white absolute left-1/2 transform -translate-x-1/2 text-2xl font-semibold">Vs</span>

                    <div className="flex items-center gap-2 justify-start">
                      <p className="text-lg font-semibold text-gray-800 mt-1 truncate text-white">{match.away}</p>
                      {getTeamLogo(match.away) && <img src={getTeamLogo(match.away)} alt={match.away} className="h-6 ml-2" />}
                    </div>

                  </div>
                </div>

              </Link>
            ))
          ) : (
            <p className="text-white">Não há partidas futuras.</p>
          )}
        </div>
      </main>
    </div>
  );
}
