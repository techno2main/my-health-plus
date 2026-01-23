import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { startOfDay } from "date-fns"
import { AppLayout } from "@/components/Layout/AppLayout"
import { PageHeaderWithHelp } from "@/components/Layout/PageHeaderWithHelp"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useAdherenceStats } from "@/hooks/useAdherenceStats"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHistoryData } from "./hooks/useHistoryData"
import { useFilteredHistory } from "./hooks/useFilteredHistory"
import { useExpandedDays } from "./hooks/useExpandedDays"
import { useGroupedHistory } from "./hooks/useGroupedHistory"
import { FilterButtons } from "./components/FilterButtons"
import { MonthSection } from "./components/MonthSection"
import { DaySection } from "./components/DaySection"
import { StatsCards } from "./components/StatsCards"
import { EmptyState } from "./components/EmptyState"
import { FilterStatus, ActiveTab } from "./types"

export default function History() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<ActiveTab>((searchParams.get("tab") as ActiveTab) || "history")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set([]))

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { historyData, loading } = useHistoryData()
  const { stats, loading: statsLoading } = useAdherenceStats()
  
  // Filter data based on status
  const filteredData = useFilteredHistory(historyData, filterStatus)
  
  // Filter to show only today and past days
  const displayData = useMemo(() => {
    return filteredData.filter(day => {
      const today = startOfDay(new Date())
      const dayDate = startOfDay(day.date)
      return dayDate <= today
    })
  }, [filteredData])
  
  // Separate today from the rest
  const today = startOfDay(new Date())
  const todayData = displayData.find(day => 
    startOfDay(day.date).getTime() === today.getTime()
  )
  
  const historyWithoutToday = displayData.filter(day => 
    startOfDay(day.date).getTime() !== today.getTime()
  )
  
  // Group by month (without today)
  const monthGroups = useGroupedHistory(historyWithoutToday)
  
  // Expanded days management
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)
  const todayRef = null
  
  // Initial setup: expand today
  useEffect(() => {
    if (!isInitialized && todayData) {
      setExpandedDays(new Set([todayData.date.toISOString()]))
      setIsInitialized(true)
    } else if (!isInitialized && !todayData && monthGroups.length > 0) {
      const firstDay = monthGroups[0].days[0]
      if (firstDay) {
        setExpandedDays(new Set([firstDay.date.toISOString()]))
        setExpandedMonths(new Set([monthGroups[0].key]))
        setIsInitialized(true)
      }
    }
  }, [todayData, monthGroups, isInitialized])
  
  // Reset on filter/tab change
  useEffect(() => {
    setExpandedMonths(new Set())
    
    if (todayData) {
      setExpandedDays(new Set([todayData.date.toISOString()]))
    } else if (monthGroups.length > 0 && monthGroups[0].days.length > 0) {
      const firstDay = monthGroups[0].days[0]
      setExpandedDays(new Set([firstDay.date.toISOString()]))
      setExpandedMonths(new Set([monthGroups[0].key]))
    } else {
      setExpandedDays(new Set())
    }
  }, [filterStatus, activeTab])
  
  const toggleDay = (dateKey: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey)
      } else {
        newSet.add(dateKey)
      }
      return newSet
    })
  }

  // Calculate filter counts from stats
  const filterCounts = useMemo(() => {
    if (!stats) return { all: 0, ontime: 0, late: 0, missed: 0, skipped: 0 }
    return {
      all: stats.takenOnTime + stats.lateIntakes + stats.skipped + stats.missed,
      ontime: stats.takenOnTime,
      late: stats.lateIntakes,
      missed: stats.missed,
      skipped: stats.skipped
    }
  }, [stats])

  // Calculate total completed and pending + first intake date
  const { totalCompleted, totalPending, firstIntakeDate } = useMemo(() => {
    const completed = historyData.reduce((sum, day) => 
      sum + day.intakes.filter(i => i.status !== 'pending').length, 0
    )
    const pending = historyData.reduce((sum, day) => 
      sum + day.intakes.filter(i => i.status === 'pending').length, 0
    )
    
    // Find first intake date
    let firstDate: Date | undefined = undefined
    if (historyData.length > 0) {
      const sortedDays = [...historyData].sort((a, b) => a.date.getTime() - b.date.getTime())
      firstDate = sortedDays[0]?.date
    }
    
    return { totalCompleted: completed, totalPending: pending, firstIntakeDate: firstDate }
  }, [historyData])

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab") as ActiveTab
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const handleFilterClick = (filter: FilterStatus) => {
    setFilterStatus(filter)
    setActiveTab("history")
    setSearchParams({ tab: "history" })
  }

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey)
      } else {
        newSet.add(monthKey)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="container max-w-2xl mx-auto px-3 md:px-4 py-6">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-3 md:px-4 pb-6">
        <div className="sticky top-0 z-20 bg-background pt-8 pb-4">
          <PageHeaderWithHelp 
            title="Historique"
            subtitle="Suivi des prises de médicaments"
            helpText="Consultez l'historique complet de vos prises de médicaments. Filtrez par statut (effectuées, manquées, prochaines) et visualisez vos statistiques d'observance."
            leftButton={
              <button
                onClick={() => navigate("/")}
                className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                title="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            }
          />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
          <div className="sticky top-[72px] z-20 bg-background pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="space-y-4">
            <FilterButtons
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              counts={filterCounts}
            />

            {!todayData && monthGroups.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Section Aujourd'hui */}
                {todayData && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
                      Aujourd'hui
                    </h3>
                    <DaySection
                      day={todayData}
                      isExpanded={expandedDays.has(todayData.date.toISOString())}
                      onToggle={() => toggleDay(todayData.date.toISOString())}
                    />
                  </div>
                )}

                {/* Historique par mois */}
                {monthGroups.length > 0 && (
                  <div className="space-y-3">
                    {todayData && (
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2 mt-6">
                        Historique
                      </h3>
                    )}
                    {monthGroups.map((monthGroup) => (
                      <MonthSection
                        key={monthGroup.key}
                        monthGroup={monthGroup}
                        isExpanded={expandedMonths.has(monthGroup.key)}
                        onToggle={() => toggleMonth(monthGroup.key)}
                        expandedDays={expandedDays}
                        onToggleDay={toggleDay}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            {!statsLoading && stats && (
              <StatsCards
                stats={stats}
                onFilterClick={handleFilterClick}
                totalCompleted={totalCompleted}
                totalPending={totalPending}
                firstIntakeDate={firstIntakeDate}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
