import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { CompareProvider } from "@/lib/CompareContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Result from "@/pages/result";
import HowItWorks from "@/pages/how-it-works";
import { useEffect } from "react";
import { setBaseUrl } from "@workspace/api-client-react";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/profile" component={Profile} />
        <Route path="/result" component={Result} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    // Set API base URL from environment variable if available
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      setBaseUrl(apiUrl);
      
      // Ping the backend to wake it up (Render Free Plan)
      fetch(`${apiUrl}/api/categories`).catch(() => {
        // Ignore errors, we just want to trigger a wake-up
      });
    } else {
      // Fallback for local development or same-origin deployment
      fetch("/api/categories").catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CompareProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </CompareProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
