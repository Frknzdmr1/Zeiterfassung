import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import AdminLoginPage from "@/pages/admin-login";
import AdminDashboardPage from "@/pages/admin-dashboard";
import { useCallback, useEffect, useState } from "react";
import Header from "./components/header";
import Footer from "./components/footer";

function Router() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const handleLogin = useCallback((status: boolean) => {
    setIsAdmin(status);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAdmin(false);
  }, []);

  // Check for existing admin session in localStorage on component mount
  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session");
    if (adminSession === "true") {
      setIsAdmin(true);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isAdmin={isAdmin} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-6 md:max-w-md">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/admin-login">
            {() => <AdminLoginPage onLogin={handleLogin} />}
          </Route>
          <Route path="/admin-dashboard">
            {() => 
              isAdmin ? 
                <AdminDashboardPage onLogout={handleLogout} /> : 
                <AdminLoginPage onLogin={handleLogin} />
            }
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
