import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export function RatingStars({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  interactive = false, 
  onRate,
  className 
}: RatingStarsProps) {
  const stars = [];
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.floor(rating);
    const isHalf = i === Math.ceil(rating) && rating % 1 !== 0;
    
    stars.push(
      <button
        key={i}
        data-testid={`star-${i}`}
        className={cn(
          sizeClasses[size],
          "transition-colors",
          interactive ? "cursor-pointer hover:text-kerala-accent" : "cursor-default",
          isFilled || isHalf ? "text-kerala-accent fill-current" : "text-outline"
        )}
        onClick={interactive ? () => onRate?.(i) : undefined}
        disabled={!interactive}
      >
        {isHalf ? <StarHalf /> : <Star />}
      </button>
    );
  }

  return (
    <div className={cn("flex items-center space-x-1", className)} data-testid="rating-stars">
      {stars}
    </div>
  );
}
