import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Share, Heart, MapPin, Phone, Clock, Navigation, Users, Film, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { RatingStars } from "@/components/rating-stars";
import { MapComponent } from "@/components/map-component";
import { ScreenDetails } from "@/components/screen-details";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Theater, Review, Screen } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TheaterDetails() {
  const [match, params] = useRoute("/theater/:id");
  const theaterId = params?.id || "";
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [userName, setUserName] = useState("Anonymous User");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: theater, isLoading: theaterLoading } = useQuery<Theater>({
    queryKey: ['/api/theaters', theaterId],
    enabled: !!theaterId
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['/api/theaters', theaterId, 'reviews'],
    enabled: !!theaterId
  });

  const { data: screens = [] } = useQuery<Screen[]>({
    queryKey: ['/api/theaters', theaterId, 'screens'],
    enabled: !!theaterId
  });

  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string; userName: string }) => {
      return await apiRequest('POST', `/api/theaters/${theaterId}/reviews`, reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/theaters', theaterId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/theaters', theaterId] });
      setUserRating(0);
      setUserComment("");
      toast({
        title: "Review submitted successfully!",
        description: "Thank you for your feedback."
      });
    },
    onError: () => {
      toast({
        title: "Failed to submit review",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleSubmitReview = () => {
    if (userRating === 0) {
      toast({
        title: "Please select a rating",
        description: "Rating is required to submit a review.",
        variant: "destructive"
      });
      return;
    }

    reviewMutation.mutate({
      rating: userRating,
      comment: userComment,
      userName
    });
  };

  if (theaterLoading) {
    return <div className="p-6" data-testid="loading">Loading theater details...</div>;
  }

  if (!match || !theater) {
    return <div className="p-6" data-testid="error">Theater not found</div>;
  }

  return (
    <div className="min-h-screen">
      {/* App Bar */}
      <header className="bg-primary text-primary-foreground p-4 shadow-material" data-testid="theater-details-header">
        <div className="flex items-center space-x-4">
          <Link href={`/district/${theater.district}`}>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-medium flex-1" data-testid="theater-name">
            {theater.name}
          </h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-primary-foreground hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            data-testid="share-button"
          >
            <Share className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-primary-foreground hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            data-testid="favorite-button"
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          {/* Theater Header */}
          <div className="relative h-64 bg-gradient-to-br from-primary/20 via-secondary/10 to-tertiary/20 flex items-center justify-center" data-testid="theater-header">
            <div className="text-center">
              <Film className="h-16 w-16 text-primary/60 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-on-surface mb-2">{theater.name}</h1>
              <p className="text-on-surface-variant">{theater.district}, Kerala</p>
            </div>
          </div>

          {/* Theater Info */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-medium text-on-surface mb-2" data-testid="theater-title">
                  {theater.name}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-on-surface-variant">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span data-testid="theater-district">{theater.district}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Film className="h-5 w-5 text-primary" />
                    <span data-testid="theater-screens">{theater.totalScreens} screens</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span data-testid="theater-capacity">{theater.totalCapacity} seats</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-2xl">⭐</span>
                  <span className="text-2xl font-medium text-on-surface" data-testid="theater-rating">
                    {theater.averageRating}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant" data-testid="theater-review-count">
                  {theater.totalReviews} reviews
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-on-surface">Theater Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {theater.contact && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-on-surface-variant" data-testid="theater-contact">
                      {theater.contact}
                    </span>
                  </div>
                )}
                {theater.website && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <a 
                      href={theater.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      data-testid="theater-website"
                    >
                      Official Website
                    </a>
                  </div>
                )}
                {theater.bookingUrl && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <a 
                      href={theater.bookingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      data-testid="theater-booking"
                    >
                      Book Tickets Online
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Screen Details */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-on-surface">Screen Details & Pricing</h3>
              <ScreenDetails screens={screens} />
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-on-surface">About</h3>
              <p className="text-on-surface-variant leading-relaxed" data-testid="theater-description">
                {theater.description}
              </p>
            </div>

            {/* Rating Section */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 text-on-surface">Rate this Theater</h3>
                <div className="mb-4">
                  <RatingStars 
                    rating={userRating}
                    interactive={true}
                    onRate={setUserRating}
                    size="lg"
                    data-testid="user-rating"
                  />
                </div>
                <Textarea 
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="mb-3" 
                  rows={3} 
                  placeholder="Share your experience..."
                  data-testid="review-textarea"
                />
                <Button 
                  onClick={handleSubmitReview}
                  disabled={reviewMutation.isPending}
                  className="shadow-material hover:shadow-material-elevated transition-all"
                  data-testid="submit-review-button"
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </CardContent>
            </Card>

            {/* Reviews */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-on-surface">Recent Reviews</h3>
              <div className="space-y-4" data-testid="reviews-list">
                {reviews.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-on-surface-variant">No reviews yet. Be the first to review!</p>
                    </CardContent>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                          <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-medium">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-on-surface" data-testid={`review-user-${review.id}`}>
                                {review.userName}
                              </h4>
                              <RatingStars rating={review.rating} size="sm" />
                            </div>
                            <p className="text-sm text-on-surface-variant mb-2">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                            </p>
                            {review.comment && (
                              <p className="text-on-surface-variant" data-testid={`review-comment-${review.id}`}>
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel - Location & Contact */}
        <div className="lg:w-96 bg-surface-variant p-6" data-testid="side-panel">
          {/* Location Map */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4 text-on-surface">Location</h3>
            <div className="bg-surface rounded-material-lg p-4 shadow-material mb-4">
              <MapComponent 
                theaters={[theater]}
                center={[theater.latitude, theater.longitude]}
                zoom={15}
                height="h-48"
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-outline mt-0.5" />
                <span className="text-on-surface-variant" data-testid="theater-full-address">
                  {theater.district}, Kerala
                </span>
              </div>
              {theater.contact && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-outline" />
                  <span className="text-on-surface-variant" data-testid="theater-phone">
                    {theater.contact}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-outline" />
                <span className="text-on-surface-variant" data-testid="theater-hours">
                  9:00 AM - 12:00 AM (Typical)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full shadow-material hover:shadow-material-elevated transition-all"
              onClick={() => window.open(`https://maps.google.com/?q=${theater.latitude},${theater.longitude}`, '_blank')}
              data-testid="directions-button"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            {theater.contact && (
              <Button 
                variant="secondary"
                className="w-full shadow-material hover:shadow-material-elevated transition-all"
                onClick={() => window.open(`tel:${theater.contact}`, '_self')}
                data-testid="call-button"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Theater
              </Button>
            )}
            {theater.bookingUrl && (
              <Button 
                variant="outline"
                className="w-full shadow-material hover:shadow-material-elevated transition-all"
                onClick={() => window.open(theater.bookingUrl!, '_blank')}
                data-testid="book-tickets-button"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Book Tickets
              </Button>
            )}
            <Button 
              variant="outline"
              className="w-full shadow-material hover:shadow-material-elevated transition-all"
              data-testid="share-theater-button"
            >
              <Share className="h-4 w-4 mr-2" />
              Share Theater
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
