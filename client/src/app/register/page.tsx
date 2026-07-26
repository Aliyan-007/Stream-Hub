'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      router.push('/');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="auth-container" style={{ margin: 0 }}>
        <h1 className="auth-title">Create Account</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username" 
              required
            />
          </div>
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
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

