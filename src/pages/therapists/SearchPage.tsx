import { useState, useEffect } from 'react';
import { apiRequest } from '@/services/apiClient';

const TherapistSearch = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const data = await apiRequest<any[]>('/api/therapists/search');
        setTherapists(data);
      } catch (error) {
        setError('Error fetching therapists');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  return (
    <div>
      <h1>Therapist Search</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ul>
        {therapists.map((therapist: any) => (
          <li key={therapist.user_id}>
            {therapist.first_name} {therapist.last_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TherapistSearch;
