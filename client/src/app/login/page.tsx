'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="auth-container" style={{ margin: 0 }}>
        <h1 className="auth-title">Welcome Back</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <input 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email address" 
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              required
            />
          </div>
          
          {error && <div className="form-error">{error}</div>}
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link href="/register" className="auth-link">
            Sign up now
          </Link>
        </div>
      </div>
    </main>
  );
}

