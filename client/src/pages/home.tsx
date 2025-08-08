import { useQuery } from "@tanstack/react-query";
import { Search, Film, Music2, X } from "lucide-react";
import { DistrictCard } from "@/components/district-card";
import { TheaterCard } from "@/components/theater-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KERALA_DISTRICTS } from "@/lib/constants";
import { Theater } from "@shared/schema";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: theaters = [] } = useQuery<Theater[]>({
    queryKey: ['/api/theaters']
  });

  const popularTheaters = theaters
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 2);

  // Filter theaters based on search query (theater names only)
  const searchResults = searchQuery.trim()
    ? theaters.filter(theater => 
        theater.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasSearchResults = searchQuery.trim().length > 0;
  const showNoResults = hasSearchResults && searchResults.length === 0;
  
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen">
      {/* App Bar */}
      <header className="bg-primary text-primary-foreground p-4 shadow-material" data-testid="app-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Film className="h-6 w-6" />
            <h1 className="text-xl font-medium" data-testid="app-title">Kerala Theaters</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-primary-foreground hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            data-testid="search-button"
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary-container to-surface p-6" data-testid="hero-section">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-on-primary-container mb-2" data-testid="hero-title">
            Discover Theaters
          </h2>
          <p className="text-lg text-on-surface-variant" data-testid="hero-subtitle">
            Explore cinema halls across Kerala
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-surface-variant rounded-material-xl p-4 mb-6 shadow-material flex items-center space-x-3" data-testid="search-bar">
          <Search className="h-5 w-5 text-outline" />
          <Input 
            type="text" 
            placeholder="Search theaters..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 border-none outline-none text-on-surface-variant placeholder-outline"
            data-testid="search-input"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearSearch}
              data-testid="clear-search-button"
            >
              <X className="h-5 w-5 text-outline" />
            </Button>
          )}
          <Button variant="ghost" size="icon" data-testid="filter-button">
            <Music2 className="h-5 w-5 text-outline" />
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {hasSearchResults && (
        <div className="p-6" data-testid="search-results-section">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-medium text-on-surface" data-testid="search-results-title">
              Search Results
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearSearch}
              data-testid="clear-search-results"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
          
          {showNoResults ? (
            <div className="text-center py-8" data-testid="no-search-results">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-on-surface-variant text-lg mb-2">No theaters found</p>
              <p className="text-on-surface-variant text-sm">Try searching with a different theater name</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="search-results-list">
              {searchResults.map((theater) => (
                <TheaterCard key={theater.id} theater={theater} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* District Selection - Only show when not searching */}
      {!hasSearchResults && (
        <div className="p-6" data-testid="districts-section">
          <h3 className="text-2xl font-medium mb-6 text-on-surface" data-testid="districts-title">
            Select District
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="districts-grid">
            {KERALA_DISTRICTS.map((district) => (
              <DistrictCard
                key={district.name}
                name={district.name}
                theaterCount={district.theaterCount}
                containerClass={district.containerClass}
                textClass={district.textClass}
                backgroundImage={district.backgroundImage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Popular Theaters Section - Only show when not searching */}
      {!hasSearchResults && (
        <div className="bg-surface-variant p-6 mt-8" data-testid="popular-theaters-section">
          <h3 className="text-2xl font-medium mb-6 text-on-surface" data-testid="popular-theaters-title">
            Popular Theaters
          </h3>
          <div className="flex overflow-x-auto space-x-4 pb-4" data-testid="popular-theaters-list">
            {popularTheaters.map((theater) => (
              <div key={theater.id} className="bg-surface rounded-material-lg shadow-material min-w-80 p-4" data-testid={`popular-theater-${theater.id}`}>
                <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-material flex items-center justify-center mb-3">
                  <Film className="h-12 w-12 text-primary/60" />
                </div>
                <h4 className="font-medium text-lg text-on-surface mb-1" data-testid={`popular-theater-name-${theater.id}`}>
                  {theater.name}
                </h4>
                <p className="text-on-surface-variant text-sm mb-2" data-testid={`popular-theater-location-${theater.id}`}>
                  {theater.district} • {theater.totalScreens} screens • {theater.totalCapacity} seats
                </p>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.floor(theater.averageRating || 0) ? 'text-kerala-accent' : 'text-outline'}`}>
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-on-surface-variant ml-1" data-testid={`popular-theater-rating-${theater.id}`}>
                    {theater.averageRating || 0} ({theater.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <Button 
        className="fixed bottom-6 right-6 bg-kerala-accent text-white h-14 w-14 rounded-full shadow-material-high hover:shadow-material-elevated transition-all"
        data-testid="fab-button"
      >
        <span className="text-2xl">+</span>
      </Button>
    </div>
  );
}