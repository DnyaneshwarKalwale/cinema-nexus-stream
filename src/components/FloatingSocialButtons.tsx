import React, { useState, useEffect } from 'react';
import useAdminSettings from '@/hooks/useAdminSettings';

interface FloatingSocialButtonsProps {
  discordLink?: string;
  telegramLink?: string;
  enabled?: boolean;
}

const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({
  discordLink = 'https://discord.gg/cinema-fo',
  telegramLink = 'https://t.me/cinema-fo',
  enabled = true
}) => {
  const { settings: adminSettings } = useAdminSettings();
  
  // Use admin settings if available, otherwise use props
  const currentDiscordLink = adminSettings?.appearance?.floatingSocialButtons?.discordUrl || discordLink;
  const currentTelegramLink = adminSettings?.appearance?.floatingSocialButtons?.telegramUrl || telegramLink;
  const isEnabled = adminSettings?.appearance?.floatingSocialButtons?.enabled ?? enabled;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on desktop (min-width: 1024px)
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isEnabled || !isVisible) {
    return null;
  }

  return (
    <div className="fixed right-6 bottom-6 z-40 hidden lg:flex flex-col gap-3">
      {/* Discord Button */}
      {currentDiscordLink && (
        <a
          href={currentDiscordLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-[#5865f2] hover:bg-[#4752c4] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          title="Join our Discord"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="transition-transform duration-300 group-hover:rotate-12"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </a>
      )}

      {/* Telegram Button */}
      {currentTelegramLink && (
        <a
          href={currentTelegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-[#0088cc] hover:bg-[#006ba3] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          title="Join our Telegram"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="transition-transform duration-300 group-hover:rotate-12"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
      )}
    </div>
  );
};

export default FloatingSocialButtons; 