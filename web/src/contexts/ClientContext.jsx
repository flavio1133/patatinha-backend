import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { clientsAPI } from '../services/api';

const ClientContext = createContext(null);

export function ClientProvider({ children }) {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [pets, setPets] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshClient = useCallback(async () => {
    setLoading(true);
    try {
      const [apptRes, petsRes] = await Promise.all([
        clientsAPI.getNextAppointment(),
        clientsAPI.getPets(),
      ]);
      setNextAppointment(apptRes.data);
      setPets(petsRes.data || []);
    } catch (err) {
      setNextAppointment(null);
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setClient(user || null);
    refreshClient();
  }, [refreshClient, user]);

  const value = {
    client,
    pets,
    nextAppointment,
    loading,
    refreshClient,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const ctx = useContext(ClientContext);
  return ctx || {
    client: null,
    pets: [],
    nextAppointment: null,
    loading: false,
    refreshClient: () => {},
  };
}
