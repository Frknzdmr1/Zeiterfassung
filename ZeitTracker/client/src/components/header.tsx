import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PanelsLeftBottom } from "lucide-react";

interface HeaderProps {
  isAdmin: boolean;
  onLogout: () => void;
}

export default function Header({ isAdmin, onLogout }: HeaderProps) {
  const [location, navigate] = useLocation();
  
  const handleAdminClick = () => {
    if (isAdmin) {
      if (location !== "/admin-dashboard") {
        navigate("/admin-dashboard");
      }
    } else {
      navigate("/admin-login");
    }
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">H&S Elektrotechnik GmbH</h1>
        <Button 
          variant="ghost" 
          className="text-white p-0 hover:bg-transparent hover:text-white/80"
          onClick={handleAdminClick}
        >
          <PanelsLeftBottom className="h-5 w-5 mr-1" />
          <span className="text-sm">Admin</span>
        </Button>
      </div>
    </header>
  );
}
