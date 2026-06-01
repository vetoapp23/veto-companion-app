import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthSession, useLogin } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export function AuthTest() {
  const [email, setEmail] = useState('admin@vetpro.com');
  const [password, setPassword] = useState('password123');
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const { data: user, isLoading: userLoading, error: userError, refetch } = useAuthSession();
  const loginMutation = useLogin();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    addResult('Testing Supabase connection...');
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) {
        addResult(`❌ Connection failed: ${error.message}`);
      } else {
        addResult('✅ Supabase connection successful');
      }
    } catch (error: any) {
      addResult(`❌ Connection error: ${error.message}`);
    }
  };

  const testAuth = async () => {
    addResult('Testing auth session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addResult(`❌ Auth session error: ${error.message}`);
      } else if (session) {
        addResult(`✅ Auth session found: ${session.user.email}`);
      } else {
        addResult('ℹ️ No active session');
      }
    } catch (error: any) {
      addResult(`❌ Auth test error: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    addResult(`Attempting login with ${email}...`);
    try {
      await loginMutation.mutateAsync({ email, password });
      addResult('✅ Login successful');
      setTimeout(() => refetch(), 500);
    } catch (error: any) {
      addResult(`❌ Login failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    addResult('Logging out...');
    try {
      await supabase.auth.signOut();
      addResult('✅ Logout successful');
      setTimeout(() => refetch(), 500);
    } catch (error: any) {
      addResult(`❌ Logout failed: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Authentication Test Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current User Status:</h3>
            {userLoading && <p>Loading user...</p>}
            {userError && <p className="text-red-600">Error: {userError.message}</p>}
            {user ? (
              <div>
                <p>✅ Authenticated: {user.email}</p>
                <p>Name: {user.profile.full_name}</p>
                <p>Role: {user.profile.role}</p>
                <p>ID: {user.id}</p>
              </div>
            ) : (
              <p>❌ Not authenticated</p>
            )}
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testConnection} variant="outline">
              Test Connection
            </Button>
            <Button onClick={testAuth} variant="outline">
              Test Auth Session
            </Button>
            <Button onClick={() => refetch()} variant="outline">
              Refetch User
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>

          {/* Login Form */}
          <div className="space-y-2">
            <Label htmlFor="test-email">Email</Label>
            <Input
              id="test-email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Label htmlFor="test-password">Password</Label>
            <Input
              id="test-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleLogin} 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
              {testResults.length === 0 && (
                <div className="text-gray-500">No test results yet...</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
