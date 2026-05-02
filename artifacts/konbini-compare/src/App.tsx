import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { CompareProvider } from "@/lib/CompareContext";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/home";
import Compare from "@/pages/compare";
import Result from "@/pages/result";
import HowItWorks from "@/pages/how-it-works";
import Demo from "@/pages/demo";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/compare" component={Compare} />
        <Route path="/result" component={Result} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/demo" component={Demo} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CompareProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CompareProvider>
    </QueryClientProvider>
  );
}

export default App;
