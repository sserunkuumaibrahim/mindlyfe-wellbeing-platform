import { Database } from '../integrations/postgresql/types'

// Define Specialization interface since there's no specializations table
interface Specialization {
  id: string;
  name: string;
  description?: string;
}

type TherapistProfile = Database['public']['Tables']['therapist_profiles']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

// Extended TherapistProfile with additional properties for search results
interface ExtendedTherapistProfile extends Omit<TherapistProfile, 'specializations'> {
  profile?: Profile & {
    first_name?: string;
    last_name?: string;
  };
  distance?: number;
  matchScore?: number;
  averageRating?: number;
  approach?: string;
  specializations: string[];
  therapistProfile?: {
    session_rate?: number;
    years_of_experience?: number;
  };
}

// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate relevance score based on search query and therapist data
export function calculateRelevanceScore(
  query: string,
  therapist: ExtendedTherapistProfile,
  specializations: Specialization[]
): number {
  if (!query) return 0

  const searchTerms = query.toLowerCase().split(' ')
  let score = 0

  // Check name match
  const fullName = `${therapist.profile?.first_name || ''} ${therapist.profile?.last_name || ''}`.toLowerCase()
  searchTerms.forEach(term => {
    if (fullName.includes(term)) score += 10
  })

  // Check bio match
  if (therapist.bio) {
    const bio = therapist.bio.toLowerCase()
    searchTerms.forEach(term => {
      if (bio.includes(term)) score += 5
    })
  }

  // Check specialization match
  specializations.forEach(spec => {
    const specName = spec.name.toLowerCase()
    const specDesc = spec.description?.toLowerCase() || ''
    searchTerms.forEach(term => {
      if (specName.includes(term)) score += 15
      if (specDesc.includes(term)) score += 8
    })
  })

  // Check approach match
  if (therapist.approach) {
    const approach = therapist.approach.toLowerCase()
    searchTerms.forEach(term => {
      if (approach.includes(term)) score += 7
    })
  }

  return score
}

// Sort results based on different criteria
export function sortSearchResults(
  results: ExtendedTherapistProfile[],
  sortBy: string,
  userLocation?: { latitude: number; longitude: number }
): ExtendedTherapistProfile[] {
  switch (sortBy) {
    case 'rating':
      return results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    case 'price_low':
      return results.sort((a, b) => (a.therapistProfile.session_rate || 0) - (b.therapistProfile.session_rate || 0))
    case 'price_high':
      return results.sort((a, b) => (b.therapistProfile.session_rate || 0) - (a.therapistProfile.session_rate || 0))
    case 'experience':
      return results.sort((a, b) => (b.therapistProfile.years_of_experience || 0) - (a.therapistProfile.years_of_experience || 0))
    case 'distance':
      if (userLocation) {
        return results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
      }
      return results
    case 'relevance':
    default:
      return results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }
}

// Generate search suggestions based on query
export function generateSearchSuggestions(query: string, specializations: Specialization[]): string[] {
  if (!query || query.length < 2) return []
  
  const suggestions: string[] = []
  const queryLower = query.toLowerCase()
  
  // Add specialization suggestions
  specializations.forEach(spec => {
    if (spec.name.toLowerCase().includes(queryLower)) {
      suggestions.push(spec.name)
    }
  })
  
  // Add common therapy-related suggestions
  const commonTerms = [
    'anxiety therapy',
    'depression counseling',
    'couples therapy',
    'family therapy',
    'cognitive behavioral therapy',
    'trauma therapy',
    'addiction counseling',
    'grief counseling'
  ]
  
  commonTerms.forEach(term => {
    if (term.includes(queryLower)) {
      suggestions.push(term)
    }
  })
  
  return suggestions.slice(0, 5) // Limit to 5 suggestions
}