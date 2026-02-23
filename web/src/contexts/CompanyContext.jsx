import { createContext, useContext, useState, useEffect } from 'react';
import { companiesAPI } from '../services/api';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(null);
  const companyId = localStorage.getItem('client_company_id');

  useEffect(() => {
    if (!companyId) {
      setCompany(null);
      return;
    }
    companiesAPI.getPublic(companyId)
      .then((res) => setCompany(res.data))
      .catch(() => setCompany(null));
  }, [companyId]);

  const setCompanyId = (id) => {
    if (id) localStorage.setItem('client_company_id', id);
    else localStorage.removeItem('client_company_id');
    setCompany(null);
    if (id) {
      companiesAPI.getPublic(id).then((res) => setCompany(res.data)).catch(() => setCompany(null));
    }
  };

  return (
    <CompanyContext.Provider value={{ company, companyId, setCompanyId }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  return ctx || { company: null, companyId: null, setCompanyId: () => {} };
}
