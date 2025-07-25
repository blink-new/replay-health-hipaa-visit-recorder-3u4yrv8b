import React, { useState, useEffect } from 'react'
import { Search, Pill, Info } from 'lucide-react'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { blink } from '../blink/client'

interface Medication {
  id: string
  generic_name: string
  brand_names: string
  drug_class: string
  indication: string
  common_dosages: string
  route: string
}

interface MedicationAutocompleteProps {
  onSelect: (medication: Medication) => void
  placeholder?: string
  className?: string
}

export function MedicationAutocomplete({ onSelect, placeholder = "Search for medications...", className = "" }: MedicationAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const searchMedications = async () => {
      if (query.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      try {
        const results = await blink.db.medications_db.list({
          where: {
            OR: [
              { generic_name: { contains: query } },
              { brand_names: { contains: query } },
              { drug_class: { contains: query } },
              { indication: { contains: query } },
              { search_terms: { contains: query.toLowerCase() } }
            ]
          },
          limit: 8,
          orderBy: { generic_name: 'asc' }
        })

        setSuggestions(results)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error searching medications:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchMedications, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSelect = (medication: Medication) => {
    onSelect(medication)
    setQuery('')
    setShowSuggestions(false)
  }

  const formatBrandNames = (brandNames: string) => {
    if (!brandNames) return []
    return brandNames.split(', ').slice(0, 3) // Show max 3 brand names
  }

  const formatDosages = (dosages: string) => {
    if (!dosages) return []
    return dosages.split(', ').slice(0, 4) // Show max 4 dosages
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
                Searching medications...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="divide-y">
                {suggestions.map((medication) => (
                  <div
                    key={medication.id}
                    onClick={() => handleSelect(medication)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="h-4 w-4 text-primary" />
                          <h4 className="font-medium text-gray-900">{medication.generic_name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {medication.drug_class}
                          </Badge>
                        </div>
                        
                        {medication.brand_names && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600 font-medium">Brand names: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formatBrandNames(medication.brand_names).map((brand, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {brand}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-start gap-1">
                            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span><strong>Used for:</strong> {medication.indication}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Route:</span>
                            <Badge variant="outline" className="text-xs">
                              {medication.route}
                            </Badge>
                          </div>

                          {medication.common_dosages && (
                            <div>
                              <span className="font-medium">Common dosages: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {formatDosages(medication.common_dosages).map((dosage, index) => (
                                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {dosage}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                No medications found for "{query}"
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}