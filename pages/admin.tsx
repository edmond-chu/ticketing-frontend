import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';

type Ticket = {
  id: number;
  name: string;
  status: string;
  email: string;
  description: string;
};
// Define the type for response texts
type ResponseTexts = {
  [key: string]: string;
};
export default function Admin() {
    const url = 'https://ticketing-backend-ocr8.onrender.com';


    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [responses, setResponses] = useState<{ [key: string]: any[] }>({}); // Assuming response structure is an array
    const [showResponsesForTicketId, setShowResponsesForTicketId] = useState<number | null>(null);
    const [responseTexts, setResponseTexts] = useState<ResponseTexts>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState('');
    const [searchedTicket, setSearchedTicket] = useState<Ticket | null>(null);


    useEffect(() => {
        const fetchTickets = async () => {
            const res = await fetch(url + '/api/v1/tickets');
            const data = await res.json();
            setTickets(data);
        };

        fetchTickets();
    }, []);

    const handleResponseChange = (ticketId: number, text: string) => {
        setResponseTexts(prev => ({ ...prev, [ticketId.toString()]: text }));
    };

    const fetchResponses = async (ticketId:number) => {
        try {
            const res = await fetch(url + `/api/v1/tickets/${ticketId}/responses`);
            const data = await res.json();
            setResponses({ ...responses, [ticketId]: data });
        } catch (error) {
            console.error('Failed to fetch responses:', error);
            alert("Failed to fetch responses.");
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return; // Ignore empty search queries

        const res = await fetch(url + `/api/v1/tickets/${searchQuery}`);
        if (res.ok) {
            const data = await res.json();
            setSearchedTicket(data);
            await fetchResponses(data.id);
        } else {
            setSearchedTicket(null); // Clear the searched ticket if not found
            alert('Ticket not found');
        }
    };

    const handleReturnToAdminPage = () => {
        setSearchedTicket(null);
        setSearchQuery('');
    };


    const handleResponseSubmit = async (e: FormEvent<HTMLFormElement>, ticketId: number) => {
        e.preventDefault();
        const description = responseTexts[ticketId.toString()];
        try {
            await fetch(url + `/api/v1/tickets/${ticketId}/responses`, {
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

    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
    };

    const handleStatusUpdate = async (ticketId: number) => {
        try {
            const response = await fetch(url + `/api/v1/tickets/${ticketId}`, {
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

    const handleShowResponses = async (ticketId: number) => {
        if (showResponsesForTicketId === ticketId) {
            setShowResponsesForTicketId(null);
            setResponses(prev => ({ ...prev, [ticketId]: [] }));
        } else {
            const res = await fetch(url + `/api/v1/tickets/${ticketId}/responses`);
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
            <div className="back-to-home">
                <Link href="/"><button className="mt-4">Back to Home</button></Link>
            </div>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by Ticket ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>
            {searchedTicket ? (
                // Display the searched ticket details
                <div>
                    <div className="ticket-details">
                        <h2>{searchedTicket.name} ({searchedTicket.status})</h2>
                        <p>Ticket ID: {searchedTicket.id}</p>
                        <p>Email: {searchedTicket.email}</p>
                        <p>Description: {searchedTicket.description}</p>
                        <h3>Responses</h3>
                        <ul>
                            {responses[searchedTicket.id]?.map((response, index) => (
                                <li key={index}>{response.description} {new Date(response.created_at).toLocaleString()}</li>
                            ))}
                        </ul>
                        {/* Display responses or any additional information here */}
                    </div>
                    <button onClick={handleReturnToAdminPage}>Back to Admin Page</button>
                </div>
            ) : (
                // Display all tickets if no search has been performed or after clearing the search
                tickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-container">
                        <h2>{ticket.name} ({ticket.status})</h2>
                        <p>Ticket ID: {ticket.id}</p>
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
                        {showResponsesForTicketId === ticket.id && responses[ticket.id] && (
                            <ul>
                              {responses[ticket.id].map((response, index) => (
                                  <li key={index}>{response.description} {new Date(response.created_at).toLocaleString()}</li>
                              ))}
                            </ul>
                        )}
                    </div>
                ))
            )}
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
