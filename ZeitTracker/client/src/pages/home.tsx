import React, { useState, useEffect } from "react";
import ClockForm from "@/components/clock-form";
import RecentEntries from "@/components/recent-entries";
import { useQuery } from "@tanstack/react-query";
import { TimeEntry } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [employeeName, setEmployeeName] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load employee name from localStorage if available
  useEffect(() => {
    const savedName = localStorage.getItem("employeeName");
    if (savedName) {
      setEmployeeName(savedName);
    }
  }, []);

  // Get recent entries for the current employee
  const { data: recentEntries = [], refetch } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries", employeeName],
    enabled: !!employeeName,
    select: (data) => {
      // Filter entries for current employee and sort by timestamp (newest first)
      return data
        .filter(entry => entry.name.toLowerCase() === employeeName.toLowerCase())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
    }
  });

  const handleStatusMessage = (type: "success" | "error", message: string) => {
    setStatusMessage({ type, message });
    // Clear the message after 5 seconds
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const handleNameChange = (name: string) => {
    setEmployeeName(name);
    localStorage.setItem("employeeName", name);
  };

  const handleClockSuccess = () => {
    refetch();
  };

  return (
    <>
      <ClockForm 
        employeeName={employeeName} 
        onNameChange={handleNameChange}
        onStatusMessage={handleStatusMessage}
        onClockSuccess={handleClockSuccess}
      />
      
      {statusMessage && (
        <Alert 
          className={cn(
            "mb-6", 
            statusMessage.type === "success" ? "bg-success/20 text-success border-success" : "bg-error/20 text-error border-error"
          )}
        >
          {statusMessage.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{statusMessage.message}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 text-primary">Ihre letzten Einträge</h3>
          <RecentEntries entries={recentEntries} />
        </CardContent>
      </Card>
    </>
  );
}
