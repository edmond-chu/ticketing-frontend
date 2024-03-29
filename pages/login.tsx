import React, { useState, FormEvent } from 'react'; 
import { useRouter } from 'next/router';
import Link from 'next/link';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    if (username === "admin" && password === "password") {
      localStorage.setItem("isAuthenticated", "true");
      router.push('/admin');
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username/password is admin, password. To be made more secure(maybe)</label>
      </div>
      <div>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit">Login</button>
      <div className="back-to-home">
      <Link href="/" passHref>
        <button type="button">Back to Home</button>
      </Link>
    </div>
    </form>
  );
}