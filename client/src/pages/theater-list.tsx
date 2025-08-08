import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { TheaterCard } from "@/components/theater-card";
import { MapComponent } from "@/components/map-component";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THEATER_FEATURES } from "@/lib/constants";
import { Theater } from "@shared/schema";
import { useState } from "react";

export default function TheaterList() {
  const [match, params] = useRoute("/district/:district");
  const district = params?.district || "";
  const [selectedFilter, setSelectedFilter] = useState("All theaters");

  const { data: theaters = [], isLoading } = useQuery<Theater[]>({
    queryKey: ['/api/theaters/district', district],
    enabled: !!district
  });

  const filteredTheaters = theaters.filter(theater => {
    if (selectedFilter === "All theaters") return true;
    
    // Filter by screen types and features based on KML data
    const hasFeature = theater.totalScreens > 1 && selectedFilter === "Multiplex" ||
                      theater.totalScreens === 1 && selectedFilter === "Single Screen" ||
                      (theater.contact && selectedFilter === "Digital") ||
                      (theater.bookingUrl && selectedFilter === "Premium");
    
    return hasFeature;
  });

  if (isLoading) {
    return <div className="p-6" data-testid="loading">Loading theaters...</div>;
  }

  if (!match) {
    return <div className="p-6" data-testid="error">District not found</div>;
  }

  return (
    <div className="min-h-screen">
      {/* App Bar with Back Navigation */}
      <header className="bg-primary text-primary-foreground p-4 shadow-material" data-testid="theater-list-header">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-medium" data-testid="district-title">
            {district} Theaters
          </h1>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Theater List */}
        <div className="flex-1 p-4">
          {/* Filter Chips */}
          <div className="flex overflow-x-auto space-x-2 mb-6 pb-2" data-testid="filter-chips">
            {THEATER_FEATURES.map((feature) => (
              <Badge
                key={feature}
                variant={selectedFilter === feature ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedFilter(feature)}
                data-testid={`filter-${feature}`}
              >
                {feature}
              </Badge>
            ))}
          </div>

          {/* Theater Cards */}
          <div className="space-y-0" data-testid="theater-list">
            {filteredTheaters.length === 0 ? (
              <div className="text-center py-8" data-testid="no-theaters">
                <p className="text-on-surface-variant">No theaters found for the selected filter.</p>
              </div>
            ) : (
              filteredTheaters.map((theater) => (
                <TheaterCard key={theater.id} theater={theater} />
              ))
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="lg:w-96 bg-surface-variant p-4" data-testid="map-section">
          <h3 className="text-lg font-medium mb-4 text-on-surface">Theater Locations</h3>
          <div className="bg-surface rounded-material-lg p-4 shadow-material">
            {theaters.length > 0 ? (
              <MapComponent 
                theaters={theaters}
                center={theaters.length > 0 ? [theaters[0].latitude, theaters[0].longitude] : undefined}
                zoom={10}
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-material h-96 flex items-center justify-center" data-testid="map-placeholder">
                <div className="text-center text-on-surface-variant">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-lg font-medium mb-2">Interactive Map</p>
                  <p className="text-sm">Theater locations in {district}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
