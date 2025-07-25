import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X, Star, Calendar, TrendingUp, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import MovieModal from '@/components/MovieModal';
import TVShowPlayer from '@/components/TVShowPlayer';
import AdBanner from '@/components/AdBanner';
import api, { Movie, TVShow } from '@/services/api';
import { Loader2 } from 'lucide-react';
import useAdminSettings from '@/hooks/useAdminSettings';
import { useSearchParams } from 'react-router-dom';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Movie | TVShow | null>(null);
  const [mediaType, setMediaType] = useState('multi');
  const [filters, setFilters] = useState({
    genre: 'all',
    year: '',
    rating: 'any',
    sortBy: 'relevance'
  });
  const [tooltipItem, setTooltipItem] = useState<Movie | TVShow | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);

  // Read query from URL on component mount
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(decodeURIComponent(urlQuery));
    }
  }, [searchParams]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, mediaType, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.search(query, mediaType);
      let searchResults = response.data?.results || [];
      
      // Apply filters
      if (filters.year) {
        searchResults = searchResults.filter(item => {
          const releaseDate = item.release_date || item.first_air_date;
          return releaseDate && new Date(releaseDate).getFullYear().toString() === filters.year;
        });
      }
      
      if (filters.rating && filters.rating !== 'any') {
        searchResults = searchResults.filter(item => 
          item.vote_average >= parseFloat(filters.rating)
        );
      }
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'rating':
          searchResults.sort((a, b) => b.vote_average - a.vote_average);
          break;
        case 'date':
          searchResults.sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date || 0);
            const dateB = new Date(b.release_date || b.first_air_date || 0);
            return dateB.getTime() - dateA.getTime();
          });
          break;
        case 'title':
          searchResults.sort((a, b) => {
            const titleA = (a.title || a.name || '').toLowerCase();
            const titleB = (b.title || b.name || '').toLowerCase();
            return titleA.localeCompare(titleB);
          });
          break;
        default:
          // Relevance - keep original order
          break;
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      } finally {
        setLoading(false);
      }
    };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setFilters({
      genre: 'all',
      year: '',
      rating: '',
      sortBy: 'relevance'
    });
  };

  const handleItemClick = (item: Movie | TVShow) => {
    setSelectedItem(item);
  };

  const clearFilters = () => {
    setFilters({
      genre: 'all',
      year: '',
      rating: '',
      sortBy: 'relevance'
    });
  };

  const handleMouseEnter = (e: React.MouseEvent, item: Movie | TVShow) => {
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

  const hasActiveFilters = filters.genre !== 'all' || filters.year || filters.rating || filters.sortBy !== 'relevance';
  const { settings: adminSettings } = useAdminSettings();

  return (
    <div className="min-h-screen bg-black pt-20 sm:pt-20 md:pt-20" style={{ position: 'relative' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Search</h1>
          <p className="text-xl text-gray-400">Find your favorite movies and TV shows</p>
        </div>

        {/* Top Ad */}
        {adminSettings?.ads?.searchTopAd?.enabled && (
        <div className="mb-8">
          <AdBanner 
              adKey="searchTopAd"
              imageUrl={adminSettings.ads.searchTopAd.imageUrl}
              clickUrl={adminSettings.ads.searchTopAd.clickUrl}
              enabled={adminSettings.ads.searchTopAd.enabled}
          />
      </div>
        )}

        {/* Search Bar */}
        <div className="flex flex-wrap gap-4 mb-8 p-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800">
          <div className="flex gap-4 items-center flex-wrap w-full">
            <div className="relative flex-1 min-w-[300px]">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search movies, TV shows, or people..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    e.preventDefault();
                    // Update URL with new search query
                    const newUrl = `/search?q=${encodeURIComponent(query.trim())}`;
                    window.history.pushState({}, '', newUrl);
                  }
                }}
                className="bg-gray-800 border-gray-700 text-white pl-10 pr-10 h-12 text-lg"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1 h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Select value={mediaType} onValueChange={setMediaType}>
              <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multi">All</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="tv">TV Shows</SelectItem>
                <SelectItem value="person">People</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                <Input
                  type="number"
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  placeholder="e.g. 2023"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Minimum Rating</label>
                <Select value={filters.rating} onValueChange={(value) => setFilters({ ...filters, rating: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rating</SelectItem>
                    <SelectItem value="9">9+ Stars</SelectItem>
                    <SelectItem value="8">8+ Stars</SelectItem>
                    <SelectItem value="7">7+ Stars</SelectItem>
                    <SelectItem value="6">6+ Stars</SelectItem>
                    <SelectItem value="5">5+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        Relevance
                      </div>
                    </SelectItem>
                    <SelectItem value="rating">
                      <div className="flex items-center gap-2">
                        <Star size={16} />
                        Rating
                      </div>
                    </SelectItem>
                    <SelectItem value="date">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Release Date
                      </div>
                    </SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && query && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Search Results for "{query}"
              </h2>
              <span className="text-gray-400">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No results found for "{query}"</p>
                <p className="text-gray-500 mt-2">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer relative"
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={(e) => handleMouseEnter(e, item)}
                    onMouseLeave={handleTooltipMouseLeave}
                    onMouseOut={handleTooltipMouseLeave}
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWYyOTM3Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                        alt={'title' in item ? (item.title || 'Unknown Title') : (item.name || 'Unknown Title')}
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
                        {item.vote_average?.toFixed(1) || 'N/A'}
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-white truncate">
                        {'title' in item ? (item.title || 'Unknown Title') : (item.name || 'Unknown Title')}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {(() => {
                          const date = 'release_date' in item ? item.release_date : item.first_air_date;
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
            )}
          </div>
        )}

        {/* Bottom Ad */}
        {adminSettings?.ads?.searchBottomAd?.enabled && (
        <div className="mt-12">
          <AdBanner 
              adKey="searchBottomAd"
              imageUrl={adminSettings.ads.searchBottomAd.imageUrl}
              clickUrl={adminSettings.ads.searchBottomAd.clickUrl}
              enabled={adminSettings.ads.searchBottomAd.enabled}
            />
          </div>
        )}
      </div>

      {/* Movie Modal */}
      {selectedItem && 'title' in selectedItem && (
        <MovieModal
          movie={selectedItem as Movie}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* TV Show Player */}
      {selectedItem && 'name' in selectedItem && (
        <TVShowPlayer
          show={selectedItem as TVShow}
          onClose={() => setSelectedItem(null)}
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
            {'title' in tooltipItem ? tooltipItem.title : tooltipItem.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
            <span>
              {(() => {
                const date = 'release_date' in tooltipItem ? tooltipItem.release_date : tooltipItem.first_air_date;
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
            <span className="capitalize">{'title' in tooltipItem ? 'Movie' : 'TV Show'}</span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-4">
            {tooltipItem.overview || 'No description available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Search; 