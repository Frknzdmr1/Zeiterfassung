import React from "react";
import { TimeEntry } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Map } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EntriesTableProps {
  entries: TimeEntry[];
  isLoading: boolean;
  isError: boolean;
}

export default function EntriesTable({ entries, isLoading, isError }: EntriesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-error">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-600">
        <p>Keine Einträge gefunden.</p>
      </div>
    );
  }

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-neutral-100 border-b">
            <TableHead>Name</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Zeit</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Fahrer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.map((entry) => (
            <TableRow key={entry.id} className="border-b hover:bg-neutral-100">
              <TableCell>{entry.name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {entry.type === "Einstempeln" || entry.type === "Kommen" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#4caf50] mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 text-[#f44336] mr-1" />
                  )}
                  <span 
                    className={
                      (entry.type === "Einstempeln" || entry.type === "Kommen") ? "text-[#4caf50] font-medium" : "text-[#f44336] font-medium"
                    }
                  >
                    {entry.type === "Kommen" ? "Einstempeln" : entry.type === "Gehen" ? "Ausstempeln" : entry.type}
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatDate(entry.timestamp)}</TableCell>
              <TableCell>
                <a 
                  href={`https://maps.google.com/?q=${entry.latitude},${entry.longitude}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <Map className="h-4 w-4 mr-1" />
                  Maps
                </a>
              </TableCell>
              <TableCell>{entry.isDriver ? "Ja" : "Nein"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>Anzeige 1-{sortedEntries.length} von {sortedEntries.length} Einträgen</div>
      </div>
    </div>
  );
}
