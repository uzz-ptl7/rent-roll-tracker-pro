
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import MainDashboard from "@/components/MainDashboard";

const AuthWrapper = () => {
  const [user, setUser] = useState<null | import('@supabase/supabase-js').User>(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  // Fetch session and user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    fetchUser();

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleLoginSuccess = () => {
    toast({
      title: "Login Success",
      description: "Welcome back!",
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    if (showSignup) {
      return <SignupForm onBackToLogin={() => setShowSignup(false)} />;
    }
    return (
      <LoginForm 
        onLoginSuccess={handleLoginSuccess} 
        onShowSignup={() => setShowSignup(true)} 
      />
    );
  }

  return <MainDashboard user={user} onLogout={handleLogout} />;
};

export default AuthWrapper;
