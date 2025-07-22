import { useState } from 'react';
import { apiRequest } from '@/services/apiClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TherapistSearchPage = () => {
  const [specialization, setSpecialization] = useState('');
  const [language, setLanguage] = useState('');
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/therapists/search', 'POST', { specialization, language });
      setTherapists(data);
    } catch (error) {
      console.error('Error searching therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search for Therapists</h1>
      <div className="flex gap-4">
        <Input
          placeholder="Specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        />
        <Input
          placeholder="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map((therapist) => (
          <Card key={therapist.id}>
            <CardHeader>
              <CardTitle>{therapist.first_name} {therapist.last_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{therapist.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
