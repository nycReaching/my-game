import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookPage, setBookPage] = useState(0);
  const [luckValue, setLuckValue] = useState(null);
  const [isRollingLuck, setIsRollingLuck] = useState(false);
  const [rollingDisplayValue, setRollingDisplayValue] = useState(1);
  const [isFinalResult, setIsFinalResult] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [currentShopPage, setCurrentShopPage] = useState(0);

  // Economy & Inventory
  const [money, setMoney] = useState(999);
  const [trees, setTrees] = useState([]); // Stores purchased trees (Legacy/Decoration)
  const [flowers, setFlowers] = useState([]); // Stores purchased flowers (Legacy/Decoration)
  
  // Active Bird Items (One of each type)
  const [activeItems, setActiveItems] = useState({
      house: null, // { icon: '🏠', stat: 5, ... }
      bath: null,  // { icon: '⛲', stat: 5, ... }
      feeder: null // { icon: '🌻', stat: 5, ... }
  });

  const [pendingItem, setPendingItem] = useState(null); // Item selected for purchase (Main Screen)
  const [selectedShopItem, setSelectedShopItem] = useState(null); // Item selected for purchase (Shop Modal)

  const luckTimeoutRef = useRef(null);
  const luckCycleRef = useRef(null);

  useEffect(() => {
    return () => {
      if (luckTimeoutRef.current) clearTimeout(luckTimeoutRef.current);
      if (luckCycleRef.current) clearTimeout(luckCycleRef.current);
    };
  }, []);

  const menuItems = useMemo(() => [
    { id: 'collection', icon: '📚', subItems: ['🌱', '🌼', '🌷', '🪻'], type: 'modal' }, 
    { id: 'flowers', icon: '🌱', subItems: ['🌱', '🌼', '🌷', '🪻'], type: 'slider' }, 
    { id: 'trees', icon: '🌳', subItems: ['🌳', '🌲', '🌴', '🌵'], type: 'slider' }, 
  ], []);

  const shopItems = useMemo(() => [
    // Page 0: Birding Supplies
    {
      title: 'BIRDING SUPPLIES',
      bgColor: 'bg-[#d6c0b0]',
      sections: [
        {
          title: 'BIRD HOUSES',
          items: [
            { icon: '🏠', price: 1, stat: 5, type: 'house', label: 'Classic', bgColor: 'bg-red-100' },
            { icon: '🏡', price: 1, stat: 5, type: 'house', label: 'Manor', bgColor: 'bg-red-100' },
            { icon: '🛖', price: 1, stat: 5, type: 'house', label: 'Cottage', bgColor: 'bg-red-100' },
          ]
        },
        {
          title: 'BIRD BATHS',
          items: [
            { icon: '⛲', price: 1, stat: 5, type: 'bath', label: 'Fountain', bgColor: 'bg-teal-100' },
            { icon: '🛁', price: 1, stat: 5, type: 'bath', label: 'Tub', bgColor: 'bg-teal-100' },
            { icon: '🥣', price: 1, stat: 5, type: 'bath', label: 'Bowl', bgColor: 'bg-teal-100' },
          ]
        },
        {
          title: 'BIRD FEEDERS',
          items: [
            { icon: '🥯', price: 1, stat: 5, type: 'feeder', label: 'Bagel', bgColor: 'bg-yellow-100' },
            { icon: '🌻', price: 1, stat: 5, type: 'feeder', label: 'Seed', bgColor: 'bg-yellow-100' },
            { icon: '🌽', price: 1, stat: 5, type: 'feeder', label: 'Cob', bgColor: 'bg-yellow-100' },
          ]
        }
      ]
    },
    // Page 1: Variety Store
    {
      title: 'VARIETY STORE',
      bgColor: 'bg-[#d6c0b0]', 
      sections: [
        {
          title: '', 
          items: [
             { icon: '🧢', price: 1, stat: 5, type: 'misc' }, 
             { icon: '🕶️', price: 1, stat: 5, type: 'misc' }, 
             { icon: '🎒', price: 1, stat: 5, type: 'misc' },
          ]
        },
        {
          title: '',
          items: [
            { icon: '🎸', price: 1, stat: 5, type: 'misc' }, 
            { icon: '🚲', price: 1, stat: 5, type: 'misc' }, 
            { icon: '🧸', price: 1, stat: 5, type: 'misc' },
          ]
        },
        {
          title: '',
          items: [
            { icon: '📱', price: 1, stat: 5, type: 'misc' }, 
            { icon: '💎', price: 1, stat: 5, type: 'misc' }, 
            { icon: '🚀', price: 1, stat: 5, type: 'misc' },
          ]
        }
      ]
    }
  ], []);

  const birdCollection = useMemo(() => [
    '🐓','🦃','🦆','🦅','🕊️','🦢','🦜','🐦‍⬛',
    '🪿','🐦‍🔥','🦩','🦚','🦉','🦤','🐦','🐧','🐥'
  ], []);

  const topBarData = useMemo(() => [
    { type: 'profile', icon: '👤' },
    { type: 'stat', label: 'MONEY', value: `$${money}`, color: 'text-green-600' },
    { type: 'stat', label: 'LUCK', value: luckValue !== null ? luckValue : '', color: 'text-pink-500' },
    { type: 'stat', label: 'DAY', value: '1', color: 'text-blue-600' },
  ], [luckValue, money]);

  const handleMenuClick = useCallback((item) => {
    if (item.type === 'modal') {
      setActiveMenu(null);
      setIsBookModalOpen(true);
      setBookPage(0);
      setPendingItem(null); 
    } else {
      setActiveMenu(prev => prev === item.id ? null : item.id);
      if (activeMenu !== item.id) setPendingItem(null); 
    }
  }, [activeMenu]);

  const handleSubItemClick = useCallback((subItem, parentId) => {
    if (parentId === 'trees') {
        if (trees.length < 4) {
            setPendingItem({ icon: subItem, type: 'tree' });
        }
    } else if (parentId === 'flowers') {
        if (flowers.length < 4) {
            setPendingItem({ icon: subItem, type: 'flower' });
        }
    }
  }, [trees, flowers]);

  // Shop Item Click Handler
  const handleShopItemClick = useCallback((item) => {
      if (selectedShopItem === item) {
          // Confirm Purchase
          if (money >= item.price) {
              setMoney(prev => prev - item.price);
              
              // Place item in active slot if it's a bird item
              if (['house', 'bath', 'feeder'].includes(item.type)) {
                  setActiveItems(prev => ({
                      ...prev,
                      [item.type]: item // Store full item object to access stats
                  }));
              }
              
              setSelectedShopItem(null);
          }
      } else {
          // Select Item
          setSelectedShopItem(item);
      }
  }, [money, selectedShopItem]);

  // Main Screen Purchase (Legacy Trees/Flowers)
  const confirmPendingPurchase = useCallback(() => {
      if (pendingItem && money >= 1) {
          if (pendingItem.type === 'tree' && trees.length < 4) {
              setMoney(prev => prev - 1);
              setTrees(prev => [...prev, pendingItem.icon]);
              setPendingItem(null);
              setActiveMenu(null); 
          } else if (pendingItem.type === 'flower' && flowers.length < 4) {
              setMoney(prev => prev - 1);
              setFlowers(prev => [...prev, pendingItem.icon]);
              setPendingItem(null);
              setActiveMenu(null); 
          }
      }
  }, [pendingItem, money, trees, flowers]);

  const closeAllMenus = useCallback(() => {
    setActiveMenu(null);
    setPendingItem(null);
  }, []);

  const handleCameraClick = useCallback(() => {
    closeAllMenus();
    setShowFlash(true);
    luckTimeoutRef.current = setTimeout(() => setShowFlash(false), 150);
  }, [closeAllMenus]);

  const handleLuckClick = useCallback(() => {
    closeAllMenus();
    if (isRollingLuck) return;
    
    setIsRollingLuck(true);
    setIsFinalResult(false);
    
    let speed = 50;
    let counter = 0;
    const maxSteps = 12; 
    
    const cycle = () => {
      const nextNum = Math.floor(Math.random() * 99) + 1;
      setRollingDisplayValue(nextNum);
      counter++;

      if (counter < maxSteps) {
        speed += (counter * 8); 
        luckCycleRef.current = setTimeout(cycle, speed);
      } else {
        setLuckValue(nextNum); 
        setIsFinalResult(true); 
        
        luckTimeoutRef.current = setTimeout(() => {
            setIsRollingLuck(false);
            setIsFinalResult(false);
        }, 1000);
      }
    };

    cycle();
  }, [isRollingLuck, closeAllMenus]);

  const toggleShopPage = useCallback(() => {
    setCurrentShopPage(prev => (prev + 1) % shopItems.length);
    setSelectedShopItem(null); 
  }, [shopItems.length]);

  const modalVariants = useMemo(() => ({
    backdrop: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    profile: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
    book: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    shop: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
  }), []);

  const transitionSpring = useMemo(() => ({ type: 'spring', damping: 25, stiffness: 200 }), []);

  return (
    <div className="relative w-full h-screen bg-green-600 overflow-hidden select-none touch-none flex flex-col font-sans text-slate-900">
      
      {/* Camera Flash */}
      <AnimatePresence>
        {showFlash && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute inset-0 z-[70] bg-white pointer-events-none mix-blend-hard-light"
            />
        )}
      </AnimatePresence>

      {/* Main Screen Purchase Confirmation */}
      <AnimatePresence>
        {pendingItem && (
            <motion.div 
                initial={{ y: -100, x: "-50%", opacity: 0 }}
                animate={{ y: 0, x: "-50%", opacity: 1 }}
                exit={{ y: -100, x: "-50%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-24 left-1/2 z-[60]"
            >
                <button 
                    onClick={confirmPendingPurchase}
                    className="bg-white px-6 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 hover:scale-105 transition-transform active:scale-95"
                >
                    <span className="text-2xl">{pendingItem.icon}</span>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BUY NOW</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-green-600">${pendingItem.price || 1}</span>
                        </div>
                    </div>
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Luck Rolling Animation */}
      <AnimatePresence>
        {isRollingLuck && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="relative w-40 h-40 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl flex flex-col items-center justify-center pointer-events-auto"
                >
                    <div className="absolute -top-5 bg-pink-400 px-3 py-1 border-2 border-black rounded-full font-black text-xs tracking-wider shadow-sm transform -rotate-3">
                        LUCKY NUMBER
                    </div>
                    <motion.div 
                        className={`text-7xl font-black tabular-nums tracking-tighter ${isFinalResult ? 'text-pink-500' : 'text-slate-800'}`}
                        animate={isFinalResult ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        {rollingDisplayValue}
                    </motion.div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header className="w-full h-20 shrink-0 z-30 px-4 py-3 flex items-center gap-3 relative">
        <div className="absolute inset-0 bg-amber-400 border-b-4 border-black shadow-lg z-0">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
        </div>
        
        {topBarData.map((item, i) => (
          <motion.div 
            key={`${item.type}-${i}`}
            onClick={() => {
                if (item.type === 'profile') {
                    setIsProfileOpen(true);
                    closeAllMenus();
                }
            }}
            whileTap={item.type === 'profile' ? { scale: 0.95 } : {}}
            className={`
                relative h-full z-10 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                flex flex-col items-center justify-center text-center
                ${item.type === 'profile' ? 'aspect-square rounded-full flex-none cursor-pointer' : 'flex-1 rounded-lg'}
            `}
          >
             {item.type === 'profile' ? (
                <span className="text-2xl filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]">{item.icon}</span>
             ) : (
                <>
                    <span className="text-[10px] font-black opacity-60 leading-tight tracking-widest uppercase text-slate-500">{item.label}</span>
                    <span className={`text-base font-black leading-none ${item.color || 'text-slate-900'} min-h-[1em]`}>
                        <AnimatePresence mode='wait'>
                            <motion.span 
                                key={item.value} 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {item.value}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                </>
             )}
          </motion.div>
        ))}
      </header>

      {/* Main Game Viewport */}
      <div 
        className="flex-1 relative w-full flex overflow-hidden" 
        onClick={closeAllMenus}
      >
        
        {/* Background Pattern */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
                backgroundColor: '#4ade80',
                backgroundImage: `
                    linear-gradient(45deg, #16a34a 25%, transparent 25%, transparent 75%, #16a34a 75%),
                    linear-gradient(45deg, #16a34a 25%, transparent 25%, transparent 75%, #16a34a 75%)
                `,
                backgroundPosition: '0 0, 30px 30px',
                backgroundSize: '60px 60px'
            }}
        />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none"></div>

        {/* Trees Layer */}
        <div className="absolute inset-0 z-5 pointer-events-none">
            <AnimatePresence>
                {trees.map((tree, i) => (
                    <motion.div
                        key={`tree-${i}`}
                        initial={{ scale: 0, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="absolute text-9xl filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] origin-bottom"
                        style={{ 
                            bottom: `${15 + (i * 18)}%`,
                            right: '-1rem', // Shifted more to the right (offscreen slightly)
                            zIndex: 10 - i // Stacking order reversed: Bottom trees (i=0) are on top (zIndex=10)
                        }}
                    >
                        {tree}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* Flowers Layer */}
        <div className="absolute inset-0 z-6 pointer-events-none">
            <AnimatePresence>
                {flowers.map((flower, i) => (
                    <motion.div
                        key={`flower-${i}`}
                        initial={{ scale: 0, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        // Reduced to text-5xl and reduced spacing multiplier to 3rem
                        className="absolute text-5xl filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] origin-bottom"
                        style={{ bottom: '15%', right: `${6 + (i * 3)}rem` }} 
                    >
                        {flower}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* Left Side Meters */}
        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 bg-red-900 rounded-r-2xl pl-3 pr-2 py-4 flex flex-col gap-4 z-20 border-y-2 border-r-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {[
            { icon: '📈', color: 'bg-blue-500', value: 50 },
            { icon: '🚗', color: 'bg-slate-400', value: 50 }
          ].map((meter, i) => (
            <div key={meter.icon} className="relative flex flex-col items-center gap-1">
              <span className="text-xl filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]">{meter.icon}</span>
              <div className="w-6 h-24 bg-slate-800 border-2 border-black shadow-inner rounded-lg overflow-hidden flex flex-col-reverse">
                <motion.div 
                  className={`w-full ${meter.color}`}
                  initial={{ height: '0%' }}
                  animate={{ height: `${meter.value}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Center Stage - Active Item UI */}
        <div className="flex-1 relative z-10 flex items-center justify-center pointer-events-none">
            {/* Active Items Container */}
            <div className="flex items-center justify-center -space-x-6 pointer-events-none">
                <AnimatePresence mode='popLayout'>
                    {/* Feeder (Left, Top z-index) */}
                    {activeItems.feeder && (
                        <ActiveItemCard 
                            key="feeder" 
                            item={activeItems.feeder} 
                            type="FEEDER" 
                            zIndex="z-30"
                            bgColor="bg-yellow-100"
                            labelColor="bg-yellow-500"
                        />
                    )}
                    {/* Bath (Center, Mid z-index) */}
                    {activeItems.bath && (
                        <ActiveItemCard 
                            key="bath" 
                            item={activeItems.bath} 
                            type="BATH" 
                            zIndex="z-20"
                            bgColor="bg-teal-100"
                            labelColor="bg-teal-500"
                        />
                    )}
                    {/* House (Right, Low z-index) */}
                    {activeItems.house && (
                        <ActiveItemCard 
                            key="house" 
                            item={activeItems.house} 
                            type="HOUSE" 
                            zIndex="z-10"
                            bgColor="bg-red-100"
                            labelColor="bg-red-500"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Right Side Buttons */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-5 items-end">
                {menuItems.map((item, index) => (
                    <MemoizedSideMenu 
                        key={item.id}
                        item={item}
                        delay={0.1 * (index + 1)}
                        isActive={activeMenu === item.id}
                        onToggle={() => handleMenuClick(item)}
                        onSubItemClick={handleSubItemClick}
                    />
                ))}
            </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="w-full h-auto min-h-[140px] z-30 relative shrink-0">
        <div className="absolute inset-0 bg-[#2c1810] border-t-4 border-black shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(to bottom, #e2e8f0 2px, transparent 2px)', 
                     backgroundSize: '100% 8px' 
                 }} 
            />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full h-full p-6 flex items-end justify-center gap-4 pb-8">
             {/* Left Action - Shop */}
            <motion.button 
                onClick={() => {
                    setIsShopOpen(true);
                    closeAllMenus();
                }}
                whileTap={{ scale: 0.95, y: 4, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                className="h-16 w-16 rounded-2xl bg-amber-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group flex items-center justify-center"
            >
                 <span className="text-3xl filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] relative z-10 group-active:scale-90 transition-transform">🛍️</span>
            </motion.button>

            {/* Center Main Action - Camera */}
            <motion.button 
                onClick={handleCameraClick}
                whileTap={{ scale: 0.98, y: 4, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                className="h-20 w-24 mb-1 rounded-3xl bg-blue-600 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group flex items-center justify-center"
            >
                 <span className="text-4xl filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] relative z-10 -mt-4 group-active:rotate-12 transition-transform duration-300">📷</span>
            </motion.button>

             {/* Right Action - Luck */}
             <motion.button 
                onClick={handleLuckClick}
                whileTap={{ scale: 0.95, y: 4, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                className="h-16 w-16 rounded-2xl bg-pink-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group flex items-center justify-center"
            >
                 <span className="text-3xl filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] relative z-10 group-active:scale-90 transition-transform">🎲</span>
            </motion.button>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
            <>
                <motion.div
                    {...modalVariants.backdrop}
                    onClick={() => setIsProfileOpen(false)}
                    className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                />
                <motion.div
                    {...modalVariants.profile}
                    transition={transitionSpring}
                    className="absolute top-0 left-0 right-0 h-2/3 z-50 bg-white border-b-4 border-black shadow-[0_10px_0px_0px_rgba(0,0,0,0.2)] rounded-b-3xl flex flex-col items-center justify-center"
                >
                    <CloseButton onClick={() => setIsProfileOpen(false)} />
                    <div className="text-2xl font-black text-slate-300 select-none">PROFILE MENU</div>
                    <div className="text-slate-300 select-none">(Placeholder)</div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Book Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
            <>
                <motion.div
                    {...modalVariants.backdrop}
                    onClick={() => setIsBookModalOpen(false)}
                    className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                />
                <motion.div
                    {...modalVariants.book}
                    transition={transitionSpring}
                    className="absolute top-0 right-0 w-3/4 max-w-sm h-full z-50 bg-purple-200 border-l-4 border-black shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.2)] flex flex-col"
                >
                     <div className="p-4 border-b-4 border-purple-300 bg-white flex items-center justify-between shrink-0">
                         <div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {bookPage === 0 ? "Collection" : "Favorites"}
                             </div>
                             <div className="text-xl font-black text-slate-800">
                                {bookPage === 0 ? "BIRDS" : "PAGE 2"}
                             </div>
                         </div>
                         <CloseButton onClick={() => setIsBookModalOpen(false)} />
                     </div>

                     {bookPage === 0 ? (
                         <div className="flex-1 overflow-hidden p-4">
                            <div className="grid grid-cols-4 gap-2">
                                {birdCollection.map((bird, index) => (
                                    <motion.div
                                        key={bird}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="aspect-square flex items-center justify-center opacity-40 select-none bg-purple-100/50 rounded-lg"
                                    >
                                        <span className="text-xl filter grayscale brightness-0 drop-shadow-sm">
                                            {bird}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-4 text-center text-[10px] text-purple-800 font-bold uppercase tracking-widest">
                                0/{birdCollection.length} Unlocked
                            </div>
                         </div>
                     ) : (
                         <div className="flex-1 flex flex-col items-center justify-center p-6 text-purple-300">
                            <span className="text-6xl mb-4 opacity-50">✨</span>
                            <span className="font-bold uppercase tracking-widest text-sm">(Blank Page)</span>
                         </div>
                     )}

                     <div className="absolute bottom-6 right-6 z-20">
                         <motion.button
                            onClick={() => setBookPage(page => page === 0 ? 1 : 0)}
                            whileTap={{ scale: 0.9, rotate: -10 }}
                            className="w-14 h-14 bg-yellow-400 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-2xl"
                         >
                            ⭐
                         </motion.button>
                     </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {isShopOpen && (
            <>
                <motion.div
                    {...modalVariants.backdrop}
                    onClick={() => setIsShopOpen(false)}
                    className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                />
                <motion.div
                    {...modalVariants.shop}
                    transition={transitionSpring}
                    className={`absolute bottom-0 left-0 right-0 h-2/3 z-50 border-t-4 border-black shadow-[0_-10px_0px_0px_rgba(0,0,0,0.2)] rounded-t-3xl flex flex-col overflow-hidden transition-colors duration-300 ${shopItems[currentShopPage].bgColor}`}
                >
                    <CloseButton onClick={() => setIsShopOpen(false)} />
                    
                    {/* Header */}
                    <div className="w-full p-6 flex items-center shrink-0">
                        <div className="text-xl font-black text-[#44403c] flex items-center gap-2">
                            <span>{shopItems[currentShopPage].title}</span>
                            {/* "OPEN" bubble removed */}
                        </div>
                    </div>

                    {/* Shop Content - Unified Layout Logic */}
                    <div className="flex-1 w-full overflow-hidden px-6 pb-2 flex flex-col justify-start">
                        <div className="h-full flex flex-col justify-between">
                            {shopItems[currentShopPage].sections.map((section, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                    <div className="text-[10px] font-black text-stone-600/70 uppercase tracking-widest pl-1 h-[1em]">
                                        {section.title} &nbsp;
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {section.items.map((item, i) => (
                                            <ShopItem 
                                                key={`${item.icon}-${i}`} 
                                                item={item} 
                                                isSelected={selectedShopItem === item}
                                                onClick={handleShopItemClick}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer - Toggle Switch */}
                    <div className={`w-full p-2 flex justify-center shrink-0 pb-6 border-t-2 border-stone-300/30 transition-colors duration-300 ${shopItems[currentShopPage].bgColor}`}>
                        <div 
                            onClick={toggleShopPage}
                            className="w-16 h-8 bg-stone-300 rounded-full relative cursor-pointer shadow-inner border border-stone-400 tap-highlight-transparent"
                        >
                            <motion.div 
                                className="absolute top-1 bottom-1 w-6 bg-white rounded-full shadow-md"
                                animate={{ left: currentShopPage === 0 ? '4px' : 'calc(100% - 28px)' }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

    </div>
  );
};

// Reusable Active Item Card Component - FIXED: Added React.forwardRef
const ActiveItemCard = React.forwardRef(({ item, type, zIndex, bgColor, labelColor }, ref) => (
    <motion.div
        ref={ref}
        layout
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`pointer-events-auto w-20 h-20 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center relative group ${bgColor} ${zIndex}`}
    >
        <div className={`absolute -top-3 ${labelColor} text-[8px] font-black px-1.5 py-0.5 border-2 border-black rounded-full text-white tracking-wider shadow-sm z-10`}>
            {type}
        </div>
        {/* Icon */}
        <div className="text-5xl filter drop-shadow-md transform transition-transform group-hover:scale-110 leading-none">
            {item.icon}
        </div>
        {/* Stat Display - Black number, no plus, overlapping */}
        <div className="absolute bottom-0 right-1 text-sm font-black text-black z-10">
            {item.stat}
        </div>
    </motion.div>
));

// Extracted Shop Item Component for consistency
const ShopItem = ({ item, onClick, isSelected }) => (
    <motion.div
        onClick={() => onClick(item)}
        whileTap={{ scale: 0.95 }}
        animate={isSelected ? { scale: 0.95, borderColor: '#16a34a' } : { scale: 1, borderColor: '#e7e5e4' }}
        className={`relative rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border-2 flex items-center justify-center overflow-hidden cursor-pointer active:border-stone-400 h-16
        ${item.bgColor || 'bg-white'}
        ${isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
    >
        {/* Large Centered Emoji - Slightly Reduced Size */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="text-4xl filter drop-shadow-sm transform -translate-y-0.5">{item.icon}</span>
        </div>

        {/* Confirmation Overlay */}
        <AnimatePresence>
            {isSelected && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-green-500/80 z-20 flex items-center justify-center"
                >
                    <span className="text-white font-black text-sm uppercase tracking-wider drop-shadow-md">CONFIRM?</span>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Stat (Top Left - Number Only, Black) */}
        {!isSelected && (
            <div className="absolute top-1 left-2 z-10">
                <span className="text-xl font-black text-black drop-shadow-sm">{item.stat}</span>
            </div>
        )}

        {/* Price (Bottom Right) */}
        {!isSelected && (
            <div className="absolute bottom-1 right-1 bg-white/90 px-1.5 py-0.5 rounded-md border border-stone-200 shadow-sm z-10">
                <span className="text-[10px] font-black text-green-700">${item.price}</span>
            </div>
        )}
    </motion.div>
);

const SideMenu = ({ item, delay, isActive, onToggle, onSubItemClick }) => (
    <div className="relative flex items-center justify-end pointer-events-auto">
        <AnimatePresence>
            {isActive && item.subItems && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scaleX: 0 }}
                    animate={{ opacity: 1, x: -12, scaleX: 1 }}
                    exit={{ opacity: 0, x: 20, scaleX: 0 }}
                    style={{ originX: 1 }}
                    className="absolute right-full h-14 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl flex items-center px-2 gap-1 z-0"
                >
                    {item.subItems.map((subItem) => (
                        <motion.button
                            key={subItem}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSubItemClick && onSubItemClick(subItem, item.id);
                            }}
                            whileTap={{ scale: 0.8 }}
                            className="w-10 h-10 rounded-lg border border-transparent flex items-center justify-center text-xl hover:bg-slate-100 transition-colors"
                        >
                            <span className="filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">{subItem}</span>
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>

        <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
            className={`
                w-14 h-14 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                flex items-center justify-center relative overflow-hidden group z-10 transition-colors
                ${isActive ? 'bg-yellow-300' : 'bg-purple-500'}
            `}
        >
            <span className="text-2xl filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] leading-none transition-transform opacity-100 text-white">
                {item.icon}
            </span>
        </motion.button>
    </div>
);

const CloseButton = ({ onClick }) => (
    <button 
        onClick={onClick}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold text-slate-500 z-10"
    >
        ✕
    </button>
);

const MemoizedSideMenu = React.memo(SideMenu);
const MemoizedCloseButton = React.memo(CloseButton);

export default App;