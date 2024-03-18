import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Admin() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [responses, setResponses] = useState({});
    const [showResponsesForTicketId, setShowResponsesForTicketId] = useState(null);
    const [responseTexts, setResponseTexts] = useState({}); // State to manage response texts for each ticket
    const [status, setStatus] = useState(''); // State to manage the ticket status update

    useEffect(() => {
        const fetchTickets = async () => {
            const res = await fetch('https://ticketing-backend-ocr8.onrender.com/api/v1/tickets');
            const data = await res.json();
            setTickets(data);
        };

        fetchTickets();
    }, []);

    const handleResponseChange = (ticketId, text) => {
        setResponseTexts(prev => ({ ...prev, [ticketId]: text }));
    };

    const handleResponseSubmit = async (e, ticketId) => {
        e.preventDefault(); // Prevent form submission from reloading the page
        const description = responseTexts[ticketId];
        try {
            await fetch(`https://ticketing-backend-ocr8.onrender.com/api/v1/tickets/${ticketId}/responses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });
            setResponseTexts(prev => ({ ...prev, [ticketId]: '' })); // Clear the text area for this ticket
            alert('Response submitted successfully');
        } catch (error) {
            console.error('Failed to submit response:', error);
        }
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleStatusUpdate = async (ticketId) => {
        try {
            const response = await fetch(`https://ticketing-backend-ocr8.onrender.com/api/v1/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                // Update the ticket status locally
                const updatedTickets = tickets.map((ticket) => {
                    if (ticket.id === ticketId) {
                        return { ...ticket, status };
                    }
                    return ticket;
                });
                setTickets(updatedTickets);
                alert('Ticket status updated successfully');
            } else {
                alert('Failed to update ticket status');
            }
        } catch (error) {
            console.error('Error updating ticket status:', error);
        }
    };

    const handleShowResponses = async (ticketId) => {
        if (showResponsesForTicketId === ticketId) {
            setShowResponsesForTicketId(null);
            setResponses(prev => ({ ...prev, [ticketId]: [] }));
        } else {
            const res = await fetch(`https://ticketing-backend-ocr8.onrender.com/api/v1/tickets/${ticketId}/responses`);
            const data = await res.json();
            setShowResponsesForTicketId(ticketId);
            if (data.length === 0) {
                // If there are no responses, update the state with an empty array
                setResponses(prev => ({ ...prev, [ticketId]: [] }));
            } else {
                // If there are responses, update the state with the fetched data
                setResponses(prev => ({ ...prev, [ticketId]: data }));
            }
        }
    };

    return (
        <main className="admin-container">
            <h1>Admin Dashboard</h1>
            {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-container">
                    <h2>{ticket.name} ({ticket.status})</h2>
                    <p>Email: {ticket.email}</p>
                    {selectedTicketId === ticket.id && <p>Description: {ticket.description}</p>}
                    <button onClick={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}>
                        {selectedTicketId === ticket.id ? 'Hide Ticket Description' : 'Show Ticket Description'}
                    </button>
                    <div className="status-update">
                        <label htmlFor={`status-select-${ticket.id}`}>Status:</label>
                        <select
                            id={`status-select-${ticket.id}`}
                            value={status}
                            onChange={handleStatusChange}
                        >
                            <option value="">Select Status</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                        <button onClick={() => handleStatusUpdate(ticket.id)}>Update Status</button>
                    </div>
                    {/* Remaining code for managing responses... */}
                    <form onSubmit={(e) => handleResponseSubmit(e, ticket.id)} className="response-form">
                        <textarea
                            value={responseTexts[ticket.id] || ''}
                            onChange={(e) => handleResponseChange(ticket.id, e.target.value)}
                            placeholder="Notify User"
                        ></textarea>
                        <button type="submit">Submit Response</button>
                    </form>
                    <button onClick={() => handleShowResponses(ticket.id)}>
                        {showResponsesForTicketId === ticket.id ? 'Collapse Support Responses' : 'Show Support Responses'}
                    </button>
                    {showResponsesForTicketId === ticket.id && responses[ticket.id] && Array.isArray(responses[ticket.id]) && (
                        <ul>
                          {responses[ticket.id].map((response, index) => (
                              <li key={index}>{response.description} {new Date(response.created_at).toLocaleString()}</li>
                          ))}
                        </ul>
                    )}
                </div>
            ))}
            <div className="back-to-home">
              <Link href="/"><button className="mt-4">Back to Home</button></Link>
            </div>
            <style jsx>{`
                .admin-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .ticket-container {
                    border: 1px solid #ccc;
                    padding: 20px;
                    margin-bottom: 20px;
                    width: 80%;
                }
                .status-update {
                    margin-top: 10px;
                }
                .back-to-home {
                    margin-top: 20px;
                }
            `}</style>
        </main>
    );
}
