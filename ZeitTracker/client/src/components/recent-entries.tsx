import React from "react";
import { TimeEntry } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RecentEntriesProps {
  entries: TimeEntry[];
}

export default function RecentEntries({ entries }: RecentEntriesProps) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-neutral-800 italic">Keine Einträge gefunden.</p>
    );
  }

  return (
    <ul className="divide-y">
      {entries.map((entry) => (
        <li key={entry.id} className="py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {entry.type === "Einstempeln" || entry.type === "Kommen" ? (
                <CheckCircle2 className="h-4 w-4 text-[#4caf50] mr-2" />
              ) : (
                <XCircle className="h-4 w-4 text-[#f44336] mr-2" />
              )}
              <span 
                className={(entry.type === "Einstempeln" || entry.type === "Kommen") ? "text-[#4caf50] font-medium" : "text-[#f44336] font-medium"}
              >
                {entry.type === "Kommen" ? "Einstempeln" : entry.type === "Gehen" ? "Ausstempeln" : entry.type}
              </span>
            </div>
            <span className="text-sm text-neutral-600">{formatDate(entry.timestamp)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
