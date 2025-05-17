import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FilterControlsProps {
  nameFilter: string;
  dateFilter: string;
  onNameFilterChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
  onApplyFilter: () => void;
  onClearFilter: () => void;
}

export default function FilterControls({
  nameFilter,
  dateFilter,
  onNameFilterChange,
  onDateFilterChange,
  onApplyFilter,
  onClearFilter
}: FilterControlsProps) {
  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="filterName" className="block text-neutral-800 text-sm font-medium mb-2">
            Nach Name filtern
          </Label>
          <Input
            id="filterName"
            type="text"
            value={nameFilter}
            onChange={(e) => onNameFilterChange(e.target.value)}
            className="w-full px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="filterDate" className="block text-neutral-800 text-sm font-medium mb-2">
            Nach Datum filtern
          </Label>
          <Input
            id="filterDate"
            type="date"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="w-full px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          className="bg-[#ff9d00] hover:bg-[#ff9d00]/90 text-white"
          onClick={onApplyFilter}
        >
          Filter anwenden
        </Button>
        <Button 
          variant="outline" 
          className="text-primary border-primary hover:bg-primary/10"
          onClick={onClearFilter}
        >
          Zurücksetzen
        </Button>
      </div>
    </div>
  );
}
