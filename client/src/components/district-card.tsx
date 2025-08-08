import { MapPin } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface DistrictCardProps {
  name: string;
  theaterCount: number;
  containerClass: string;
  textClass: string;
  backgroundImage: string;
}

export function DistrictCard({ name, theaterCount, containerClass, textClass, backgroundImage }: DistrictCardProps) {
  return (
    <Link href={`/district/${name}`} data-testid={`district-card-${name}`}>
      <div className="rounded-material-lg material-shadow hover:shadow-material-elevated transition-all cursor-pointer overflow-hidden relative h-32">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="relative h-full p-4 flex flex-col justify-end text-white">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-white drop-shadow-lg" />
            <h4 className="font-medium text-lg text-white drop-shadow-lg">{name}</h4>
            <p className="text-sm text-white/90 mt-1 drop-shadow-lg">{theaterCount} theaters</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
