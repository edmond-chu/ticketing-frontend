"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [ticket, setTicket] = useState({
    name: '',
    email: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket({
      ...ticket,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting ticket', ticket);

    try {
      const response = await fetch('https://ticketing-backend-ocr8.onrender.com/api/v1/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticket),
      });

      if (response.ok) {
        setTicket({ name: '', email: '', description: '' });
        alert("Ticket submitted successfully!");
      } else {
        alert("Failed to submit ticket. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert("Error submitting ticket. Please check your network and try again.");
    }
  };

  return (
    <main className="container">
      <h1>Submit a Support Ticket</h1>
      <form onSubmit={handleSubmit} className="form">

        <div className="input-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" value={ticket.name} onChange={handleChange} style={{color: "black"}} required />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={ticket.email} onChange={handleChange} style={{color: "black"}} required />
        </div>
        <div className="input-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={ticket.description} onChange={handleChange} style={{color: "black"}} required></textarea>
        </div>
        <button type="submit" className="submit-btn">Submit Ticket</button>
      </form>
      <Link href="/admin" passHref>
        <button type="button" className="admin-btn">Go to Admin Page</button>
      </Link>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 400px;
        }
        .input-group label {
          margin-bottom: 5px;
        }
        .input-group input,
        .input-group textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .submit-btn, .admin-btn {
          width: 100%;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          background-color: #007bff;
          color: white;
          cursor: pointer;
        }
        .admin-btn {
          margin-top: 20px;
        }
      `}</style>
    </main>
  );
}
