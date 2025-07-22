"use client";

import { useState, useEffect, useRef } from "react";
import { HelpCircle, Search, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SearchItem {
  display_name: string;
  id_name: string;
  type: "player" | "team";
}

export default function Header() {
  const [search, setSearch] = useState("");
  const [filteredResults, setFilteredResults] = useState<SearchItem[]>([]);
  const [allItems, setAllItems] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://3fwc3rm2jr.us-east-2.awsapprunner.com/get_all_players_teams",
          {
            headers: {
              "x-api-key":
                "Y5p4d7vQHxB7mI9F-3S2Glp8ZszYaaE4894312312xUkWqjRnH4aDdas215SAa156DSA581a51cAq2w",
            },
          }
        );
        const data = await response.json();
        setAllItems(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setFilteredResults([]);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    if (query.length > 1) {
      const lowerCaseQuery = query.toLowerCase();
      const results = allItems.filter((item) =>
        item.display_name.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  };

  return (
    <header className="bg-[#16a35f] min-h-[125px] shadow-md py-3 px-6 flex items-center justify-between">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          width={200}
          height={100}
          className="ml-[156px] cursor-pointer"
        />
      </Link>
      <div
        className="absolute mx-3 ml-[600px] w-[660px] text-sm"
        ref={searchContainerRef}
      >
        <div className="flex items-center border border-gray-300 bg-gray-100 rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder={isLoading ? "Carregando dados..." : "Procure times ou jogadores..."}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-gray-800"
            disabled={isLoading}
          />
        </div>
        {filteredResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50">
            <ul className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden max-h-[500px] overflow-y-auto text-sm">
              {filteredResults.map((result, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Link
                    href={`/${result.type}/${result.id_name}`}
                    className="block text-gray-800"
                  >
                    {result.display_name} ({result.type === "player" ? "Player" : "Team"})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 mr-[150px]">
        <button className="rounded-full">
          <Image
            src="/placeholder.svg?height=32&width=32"
            alt="User"
            className="h-8 w-8 rounded-full border"
            width={32}
            height={32}
          />
        </button>
        <button className="rounded-full bg-black/20 p-2">
          <Settings size={20} className="text-white" />
        </button>
        <button className="rounded-full bg-black/20 p-2 mr-9">
          <HelpCircle size={20} className="text-white" />
        </button>
      </div>
    </header>
  );
}
