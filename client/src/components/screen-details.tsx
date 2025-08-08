import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Screen } from "@shared/schema";
import { Users, Monitor, IndianRupee } from "lucide-react";

interface ScreenDetailsProps {
  screens: Screen[];
  className?: string;
}

export function ScreenDetails({ screens, className }: ScreenDetailsProps) {
  if (screens.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-center text-on-surface-variant">No screen information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} data-testid="screen-details">
      {screens.map((screen) => (
        <Card key={screen.id} className="shadow-material hover:shadow-material-elevated transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-primary" />
                <span data-testid={`screen-title-${screen.screenNumber}`}>
                  Screen {screen.screenNumber}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-on-surface-variant">
                <Users className="h-4 w-4" />
                <span data-testid={`screen-capacity-${screen.screenNumber}`}>
                  {screen.capacity} seats
                </span>
              </div>
            </CardTitle>
            {screen.screenType && (
              <div>
                <Badge variant="outline" data-testid={`screen-type-${screen.screenNumber}`}>
                  {screen.screenType}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-on-surface">Seat Classes & Pricing</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {screen.seatClasses.map((seatClass, index) => (
                  <div
                    key={index}
                    className="bg-surface-variant rounded-material p-3 hover:bg-primary/10 transition-colors"
                    data-testid={`seat-class-${screen.screenNumber}-${index}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm text-on-surface">
                        {seatClass.className}
                      </h5>
                      <div className="flex items-center space-x-1 text-kerala-accent font-bold">
                        <IndianRupee className="h-3 w-3" />
                        <span data-testid={`seat-price-${screen.screenNumber}-${index}`}>
                          {seatClass.price}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-on-surface-variant">
                      <Users className="h-3 w-3" />
                      <span data-testid={`seat-count-${screen.screenNumber}-${index}`}>
                        {seatClass.seatCount} seats
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}