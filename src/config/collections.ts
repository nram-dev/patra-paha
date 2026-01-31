import { CollectionConfig } from '../types'

// Color palette for custom collections
export const CUSTOM_COLORS = [
  { name: 'Indigo', color: '#6366F1', accent: '#4F46E5' },
  { name: 'Green', color: '#10B981', accent: '#059669' },
  { name: 'Blue', color: '#3B82F6', accent: '#2563EB' },
  { name: 'Purple', color: '#8B5CF6', accent: '#7C3AED' },
  { name: 'Pink', color: '#EC4899', accent: '#DB2777' },
  { name: 'Teal', color: '#14B8A6', accent: '#0D9488' },
]

// Icon options for custom collections
export const CUSTOM_ICONS = ['📁', '📚', '📖', '🎵', '🙏', '📝', '🎨', '⭐', '💼']

// Default configuration for custom collections
export const DEFAULT_CUSTOM_CONFIG: CollectionConfig = {
  id: 'custom',
  type: 'custom',
  name: 'Custom Collection',
  icon: '📁',
  color: CUSTOM_COLORS[0].color,
  accentColor: CUSTOM_COLORS[0].accent,
  features: ['folder-organization', 'favorites'],
  organizationTypes: ['folder'],
  metadataFields: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'tags', label: 'Tags', type: 'array' },
  ]
}

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
export function getCollectionConfig(collectionId: string): CollectionConfig {
  const type = collectionId.split('-')[0] as keyof typeof COLLECTION_CONFIGS
  return COLLECTION_CONFIGS[type] || DEFAULT_CUSTOM_CONFIG
}

// Helper function to get collection type from ID
export function getCollectionType(collectionId: string): string {
  return collectionId.split('-')[0]
}
