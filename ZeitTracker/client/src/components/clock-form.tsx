import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import useGeolocation from "@/hooks/use-geolocation";

interface ClockFormProps {
  employeeName: string;
  onNameChange: (name: string) => void;
  onStatusMessage: (type: "success" | "error", message: string) => void;
  onClockSuccess: () => void;
}

export default function ClockForm({ 
  employeeName, 
  onNameChange, 
  onStatusMessage,
  onClockSuccess
}: ClockFormProps) {
  const [isDriver, setIsDriver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getLocation, isLoading: isLocationLoading, error: locationError } = useGeolocation();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  };

  const handleDriverChange = (checked: boolean) => {
    setIsDriver(checked);
  };

  const handleClock = async (type: "Einstempeln" | "Ausstempeln") => {
    if (!employeeName.trim()) {
      onStatusMessage("error", "Bitte geben Sie Ihren Namen ein.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the current location
      const location = await getLocation();
      
      if (locationError) {
        onStatusMessage("error", `Positionsfehler: ${locationError}`);
        setIsSubmitting(false);
        return;
      }

      // Create and submit the time entry
      const entry = {
        name: employeeName.trim(),
        type,
        // Don't include timestamp, let the server set it by default
        latitude: location.latitude,
        longitude: location.longitude,
        isDriver,
      };

      await apiRequest("POST", "/api/time-entries", entry);
      
      // Show success message
      onStatusMessage(
        "success", 
        type === "Einstempeln" ? "Erfolgreich eingestempelt!" : "Erfolgreich ausgestempelt!"
      );
      
      // Trigger a refresh of the recent entries
      onClockSuccess();
    } catch (error) {
      onStatusMessage("error", "Fehler beim Speichern des Eintrags. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4 text-primary">Zeiterfassung</h2>
        <p className="mb-4 text-neutral-800">Bitte melden Sie sich an, um Ihre Arbeitszeit zu erfassen.</p>
        
        <div className="mb-4">
          <Label htmlFor="employeeName" className="mb-2">Name</Label>
          <Input
            id="employeeName"
            value={employeeName}
            onChange={handleNameChange}
            className="w-full px-4 py-3"
            required
          />
        </div>
        
        <div className="mb-6 flex items-center space-x-2">
          <Switch 
            id="isDriver" 
            checked={isDriver}
            onCheckedChange={handleDriverChange}
          />
          <Label htmlFor="isDriver" className="cursor-pointer">Fahrer</Label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            className="bg-[#4caf50] hover:bg-[#4caf50]/90 text-white flex items-center justify-center py-3 px-4 text-lg"
            disabled={isSubmitting || isLocationLoading}
            onClick={() => handleClock("Einstempeln")}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Einstempeln
          </Button>
          <Button
            className="bg-[#f44336] hover:bg-[#f44336]/90 text-white flex items-center justify-center py-3 px-4 text-lg"
            disabled={isSubmitting || isLocationLoading}
            onClick={() => handleClock("Ausstempeln")}
          >
            <XCircle className="mr-2 h-5 w-5" />
            Ausstempeln
          </Button>
        </div>
        
        {isLocationLoading && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Standort wird ermittelt...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
