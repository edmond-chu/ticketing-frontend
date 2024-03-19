"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import homestyle from '../styles/homestyle.module.css'; // Adjust this path to where your styles.module.css file is located

export default function Home() {
  const [ticket, setTicket] = useState({
    name: '',
    email: '',
    description: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTicket(prevTicket => ({
      ...prevTicket,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting ticket', ticket);

    
    // Example backend URL, replace with your actual backend endpoint
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/tickets';


    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticket),
      });
      console.log('Response:', response);

      if (response.ok) {
        setTicket({ name: '', email: '', description: '' });
        alert("Ticket submitted successfully!");
      } else {
        const responseBody = await response.json();
        console.error('Failed to submit ticket:', responseBody);
        alert("Failed to submit ticket. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert("Error submitting ticket. Please check your network and try again.");
    }
  };

  return (
    <main className={homestyle.container}>
      <h1>Submit a Support Ticket</h1>
      <form onSubmit={handleSubmit} className={homestyle.form}>

        <div className={homestyle.inputGroup}>
          <label htmlFor="name">Name </label>
          <input type="text" id="name" name="name" value={ticket.name} onChange={handleChange} style={{color: "black"}} required />
        </div>
        <div className={homestyle.inputGroup}>
          <label htmlFor="email">Email </label>
          <input type="email" id="email" name="email" value={ticket.email} onChange={handleChange} style={{color: "black"}} required />
        </div>
        <div className={homestyle.inputGroup}>
          <label htmlFor="description">Description </label>
          <textarea id="description" name="description" value={ticket.description} onChange={handleChange} style={{color: "black"}} required></textarea>
        </div>
        <button type="submit" className={homestyle.submitBtn}>Submit Ticket</button>
      </form>
      <Link href="/admin" passHref>
        <button type="button" className={homestyle.adminBtn}>Go to Admin Page</button>
      </Link>
    </main>
  );
}
