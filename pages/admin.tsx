import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import adminstyle from '../styles/adminstyle.module.css'; 
import { useRouter } from 'next/router';


type Ticket = {
  id: number;
  name: string;
  status: string;
  email: string;
  description: string;
};
type ResponseTexts = {
  [key: string]: string;
};
export default function Admin() {

    const router = useRouter();

  // Redirect to login page if not authenticated
    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (!isAuthenticated) {
        router.push('/login');
        }
    }, [router]);
    const url = process.env.NEXT_PUBLIC_BACKEND_URL;

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

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        router.push('/login');
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
        <main className={adminstyle.adminContainer}>
            <h1>Admin Dashboard</h1>
            <div className={adminstyle.backToHome}>
                <Link href="/"><button className="mt-4">Back to Home</button></Link>
            </div>
            <button onClick={handleLogout}>Logout</button>
            <div className={adminstyle.searchContainer}>
                <input
                    type="text"
                    placeholder="Search by Ticket ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>
            {searchedTicket ? (
                <div>
                    <div className={adminstyle.ticketDetails}>
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
                    </div>
                    <button onClick={handleReturnToAdminPage}>Back to Admin Page</button>
                </div>
            ) : (
                tickets.map((ticket) => (
                    <div key={ticket.id} className={adminstyle.ticketContainer}>
                        <h2>{ticket.name} ({ticket.status})</h2>
                        <p>Ticket ID: {ticket.id}</p>
                        <p>Email: {ticket.email}</p>
                        {selectedTicketId === ticket.id && <p>Description: {ticket.description}</p>}
                        <button onClick={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}>
                            {selectedTicketId === ticket.id ? 'Hide Ticket Description' : 'Show Ticket Description'}
                        </button>
                        <div className={adminstyle.statusUpdate}>
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
                        <form onSubmit={(e) => handleResponseSubmit(e, ticket.id)} className={adminstyle.responseForm}>
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
        </main>
    );
    
}
