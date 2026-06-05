import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function AnimatedLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const innerCircleSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
    xl: 'p-3'
  };

  return (
    <div 
      id="mix-bh-animated-logo" 
      className="flex flex-col items-center justify-center select-none"
      dir="rtl"
    >
      <div className="relative flex items-center justify-center">
        {/* ANIMATION COMPONENT 1: Orbiting Glow ring (Red and White) */}
        <motion.div
          className={`absolute rounded-full border border-dashed border-brand-red/35 ${
            size === 'sm' ? 'w-12 h-12' : size === 'md' ? 'w-20 h-20' : size === 'lg' ? 'w-28 h-28' : 'w-38 h-38'
          }`}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        {/* ANIMATION COMPONENT 2: Concentric ambient pulse waves replicating waves of Bahrain's Pearl Heritage */}
        <motion.div
          className={`absolute rounded-full bg-brand-red/10 blur-xl ${iconSizes[size]}`}
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* CONTAINER FOR APP ICON BADGE */}
        <motion.div
          className={`relative flex items-center justify-center bg-white rounded-2xl shadow-xl border border-gray-100 cursor-pointer overflow-hidden ${iconSizes[size]}`}
          whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {/* ANIMATION COMPONENT 3: Diagonal Split Flag Background with the 5 Red Teeth (Islam pillars representation) */}
          <div className="absolute inset-0 flex justify-between">
            {/* White Left portion */}
            <div className="w-1/3 h-full bg-white relative z-10" />
            
            {/* Red Right portion with exactly 5 geometric teeth / triangle peaks */}
            <div className="w-2/3 h-full bg-brand-red relative">
              {/* Dynamic Teeth Border SVG representing the spear peaks of the Bahrain flat flag */}
              <svg 
                className="absolute left-[-1px] top-0 h-full w-4 text-brand-red fill-current transform scale-y-110 z-20"
                viewBox="0 0 20 100" 
                preserveAspectRatio="none"
              >
                <polygon points="20,0 0,10 20,20 0,30 20,40 0,50 20,60 0,70 20,80 0,90 20,100" />
              </svg>

              {/* Red overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
            </div>
          </div>

          {/* ANIMATION COMPONENT 4: Soft rotating internal overlay seal line */}
          <motion.div 
            className="absolute inset-1.5 rounded-xl border border-white/20 pointer-events-none z-30"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />

          {/* ANIMATION COMPONENT 5: Golden star sparklet floating over flag */}
          <motion.div
            className="absolute top-1/4 right-1/4 text-amber-300 z-30 opacity-80"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-2.5 h-2.5 fill-amber-350 text-amber-350" />
          </motion.div>

          {/* INNER TEXT EMBLEMS ON THE BADGE */}
          <div className="relative z-40 flex items-center justify-center font-bold text-white pr-2">
            <span className="font-extrabold text-[#D01C1F] text-opacity-10 absolute left-2 scale-[1.3] select-none font-mono tracking-tighter">B</span>
            <span className="font-sans italic font-black text-xs md:text-sm text-gray-800 drop-shadow-sm ml-0.5">m</span>
            <span className="font-mono italic font-black text-sm md:text-base text-white drop-shadow">b</span>
          </div>
        </motion.div>
      </div>

      {/* BRAND ALPHANUMERIC TEXT: mix.bh WITH STAGGERED REVEALS */}
      <div className="mt-2 flex items-center justify-center gap-0.5 font-sans font-extrabold pb-0.5">
        <motion.span 
          className={`${textSizes[size]} text-brand-red tracking-tight font-black`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          mix
        </motion.span>
        
        <motion.span 
          className={`${textSizes[size]} text-brand-red font-black`}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          .
        </motion.span>
        
        <motion.span 
          className={`${textSizes[size]} text-gray-800 tracking-tight font-black`}
          whileHover={{ y: -3, color: '#D01C1F' }}
        >
          bh
        </motion.span>

        {/* Small beating flag banner heart */}
        <motion.span 
          className="w-1.5 h-1.5 rounded-full bg-brand-red inline-block self-end mb-2.5 mr-1"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </div>

      {/* SUBTITLE FOOTNOTE */}
      {size !== 'sm' && (
        <span className="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-widest mt-0.5 uppercase flex items-center gap-1">
          🇧🇭 دعم الأسر والمشاريع البحرينية المنتجة
        </span>
      )}
    </div>
  );
}
