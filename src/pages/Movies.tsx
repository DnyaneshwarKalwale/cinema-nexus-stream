import React, { useEffect, useState } from 'react';
import { Search, X, Star, Calendar, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MovieModal from '@/components/MovieModal';
import MovieCarousel from '@/components/MovieCarousel';
import AdBanner from '@/components/AdBanner';
import api, { Movie } from '@/services/api';
import { Loader2 } from 'lucide-react';
import useAdminSettings from '@/hooks/useAdminSettings';

const Movies = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { settings: adminSettings } = useAdminSettings();
  const [tooltipItem, setTooltipItem] = useState<Movie | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, item: Movie) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    });
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    const timeout = setTimeout(() => {
      setTooltipItem(item);
    }, 800);
    setTooltipTimeout(timeout);
  };
  const handleTooltipMouseLeave = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    setTooltipItem(null);
  };

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trending, popular, topRated] = await Promise.all([
        api.getTrendingMovies(),
        api.getPopularMovies(),
        api.getTopRatedMovies()
      ]);

      setTrendingMovies(trending.data?.results || []);
      setPopularMovies(popular.data?.results || []);
      setTopRatedMovies(topRated.data?.results || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again later.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.search(query);
      setSearchResults(response.data?.results || []);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
            Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 sm:pt-20 md:pt-20" style={{ position: 'relative' }}>
      {/* Mobile Header - Netflix Style */}
      <div className="lg:hidden">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-2">Movies</h1>
          <p className="text-gray-400 text-sm">Discover amazing movies from around the world</p>
        </div>

        {/* Mobile Search */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10 bg-gray-800/30 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
            />
            {searchQuery && (
          <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Results */}
        {searchQuery && (
          <div className="px-4 mb-4">
            <div className="bg-black rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">
                  Search Results for "{searchQuery}"
                </h3>
                {isSearching && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              </div>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.slice(0, 6).map((movie) => (
                    <div
                      key={movie.id}
                      className="group cursor-pointer"
                      onClick={() => handleMovieClick(movie)}
                >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x450/666666/ffffff?text=No+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
                          {movie.vote_average?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-white truncate">
                          {movie.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isSearching ? (
                <p className="text-gray-400 text-sm">No movies found for "{searchQuery}"</p>
              ) : null}
            </div>
          </div>
        )}
          </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Movies</h1>
            <p className="text-xl text-gray-400">Discover amazing movies from around the world</p>
            </div>

          {/* Desktop Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-lg"
              />
              {searchQuery && (
                  <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                  <X className="w-5 h-5" />
                  </button>
              )}
              </div>
            </div>
        </div>
      </div>

      {/* Mobile Content - Netflix Style */}
      <div className="lg:hidden">
        {/* Top Ad */}
        {adminSettings?.ads?.moviesPageAd?.enabled && (
          <div className="px-4 mb-6">
            <AdBanner 
              adKey="moviesPageAd"
              imageUrl={adminSettings.ads.moviesPageAd.imageUrl}
              clickUrl={adminSettings.ads.moviesPageAd.clickUrl}
              enabled={adminSettings.ads.moviesPageAd.enabled}
            />
          </div>
        )}

        {/* Movies Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh] px-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
                <section>
              <MovieCarousel 
                title="Trending Movies"
                items={trendingMovies}
                onItemClick={handleMovieClick}
              />
            </section>

                <section>
              <MovieCarousel 
                title="Popular Movies"
                items={popularMovies}
                onItemClick={handleMovieClick}
              />
            </section>

                <section>
              <MovieCarousel 
                title="Top Rated Movies"
                items={topRatedMovies}
                onItemClick={handleMovieClick}
              />
            </section>

            {/* Bottom Ad */}
            {adminSettings?.ads?.moviesPageBottomAd?.enabled && (
              <div className="px-4">
                <AdBanner 
                  adKey="moviesPageBottomAd"
                  imageUrl={adminSettings.ads.moviesPageBottomAd.imageUrl}
                  clickUrl={adminSettings.ads.moviesPageBottomAd.clickUrl}
                  enabled={adminSettings.ads.moviesPageBottomAd.enabled}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Content */}
      <div className="hidden lg:block">
        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8 py-8">
          {/* Top Ad */}
          {adminSettings?.ads?.moviesPageAd?.enabled && (
            <div className="mb-8">
              <AdBanner 
                adKey="moviesPageAd"
                imageUrl={adminSettings.ads.moviesPageAd.imageUrl}
                clickUrl={adminSettings.ads.moviesPageAd.clickUrl}
                enabled={adminSettings.ads.moviesPageAd.enabled}
              />
            </div>
          )}

          {/* Desktop Search Results */}
          {searchQuery && (
            <div className="mb-8">
              <div className="bg-black rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-xl font-semibold">
                    Search Results for "{searchQuery}"
                  </h3>
                  {isSearching && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                </div>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {searchResults.map((movie) => (
                      <div
                        key={movie.id}
                        className="group cursor-pointer relative"
                        onClick={() => handleMovieClick(movie)}
                        onMouseEnter={(e) => handleMouseEnter(e, movie)}
                        onMouseLeave={handleTooltipMouseLeave}
                        onMouseOut={handleTooltipMouseLeave}
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                          <img
                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWYyOTM3Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                            alt={movie.title || 'Unknown Title'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWYyOTM3Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                            }}
                          />
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="crystal-play-button">
                              {/* Triangle is created via CSS ::before pseudo-element */}
                            </div>
                          </div>
                          {/* Rating Badge */}
                          <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
                            {movie.vote_average?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-medium text-white truncate">
                            {movie.title || 'Unknown Title'}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {(() => {
                              const date = movie.release_date;
                              if (!date || date === 'Invalid Date' || date === 'null' || date === 'undefined') {
                                return 'Unknown';
                              }
                              const dateObj = new Date(date);
                              return isNaN(dateObj.getTime()) ? 'Unknown' : dateObj.getFullYear();
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isSearching ? (
                  <p className="text-gray-400">No movies found for "{searchQuery}"</p>
                ) : null}
              </div>
            </div>
          )}

          {/* Movies Content */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                    <MovieCarousel 
                      title="Trending Movies"
                      items={trendingMovies}
                      onItemClick={handleMovieClick}
                    />
                  </section>

              <section>
                    <MovieCarousel 
                      title="Popular Movies"
                      items={popularMovies}
                      onItemClick={handleMovieClick}
                    />
                  </section>

              <section>
                    <MovieCarousel 
                      title="Top Rated Movies"
                      items={topRatedMovies}
                      onItemClick={handleMovieClick}
              />
            </section>

        {/* Bottom Ad */}
          {adminSettings?.ads?.moviesPageBottomAd?.enabled && (
                <div className="mb-8">
          <AdBanner 
            adKey="moviesPageBottomAd" 
                imageUrl={adminSettings.ads.moviesPageBottomAd.imageUrl}
                clickUrl={adminSettings.ads.moviesPageBottomAd.clickUrl}
                enabled={adminSettings.ads.moviesPageBottomAd.enabled}
              />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
      {/* Tooltip */}
      {tooltipItem && tooltipPosition && (
        <div
          className="fixed z-50 bg-black/95 text-white rounded-lg shadow-lg p-4 min-w-[220px] max-w-xs pointer-events-none"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <h4 className="font-semibold text-base mb-1">
            {tooltipItem.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
            <span>
              {(() => {
                const date = tooltipItem.release_date;
                if (!date || date === 'Invalid Date' || date === 'null' || date === 'undefined') {
                  return 'Unknown';
                }
                const dateObj = new Date(date);
                return isNaN(dateObj.getTime()) ? 'Unknown' : dateObj.getFullYear();
              })()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              {tooltipItem.vote_average?.toFixed(1) || 'N/A'}
            </span>
            <span>•</span>
            <span className="capitalize">Movie</span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-4">
            {tooltipItem.overview || 'No description available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Movies; 