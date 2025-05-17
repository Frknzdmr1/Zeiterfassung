import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FilterControls from "@/components/admin/filter-controls";
import EntriesTable from "@/components/admin/entries-table";
import { useQuery } from "@tanstack/react-query";
import { TimeEntry } from "@shared/schema";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboardPage({ onLogout }: AdminDashboardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  
  // Fetch all time entries
  const { data: entries = [], isLoading, isError, refetch } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
    refetchInterval: 5000, // Regelmäßig aktualisieren (alle 5 Sekunden)
  });

  const handleBackClick = () => {
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    onLogout();
    navigate("/");
    toast({
      title: "Abmeldung erfolgreich",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
  };

  const applyFilters = () => {
    let filtered = [...entries];
    
    if (nameFilter) {
      filtered = filtered.filter(entry => 
        entry.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= filterDate && entryDate < nextDay;
      });
    }
    
    setFilteredEntries(filtered);
  };

  const clearFilters = () => {
    setNameFilter("");
    setDateFilter("");
    setFilteredEntries([]);
  };

  // Display entries based on filter state
  const displayEntries = filteredEntries.length > 0 ? filteredEntries : entries;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-2">
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
            <h2 className="text-xl font-bold text-primary">Admin-Dashboard</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary flex items-center">
            <LogOut className="h-4 w-4 mr-1" />
            <span>Abmelden</span>
          </Button>
        </div>
        
        <FilterControls
          nameFilter={nameFilter}
          dateFilter={dateFilter}
          onNameFilterChange={setNameFilter}
          onDateFilterChange={setDateFilter}
          onApplyFilter={applyFilters}
          onClearFilter={clearFilters}
        />
        
        <div className="mt-4">
          <EntriesTable 
            entries={displayEntries} 
            isLoading={isLoading}
            isError={isError}
          />
        </div>
      </CardContent>
    </Card>
  );
}
