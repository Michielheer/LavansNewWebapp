import { useState, useEffect } from 'react';
import apiService from '../services/api';

// Custom hook voor klanten data
export function useKlanten() {
  const [klanten, setKlanten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadKlanten();
  }, []);

  const loadKlanten = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getKlanten();
      setKlanten(data);
    } catch (err) {
      setError(err.message);
      console.error('Fout bij laden klanten:', err);
    } finally {
      setLoading(false);
    }
  };

  return { klanten, loading, error, refetch: loadKlanten };
}

// Custom hook voor klant data
export function useKlant(relatienummer) {
  const [klant, setKlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (relatienummer) {
      loadKlant();
    }
  }, [relatienummer]);

  const loadKlant = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getKlant(relatienummer);
      setKlant(data);
    } catch (err) {
      setError(err.message);
      console.error('Fout bij laden klant:', err);
    } finally {
      setLoading(false);
    }
  };

  return { klant, loading, error, refetch: loadKlant };
}

// Custom hook voor abonnementen
export function useAbonnementen(klantRelatienummer) {
  const [abonnementen, setAbonnementen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (klantRelatienummer) {
      loadAbonnementen();
    }
  }, [klantRelatienummer]);

  const loadAbonnementen = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAbonnementen(klantRelatienummer);
      setAbonnementen(data);
    } catch (err) {
      setError(err.message);
      console.error('Fout bij laden abonnementen:', err);
    } finally {
      setLoading(false);
    }
  };

  return { abonnementen, loading, error, refetch: loadAbonnementen };
}

// Custom hook voor contactpersonen
export function useContactpersonen(klantRelatienummer) {
  const [contactpersonen, setContactpersonen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (klantRelatienummer) {
      loadContactpersonen();
    }
  }, [klantRelatienummer]);

  const loadContactpersonen = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getContactpersonen(klantRelatienummer);
      setContactpersonen(data);
    } catch (err) {
      setError(err.message);
      console.error('Fout bij laden contactpersonen:', err);
    } finally {
      setLoading(false);
    }
  };

  return { contactpersonen, loading, error, refetch: loadContactpersonen };
}

// Custom hook voor inspecties
export function useInspecties(klantRelatienummer = null) {
  const [inspecties, setInspecties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInspecties();
  }, [klantRelatienummer]);

  const loadInspecties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getInspecties(klantRelatienummer);
      setInspecties(data);
    } catch (err) {
      setError(err.message);
      console.error('Fout bij laden inspecties:', err);
    } finally {
      setLoading(false);
    }
  };

  return { inspecties, loading, error, refetch: loadInspecties };
}

// Custom hook voor inspectie opslaan
export function useSaveInspectie() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const saveInspectie = async (inspectieData) => {
    try {
      setSaving(true);
      setError(null);
      const result = await apiService.saveInspectie(inspectieData);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Fout bij opslaan inspectie:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { saveInspectie, saving, error };
}

// Custom hook voor todo updates
export function useUpdateTodo() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateTodo = async (todoId, done, text = null) => {
    try {
      setUpdating(true);
      setError(null);
      const result = await apiService.updateTodo(todoId, done, text);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Fout bij updaten todo:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return { updateTodo, updating, error };
} 