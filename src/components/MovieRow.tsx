import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MovieCard from './MovieCard';
import { Movie, TVShow } from '@/services/api';

interface MovieRowProps {
  title: string;
  movies: (Movie | TVShow)[];
  loading?: boolean;
  onItemClick?: (movie: Movie | TVShow) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, loading = false, onItemClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const isMobile = useIsMobile();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = isMobile ? 250 : 1200;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Mouse drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  if (loading) {
    return (
      <div className={isMobile ? 'mb-8' : 'mb-12'}>
        <h2 className={`font-bold text-white mb-4 px-4 md:px-12 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{title}</h2>
        <div className={`flex gap-3 px-4 md:px-12 ${isMobile ? 'gap-2' : 'gap-4'}`}>
          {Array.from({ length: isMobile ? 3 : 6 }).map((_, index) => (
            <div 
              key={index} 
              className={`bg-gray-800 rounded-lg animate-pulse flex-shrink-0 ${
                isMobile ? 'w-32 h-48' : 'w-64 h-96'
              }`} 
            />
          ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className={`group ${isMobile ? 'mb-8' : 'mb-12'}`}>
      <h2 className={`font-bold text-white mb-4 px-4 md:px-12 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{title}</h2>
      
      <div className="relative px-4 md:px-12">
        {/* Left Arrow - Hidden on mobile */}
        {!isMobile && showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right Arrow - Hidden on mobile */}
        {!isMobile && showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Movies Container */}
        <div
          ref={scrollRef}
          onMouseDown={!isMobile ? handleMouseDown : undefined}
          onMouseMove={!isMobile ? handleMouseMove : undefined}
          onMouseUp={!isMobile ? handleMouseUp : undefined}
          onMouseLeave={!isMobile ? handleMouseLeave : undefined}
          className={`flex overflow-x-auto scrollbar-hide pb-4 ${
            isMobile 
              ? 'gap-2 snap-x snap-mandatory' 
              : `gap-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`
          }`}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            userSelect: isMobile ? 'auto' : 'none'
          }}
        >
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              size={isMobile ? 'small' : 'medium'}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieRow; 