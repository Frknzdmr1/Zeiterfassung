import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onLogin: (status: boolean) => void;
}

export default function AdminLoginPage({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest("POST", "/api/admin/login", {
        username: "admin", // Using a fixed admin username
        password
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Set admin session in localStorage
        localStorage.setItem("admin_session", "true");
        onLogin(true);
        navigate("/admin-dashboard");
        toast({
          title: "Anmeldung erfolgreich",
          description: "Sie sind jetzt als Administrator angemeldet.",
        });
      }
    } catch (err) {
      setError("Ungültiges Passwort. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-2">
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Button>
          <h2 className="text-xl font-bold text-primary">Admin-Anmeldung</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="adminPassword">Passwort</Label>
            <Input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Wird angemeldet..." : "Anmelden"}
          </Button>
        </form>
        
        {error && (
          <div className="mt-4 text-error text-center text-sm">{error}</div>
        )}
      </CardContent>
    </Card>
  );
}
