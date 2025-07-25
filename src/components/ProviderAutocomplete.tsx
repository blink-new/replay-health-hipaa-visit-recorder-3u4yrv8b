import React, { useState, useEffect } from 'react'
import { Search, User, MapPin, Phone } from 'lucide-react'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { blink } from '../blink/client'

interface Provider {
  id: string
  name: string
  specialty: string
  subspecialty?: string
  credentials: string
  organization: string
  city: string
  state: string
  phone: string
}

interface ProviderAutocompleteProps {
  onSelect: (provider: Provider) => void
  placeholder?: string
  className?: string
}

export function ProviderAutocomplete({ onSelect, placeholder = "Search for healthcare providers...", className = "" }: ProviderAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const searchProviders = async () => {
      if (query.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      try {
        const results = await blink.db.healthcare_providers_db.list({
          where: {
            OR: [
              { name: { contains: query } },
              { specialty: { contains: query } },
              { subspecialty: { contains: query } },
              { organization: { contains: query } },
              { search_terms: { contains: query.toLowerCase() } }
            ]
          },
          limit: 8,
          orderBy: { name: 'asc' }
        })

        setSuggestions(results)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error searching providers:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProviders, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSelect = (provider: Provider) => {
    onSelect(provider)
    setQuery('')
    setShowSuggestions(false)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-4"
        />
      </div>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching providers...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="divide-y">
                {suggestions.map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => handleSelect(provider)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-primary" />
                          <h4 className="font-medium text-gray-900">{provider.name}</h4>
                          <span className="text-sm text-gray-500">{provider.credentials}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {provider.specialty}
                          </Badge>
                          {provider.subspecialty && (
                            <Badge variant="outline" className="text-xs">
                              {provider.subspecialty}
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{provider.organization}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{provider.city}, {provider.state}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{provider.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                No providers found for "{query}"
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}