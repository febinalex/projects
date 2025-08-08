import { MapPin, Film, Heart, Users, Phone, IndianRupee } from "lucide-react";
import { Link } from "wouter";
import { RatingStars } from "./rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Theater } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TheaterCardProps {
  theater: Theater;
  className?: string;
}

export function TheaterCard({ theater, className }: TheaterCardProps) {
  return (
    <div className={cn(
      "bg-surface rounded-material-lg shadow-material hover:shadow-material-elevated transition-all mb-4",
      className
    )}>
      <Link href={`/theater/${theater.id}`} data-testid={`theater-card-${theater.id}`}>
        <div className="cursor-pointer p-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-48 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-material flex items-center justify-center shrink-0">
              <Film className="h-12 w-12 text-primary/60" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-medium text-on-surface truncate pr-2" data-testid={`theater-name-${theater.id}`}>
                  {theater.name}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-outline hover:text-kerala-accent transition-colors shrink-0"
                  data-testid={`theater-favorite-${theater.id}`}
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-1 mb-2">
                <RatingStars rating={theater.averageRating || 0} size="sm" />
                <span className="text-sm text-on-surface-variant ml-1" data-testid={`theater-rating-${theater.id}`}>
                  {theater.averageRating?.toFixed(1) || '0.0'} ({theater.totalReviews || 0} reviews)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span data-testid={`theater-district-${theater.id}`}>{theater.district}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Film className="h-4 w-4" />
                  <span data-testid={`theater-screens-${theater.id}`}>{theater.totalScreens} screens</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span data-testid={`theater-capacity-${theater.id}`}>{theater.totalCapacity} seats</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {theater.contact && (
                    <Badge variant="outline" className="text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Contact
                    </Badge>
                  )}
                  {theater.bookingUrl && (
                    <Badge variant="secondary" className="text-xs">
                      Online Booking
                    </Badge>
                  )}
                  {theater.website && (
                    <Badge variant="outline" className="text-xs">
                      Website
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-kerala-accent font-medium shrink-0">
                  View Details →
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
