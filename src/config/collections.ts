import { CollectionConfig } from '../types'

export const COLLECTION_CONFIGS: Record<string, CollectionConfig> = {
  bhajana: {
    id: 'bhajana',
    type: 'bhajana',
    name: 'Bhajana PatraPaha',
    nameDevanagari: 'भजन पत्रपहा',
    nameTamil: 'பஜன பத்ரபாஹா',
    icon: '🎵',
    color: '#FF9933',
    accentColor: '#E68A2E',
    features: [
      'deity-organization',
      'seasonal-ordering',
      'ragam-filter',
      'talam-filter',
      'youtube-links',
      'favorites'
    ],
    organizationTypes: ['deity', 'ragam'],
    metadataFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'ragam', label: 'Ragam', type: 'text' },
      { key: 'talam', label: 'Talam', type: 'text' },
      { key: 'deity', label: 'Deity', type: 'array' },
      { key: 'youtube', label: 'YouTube Link', type: 'url' },
      { key: 'spotify', label: 'Spotify Link', type: 'url' },
      { key: 'tags', label: 'Tags', type: 'array' },
      { key: 'source', label: 'Source', type: 'text' },
    ]
  },
  
  anusthanam: {
    id: 'anusthanam',
    type: 'anusthanam',
    name: 'Anusthanam PatraPaha',
    nameDevanagari: 'अनुष्ठान पत्रपहा',
    nameTamil: 'அனுஷ்டான பத்ரபாஹா',
    icon: '🙏',
    color: '#DC2626',
    accentColor: '#B91C1C',
    features: [
      'step-sequence',
      'materials-checklist',
      'folder-organization',
      'duration-tracking',
      'favorites'
    ],
    organizationTypes: ['folder'],
    metadataFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'materials', label: 'Materials Needed', type: 'array' },
      { key: 'steps', label: 'Procedure Steps', type: 'array' },
      { key: 'tags', label: 'Tags', type: 'array' },
    ]
  }
}

// Helper function to get collection config
export function getCollectionConfig(collectionId: string): CollectionConfig | undefined {
  const type = collectionId.split('-')[0] as keyof typeof COLLECTION_CONFIGS
  return COLLECTION_CONFIGS[type]
}

// Helper function to get collection type from ID
export function getCollectionType(collectionId: string): string {
  return collectionId.split('-')[0]
}
