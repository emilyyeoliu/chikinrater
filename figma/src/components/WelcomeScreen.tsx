import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface WelcomeScreenProps {
  onSubmit: (username: string) => void;
}

export function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">🍗 Chikin Rater</CardTitle>
          <CardDescription>
            Welcome to the ultimate fried chicken taste test!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block mb-2">
                Enter your name to start rating:
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Your name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!username.trim()}>
              Start Tasting! 🍗
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Rate 6 mystery chicken boxes and guess where they're from!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}