/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Moon, 
  Sparkles, 
  BookOpen, 
  Save, 
  Star, 
  Trash2, 
  Heart, 
  BookMarked,
  Layers,
  Sparkle,
  MessageCircleOff,
  Minimize,
  Maximize,
  Clock,
  ArrowRight,
  Smile,
  Plus,
  Info,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ChildProfile, BedtimeStory } from "./types";
import { CURATED_THEMES, CURATED_CHARACTERS, RANDOM_PROTAGONISTS } from "./curatedData";

// Helper for generating cute bookshelf visual covers
const BOOK_COVER_COLORS = [
  "from-amber-600/60 to-purple-800/80 border-amber-400/40",
  "from-indigo-600/60 to-violet-900/80 border-indigo-400/40",
  "from-emerald-600/60 to-teal-800/80 border-emerald-400/40",
  "from-teal-600/60 to-indigo-900/80 border-teal-400/40",
  "from-rose-600/60 to-pink-800/80 border-pink-400/40",
  "from-violet-600/60 to-fuchsia-800/80 border-fuchsia-400/40"
];

// Relaxing sleepy suggestions displayed during Gemini model generation
const COZY_LOADING_MESSAGES = [
  "Sprinkling golden stardust...",
  "Whispering bedtime rumors to the sleepy wind...",
  "Tucking the tiny forest hedgehogs in...",
  "Lighting the night skies' soft lanterns...",
  "Weaving your gentle adventure together...",
  "Blowing lilac bubbles to guide your dreams...",
  "Asking the stars to shine extra warm tonight..."
];

export default function App() {
  // Story configuration state
  const [childName, setChildName] = useState<string>("Leo");
  const [childAge, setChildAge] = useState<number>(5);
  const [characterInput, setCharacterInput] = useState<string>("a clumsy astronaut");
  const [selectedThemeId, setSelectedThemeId] = useState<string>("mistakes");
  const [customThemeText, setCustomThemeText] = useState<string>("");

  // UI Flow & Output States
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState<number>(0);
  const [activeStory, setActiveStory] = useState<BedtimeStory | null>(null);
  const [savedStories, setSavedStories] = useState<BedtimeStory[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Readability parameters
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl" | "2xl">("lg");
  const [isDreamMode, setIsDreamMode] = useState<boolean>(false);
  const [isIframe, setIsIframe] = useState<boolean>(false);
  
  // Rating & Logging form states (for active story)
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [parentNotes, setParentNotes] = useState<string>("");
  const [saveConfirmation, setSaveConfirmation] = useState<boolean>(false);

  // Background random starry dots calculated once
  const [randomStars, setRandomStars] = useState<Array<{ top: number; left: number; size: number; delay: number }>>([]);

  // Fetch saved stories from localStorage and setup initial random stars
  useEffect(() => {
    // Check if running inside iframe preview
    setIsIframe(window.self !== window.top);

    // Stars array
    const stars = Array.from({ length: 60 }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5
    }));
    setRandomStars(stars);

    // Local Storage load
    const stored = localStorage.getItem("bedtime_stories_shelf");
    if (stored) {
      try {
        setSavedStories(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved stories:", e);
      }
    }
  }, []);

  // Cycle bedtime messages when loading a story
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % COZY_LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Synchronize localStorage
  const persistBookShelf = (updated: BedtimeStory[]) => {
    setSavedStories(updated);
    localStorage.setItem("bedtime_stories_shelf", JSON.stringify(updated));
  };

  // Generate bedtime story invocation
  const handleGenerateStory = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSaveConfirmation(false);
    setLoadingMsgIdx(0);

    // Formulate final selected theme text
    let moralTheme = "";
    if (selectedThemeId === "custom") {
      moralTheme = customThemeText.trim() || "Being kind and thoughtful to others";
    } else {
      const predefined = CURATED_THEMES.find(t => t.id === selectedThemeId);
      moralTheme = predefined ? `${predefined.title} (${predefined.moral})` : "Learning high values";
    }

    try {
      const response = await fetch("/api/story/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: childName.trim() || "Little One",
          age: childAge,
          character: characterInput.trim() || "A little magical creature",
          theme: moralTheme,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to craft story.");
      }

      const data = await response.json();

      // Create transient story payload
      // Parse a nice title safely or fallback
      const generatedRaw = data.story;
      let cleanedTitle = "The Beautiful Bedtime Lullaby";
      const titleMatch = generatedRaw.match(/^#+\s*(.*?)\n/);
      if (titleMatch && titleMatch[1]) {
        cleanedTitle = titleMatch[1].replace(/[#*`_]/g, "").trim();
      }

      const randomColor = BOOK_COVER_COLORS[Math.floor(Math.random() * BOOK_COVER_COLORS.length)];

      const newStory: BedtimeStory = {
        id: "transient_" + Date.now(),
        title: cleanedTitle,
        text: generatedRaw,
        profile: {
          name: childName.trim() || "Little One",
          age: childAge,
          character: characterInput.trim() || "A little magical creature",
          theme: moralTheme
        },
        timestamp: Date.now(),
        isFavorite: false,
        coverColor: randomColor,
        rating: 5,
        notes: ""
      };

      setActiveStory(newStory);
      setRatingInput(5);
      setParentNotes("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "The magic sky is slightly cloudy. Please check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  // Random character quick magic filler
  const handleRandomizeCompanion = () => {
    const randomHero = RANDOM_PROTAGONISTS[Math.floor(Math.random() * RANDOM_PROTAGONISTS.length)];
    setCharacterInput(randomHero);
  };

  // Add the loaded story to parents memory bookshelf
  const handleAddToBookshelf = () => {
    if (!activeStory) return;

    // Check if it already has a non-transient ID
    const isAlreadySaved = savedStories.some(s => s.id === activeStory.id || (s.title === activeStory.title && s.timestamp === activeStory.timestamp));
    if (isAlreadySaved) return;

    const savedId = "story_" + Date.now();
    const finalSavedBook: BedtimeStory = {
      ...activeStory,
      id: savedId,
      rating: ratingInput,
      notes: parentNotes.trim(),
      isFavorite: true
    };

    const newShelf = [finalSavedBook, ...savedStories];
    persistBookShelf(newShelf);

    // Update active activeStory so it gains the actual ID
    setActiveStory(finalSavedBook);
    setSaveConfirmation(true);
    setTimeout(() => setSaveConfirmation(false), 3000);
  };

  // Delete story from bookshelf
  const handleDeleteFromBookshelf = (idToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (confirm("Are you sure you want to let this bedtime story float away into the clouds?")) {
      const updated = savedStories.filter(s => s.id !== idToDelete);
      persistBookShelf(updated);
      
      // If we deleted the active story, convert its ID back to transient
      if (activeStory && activeStory.id === idToDelete) {
        setActiveStory({
          ...activeStory,
          id: "transient_" + Date.now(),
          isFavorite: false
        });
      }
    }
  };

  // Retrieve matching text size styles
  const getFontSizeClass = (size: string) => {
    switch (size) {
      case "sm": return "14px";
      case "md": return "16px";
      case "lg": return "19px";
      case "xl": return "22px";
      case "2xl": return "26px";
      default: return "19px";
    }
  };

  // Custom visual HTML renderer for Story markdown text
  const renderStoryContent = (markdownText: string) => {
    const lines = markdownText.split("\n\n");
    return lines.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      // Render Title matching H1 or H2 Markdown
      if (trimmed.startsWith("#")) {
        const titleClean = trimmed.replace(/^#+\s*/, "");
        return (
          <h1 
            id={`story-heading-${index}`}
            key={index} 
            className="font-serif text-3xl md:text-4xl font-semibold text-center text-amber-200 mt-2 mb-8 leading-tight tracking-wide drop-shadow-md"
          >
            {titleClean}
          </h1>
        );
      }

      // Check if it's a quote or highlighted sleep meditation part
      if (trimmed.startsWith(">")) {
        const quoteClean = trimmed.replace(/^>\s*/, "");
        return (
          <blockquote 
            id={`story-quote-${index}`}
            key={index} 
            className="border-l-4 border-amber-300 pl-4 py-1 my-6 italic text-amber-100/80 font-serif text-lg leading-relaxed bg-indigo-900/40 rounded-r-lg shadow-inner"
          >
            {parseInlineBold(quoteClean)}
          </blockquote>
        );
      }

      // Standard paragraph element
      return (
        <p 
          id={`story-para-${index}`}
          key={index} 
          className="text-indigo-100/90 leading-relaxed font-sans mb-6 last:mb-0 transition-all duration-300 antialiased tracking-wide first-letter:text-4xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-amber-300 first-letter:font-bold prose"
          style={{ 
            fontSize: getFontSizeClass(fontSize),
            textShadow: "0 1px 2px rgba(15,23,42,0.4)"
          }}
        >
          {parseInlineBold(trimmed)}
        </p>
      );
    });
  };

  const parseInlineBold = (text: string) => {
    // Splits on **bold** text to render beautiful glows on key sensory words
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-extrabold text-amber-300 drop-shadow-sm tracking-wide">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Absolute Scenic Starry Canvas backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Dreamy Nebula Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[550px] bg-gradient-to-br from-indigo-950/40 via-violet-900/10 to-transparent rounded-full blur-[100px] opacity-80" />
        <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-sky-950/40 via-purple-900/10 to-transparent rounded-full blur-[100px] opacity-70" />
        
        {/* Stars generator */}
        {randomStars.map((star, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-white opacity-40 animate-twinkle"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col min-h-screen">
        
        {/* Glowing Cozy Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-indigo-950/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-indigo-600 p-0.5 shadow-lg shadow-amber-900/20 flex items-center justify-center animate-float-slow">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Moon className="w-6 h-6 text-amber-300 fill-amber-300/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-1">
                  <Sparkle className="w-3 h-3 animate-spin" /> Nighttime Magic
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-black tracking-wide bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent">
                Bedtime Storyteller
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-indigo-950/40 p-2.5 rounded-2xl border border-indigo-900/30">
            <div className="text-right hidden md:block">
              <span className="text-xs text-indigo-300/80 block">Soft Ambient Dreams</span>
              <span className="text-[10px] text-amber-400/90 font-mono">Ready to Read Together</span>
            </div>
            <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
        </header>

        {/* Core Layout split: Configuration on left, active story book on right */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
          
          {/* Left panel: Weave Controls (4 cols or 5 cols on lg viewports) */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Child Profile Box */}
            <div className="bg-indigo-950/20 backdrop-blur-xl border border-indigo-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Smile className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-base font-serif font-bold text-amber-100">1. Who is the Bedtime Adventurer?</h3>
              </div>

              <div className="space-y-4">
                {/* Child Name */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-indigo-300/80 font-bold mb-2">
                    Child's First Name
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Enter little hero's name"
                    className="w-full bg-slate-900/60 border border-indigo-950 px-4 py-3 rounded-xl focus:border-amber-400/50 focus:outline-none transition-colors text-amber-100 placeholder-indigo-300/40 font-medium"
                  />
                </div>

                {/* Age selector pills */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-indigo-300/80 font-bold mb-2">
                    Age Group (Perfect Vocabulary Match)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 8, 11].map((age) => {
                      let label = "";
                      if (age === 3) label = "Toddler (3)";
                      else if (age === 5) label = "Pre-K (5)";
                      else if (age === 8) label = "Junior (8)";
                      else label = "Youth (11)";

                      const isSelected = childAge === age;
                      return (
                        <button
                          key={age}
                          type="button"
                          onClick={() => setChildAge(age)}
                          className={`px-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            isSelected 
                              ? "bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/10 scale-105" 
                              : "bg-slate-900/40 text-indigo-200 border-indigo-950 hover:bg-indigo-950/40 hover:border-indigo-900/50"
                          }`}
                        >
                          <span className="block font-mono text-sm leading-none mb-1">{age}</span>
                          <span className="text-[9px] block opacity-80 font-sans leading-none">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Favorite Companion Box */}
            <div className="bg-indigo-950/20 backdrop-blur-xl border border-indigo-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-amber-100">2. The Sleepy Companion</h3>
                </div>

                {/* Randomizer wand key */}
                <button
                  type="button"
                  onClick={handleRandomizeCompanion}
                  className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-amber-400 hover:text-slate-950 transition-colors border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
                  title="Weave a magical companion"
                >
                  <span>✨ Random Wand</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Character custom prompt */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-indigo-300/80 font-bold mb-2">
                    Protagonist details
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={characterInput}
                    onChange={(e) => setCharacterInput(e.target.value)}
                    placeholder="e.g. A tiny dragon who blows lilac bubbles"
                    className="w-full bg-slate-900/60 border border-indigo-950 px-4 py-3 rounded-xl focus:border-amber-400/50 focus:outline-none transition-colors text-amber-100 placeholder-indigo-300/40 font-medium"
                  />
                </div>

                {/* Prompt generator pills */}
                <div>
                  <span className="block text-[10px] text-indigo-400 font-extrabold uppercase tracking-wide mb-2">
                    Popular Companion Suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {CURATED_CHARACTERS.map((char, index) => {
                      const isSelected = characterInput.toLowerCase() === char.name.toLowerCase();
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCharacterInput(char.name)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            isSelected 
                              ? "bg-amber-500/20 text-amber-200 border border-amber-400/40" 
                              : "bg-slate-900/35 text-indigo-300/80 border border-indigo-950 hover:bg-indigo-950/30 hover:text-indigo-200"
                          }`}
                        >
                          <span className="text-sm">{char.icon}</span>
                          <span>{char.name.length > 24 ? char.name.substring(0, 24) + "..." : char.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Curated Theme Box */}
            <div className="bg-indigo-950/20 backdrop-blur-xl border border-indigo-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <BookMarked className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-base font-serif font-bold text-amber-100">3. Select Bedtime Theme</h3>
              </div>

              {/* Grid of beautiful icons */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {CURATED_THEMES.map((theme) => {
                    const isSelected = selectedThemeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedThemeId(theme.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-[105px] overflow-hidden ${
                          isSelected 
                            ? `bg-gradient-to-br ${theme.color} ring-1 ring-amber-400/60 scale-[1.02] shadow-md shadow-slate-950`
                            : "bg-slate-900/40 text-indigo-200 border-indigo-950 hover:bg-indigo-950/30"
                        }`}
                      >
                        <div className="absolute top-0 right-0 p-1 font-sans text-2xl filter drop-shadow-md select-none opacity-80">
                          {theme.icon}
                        </div>
                        
                        <span className="text-xs font-black text-amber-200 mt-1 block tracking-wide line-clamp-1">
                          {theme.title}
                        </span>
                        
                        <p className="text-[10px] text-indigo-300/80 line-clamp-2 mt-auto leading-normal">
                          {theme.moral}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Moral selector */}
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedThemeId("custom")}
                    className={`w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                      selectedThemeId === "custom"
                        ? "bg-slate-900 text-amber-200 border-amber-400/40 ring-1 ring-amber-400/40"
                        : "bg-slate-900/25 text-indigo-300/80 border-indigo-950 hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✍️</span>
                      <span>Weave a Custom Lesson or Message</span>
                    </div>
                    {selectedThemeId !== "custom" && <Plus className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>

                  {selectedThemeId === "custom" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2.5 overflow-hidden"
                    >
                      <input
                        type="text"
                        maxLength={80}
                        value={customThemeText}
                        onChange={(e) => setCustomThemeText(e.target.value)}
                        placeholder="e.g. overcoming fear of dark lights or being tidy"
                        className="w-full bg-slate-900 border border-amber-400/30 px-3.5 py-2.5 rounded-xl text-xs text-amber-100 placeholder-indigo-300/40 focus:outline-none focus:border-amber-400/60 font-medium"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm flex gap-2">
                <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Generate story button */}
            <button
              onClick={handleGenerateStory}
              disabled={loading || !childName.trim()}
              className="w-full relative overflow-hidden group py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 font-serif font-black text-slate-950 hover:from-amber-300 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 text-center active:scale-95 cursor-pointer z-10"
            >
              <div className="absolute inset-0 bg-white/25 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-2 text-base tracking-wide">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Weave Bedtime Lullaby Story</span>
              </div>
            </button>

          </section>

          {/* Right panel: Active magical storybook display (7 cols) */}
          <section className="lg:col-span-7 h-full flex flex-col">
            
            <div className="bg-indigo-950/15 backdrop-blur-md border border-indigo-900/35 rounded-3xl shadow-2xl flex-grow overflow-hidden relative flex flex-col min-h-[580px]">
              
              {/* Starry Night Mode Toggle inside book header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-950/40 bg-indigo-950/20">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                  <span className="text-xs uppercase tracking-widest text-indigo-200 font-extrabold font-serif">Storybook Canopy</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDreamMode(!isDreamMode)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                      isDreamMode 
                        ? "bg-amber-400/20 border-amber-300 text-amber-200 shadow-md animate-pulse" 
                        : "bg-slate-950 text-indigo-300 border-indigo-900/40 hover:bg-indigo-950/50"
                    }`}
                    title="Toggle cozy fullscreen sleeping animation"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{isDreamMode ? "DREAM MODE ACTIVE" : "STARRY DREAM MODE"}</span>
                  </button>
                </div>
              </div>

              {/* Loader container */}
              {loading ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-slate-950/50">
                  <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
                    {/* Animated sleeping moon */}
                    <div className="absolute inset-0 rounded-full border-4 border-amber-400/10 border-t-amber-400 animate-spin" />
                    <Moon className="w-10 h-10 text-amber-300 fill-amber-300/10 animate-float-slow absolute" strokeWidth={1} />
                    <Sparkles className="w-5 h-5 text-yellow-200 absolute top-2 right-2 animate-pulse" />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMsgIdx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5 }}
                      className="text-amber-100/90 font-serif text-lg italic max-w-sm tracking-wide"
                    >
                      {COZY_LOADING_MESSAGES[loadingMsgIdx]}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-indigo-400/60 text-xs mt-3">Whispering to Gemini-3.5-Flash generator...</p>
                </div>
              ) : activeStory ? (
                /* Dynamic Loaded Book Body */
                <div className="flex-grow flex flex-col">
                               {/* Floating configuration header inside active story display */}
                  <div className="px-6 py-3 bg-indigo-950/30 border-b border-indigo-950/40 flex items-center justify-between gap-4">
                    
                    {/* Story status indicator */}
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs text-indigo-200 font-medium">
                        Reading theme: <span className="text-amber-200 font-extrabold capitalize">{activeStory.profile.theme.split(" (")[0]}</span>
                      </span>
                    </div>

                    {/* Font size configuration */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-indigo-950 rounded-xl p-1">
                      <span className="text-[9px] text-indigo-400/80 font-bold px-1.5 py-0.5 uppercase tracking-wider">Font:</span>
                      <button
                        type="button"
                        onClick={() => setFontSize("md")}
                        className={`text-[11px] font-bold px-2 py-1 rounded-md transition-colors ${fontSize === "md" ? "bg-amber-400 text-slate-900" : "text-indigo-300/80 hover:bg-indigo-950/30"}`}
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSize("lg")}
                        className={`text-[13px] font-bold px-2 py-0.5 rounded-md transition-colors ${fontSize === "lg" ? "bg-amber-400 text-slate-900" : "text-indigo-300/80 hover:bg-indigo-950/30"}`}
                      >
                        A+
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSize("xl")}
                        className={`text-[15px] font-bold px-2 py-0.5 rounded-md transition-colors ${fontSize === "xl" ? "bg-amber-400 text-slate-900" : "text-indigo-300/80 hover:bg-indigo-950/30"}`}
                      >
                        A++
                      </button>
                    </div>

                  </div>

                  {/* Curated scrollable book container */}
                  <div className="flex-grow p-6 md:p-10 max-h-[450px] overflow-y-auto bg-slate-950/45 relative select-text">
                    
                    {/* Visual Gold Crown Ornament */}
                    <div className="flex justify-center mb-4">
                      <div className="flex items-center gap-1 text-amber-400/30">
                        <span className="h-[1px] w-6 bg-amber-400/20" />
                        <Sparkle className="w-3.5 h-3.5" />
                        <Moon className="w-3.5 h-3.5" />
                        <Sparkle className="w-3.5 h-3.5" />
                        <span className="h-[1px] w-6 bg-amber-400/20" />
                      </div>
                    </div>

                    <article className="prose prose-invert max-w-none">
                      {renderStoryContent(activeStory.text)}
                    </article>

                    {/* Progress indicator */}
                    <div className="flex justify-center mt-10">
                      <div className="flex items-center gap-1 text-amber-400/30">
                        <span className="h-[1px] w-12 bg-amber-400/20" />
                        <span className="text-[10px] tracking-widest uppercase font-serif font-bold text-amber-400/40">Sleepy dreams await</span>
                        <span className="h-[1px] w-12 bg-amber-400/20" />
                      </div>
                    </div>
                  </div>

                  {/* Memory Save & Ratings Form footer */}
                  <div className="p-5 border-t border-indigo-950/50 bg-indigo-950/25">
                    
                    {/* Already saved ribbon check */}
                    {activeStory.id.startsWith("transient_") ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-amber-400/80 font-black block">Log this Bedtime memory</span>
                            <span className="text-xs text-indigo-200">Rate and log personal memories to add onto your bookshelf!</span>
                          </div>
                          
                          {/* Stars inputs */}
                          <div className="flex items-center gap-1 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-indigo-950">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setRatingInput(i + 1)}
                                className="p-0.5"
                              >
                                <Star 
                                  className={`w-4 h-4 ${
                                    i < ratingInput ? "text-amber-300 fill-amber-300/20" : "text-indigo-900"
                                  }`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Story personal memo input notes */}
                        <div className="flex gap-2.5 items-end">
                          <input
                            type="text"
                            maxLength={80}
                            value={parentNotes}
                            onChange={(e) => setParentNotes(e.target.value)}
                            placeholder="Add a sweet sleepy log (e.g., 'Loved by Leo with the galaxy drawing')"
                            className="flex-grow bg-slate-900 border border-indigo-950 px-3.5 py-2.5 rounded-xl text-xs text-indigo-100 placeholder-indigo-300/40 focus:outline-none focus:border-amber-400/40"
                          />

                          <button
                            onClick={handleAddToBookshelf}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save to Bookshelf</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4 bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/10 animate-pulse" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-emerald-300 block">Bedtime Story Saved Safely!</span>
                            <span className="text-[10px] text-indigo-300/80">Stored on your local bookshelf. Rating: {activeStory.rating} 🌟</span>
                          </div>
                        </div>
                        
                        {activeStory.notes && (
                          <div className="max-w-[200px] text-right italic text-[10px] text-indigo-300/60 line-clamp-1 pr-2">
                            "{activeStory.notes}"
                          </div>
                        )}

                        <button
                          onClick={(e) => handleDeleteFromBookshelf(activeStory.id, e)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove from bookshelf"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                /* Book Embossed Placeholder (Zero state) */
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-slate-950/15">
                  <motion.div
                    className="relative w-44 h-56 rounded-2xl bg-gradient-to-br from-indigo-900/60 via-violet-950/70 to-slate-950 border-2 border-amber-400/30 flex items-center justify-center shadow-2xl relative mb-6 group cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Shadow underneath */}
                    <div className="absolute inset-x-4 -bottom-4 h-4 bg-black/40 blur-lg rounded-full" />
                    
                    {/* Ornate Gold border outlines mimicking real leather look */}
                    <div className="absolute inset-2 border border-dashed border-amber-400/20 rounded-xl pointer-events-none" />
                    
                    {/* Spine strip illustration */}
                    <div className="absolute top-0 bottom-0 left-3 w-[2px] bg-amber-400/20" />
                    <div className="absolute top-0 bottom-0 left-[15px] w-[1px] bg-amber-400/10" />

                    {/* Book center illustration */}
                    <div className="flex flex-col items-center gap-2 relative z-10 p-4">
                      <Sparkles className="w-10 h-10 text-amber-200 fill-amber-200/5 animate-pulse" strokeWidth={1} />
                      <span className="font-serif text-sm font-black text-amber-300 uppercase tracking-widest mt-2 block">
                        Magical Book
                      </span>
                      <span className="text-[9px] text-indigo-300/60 block uppercase font-mono">
                        Awaiting storyteller
                      </span>
                    </div>

                    {/* Tiny glowing bottom-corner stars */}
                    <Sparkle className="w-3.5 h-3.5 text-amber-300 absolute bottom-3 right-3 opacity-60 animate-bounce" />
                  </motion.div>

                  <h3 className="font-serif text-xl font-bold text-amber-100 mb-2">Weave a Custom Story Dream</h3>
                  <p className="text-sm text-indigo-300/80 max-w-sm leading-relaxed mb-6">
                    Enter your little hero's profile on the left. Tap companion options or randomize values, specify positive themes, and let Gemini construct magical comforting tales.
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-400/5 px-3 py-1.5 rounded-full border border-amber-400/10">
                    <Info className="w-3.5 h-3.5" />
                    <span>Parents can plug devices into audio read-aloud systems</span>
                  </div>
                </div>
              )}

            </div>
          </section>

        </main>

        {/* Bottom panel: The Magical Bookshelf (Display past saved memories) */}
        <section className="mt-10 pt-8 border-t border-indigo-950/45">
          
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg md:text-xl font-serif font-bold text-amber-100">
                Your Magical Bookshelf
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/20">
                {savedStories.length} {savedStories.length === 1 ? "tale" : "tales"} saved
              </span>
            </div>
            
            {savedStories.length > 0 && (
              <span className="text-[11px] text-indigo-400 font-extrabold uppercase tracking-wide">
                Tap any book cover to re-read or list notes
              </span>
            )}
          </div>

          {savedStories.length === 0 ? (
            <div className="p-8 rounded-3xl bg-indigo-950/5 border border-indigo-950 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
              <BookMarked className="w-8 h-8 text-indigo-300/30 mb-3" />
              <h4 className="text-sm font-semibold text-indigo-200">The bookshelf is currently empty</h4>
              <p className="text-xs text-indigo-300/60 mt-1 max-w-xs leading-normal">
                Generated tales saved using the star logger will populate here on colorful vertical spine layouts.
              </p>
            </div>
          ) : (
            /* Immersive vertical upright book covers grid representing cozy bookshelf shelf */
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 rounded-3xl p-6 border border-indigo-950/40 shadow-inner relative overflow-hidden">
              
              {/* Wooden horizontal shelf partition line below book spines */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 relative z-10">
                {savedStories.map((story) => {
                  const isActive = activeStory && activeStory.id === story.id;
                  
                  return (
                    <div
                      key={story.id}
                      onClick={() => {
                        setActiveStory(story);
                        setRatingInput(story.rating || 5);
                        setParentNotes(story.notes || "");
                      }}
                      className={`cursor-pointer rounded-xl bg-gradient-to-br ${
                        story.coverColor || "from-amber-600 to-purple-800 border-amber-400/40"
                      } border p-4.5 h-[200px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-2.5 relative group shadow-lg ${
                        isActive ? "ring-2 ring-amber-400 scale-102 shadow-amber-500/10" : ""
                      }`}
                    >
                      {/* Spine decoration on left inside cover */}
                      <div className="absolute top-0 bottom-0 left-2.5 w-[1.5px] bg-black/30 pointer-events-none" />
                      <div className="absolute top-0 bottom-0 left-[11px] w-[0.5px] bg-black/10 pointer-events-none" />

                      {/* Golden decorative star corner ornaments */}
                      <div className="absolute top-2 right-2 flex gap-1 items-center">
                        {story.rating && (
                          <div className="flex gap-0.5 max-sm:hidden">
                            {Array.from({ length: story.rating }).map((_, st) => (
                              <Star key={st} className="w-2.5 h-2.5 text-amber-300 fill-amber-300/30" />
                            ))}
                          </div>
                        )}
                        <Heart className="w-3 h-3 text-red-400 fill-red-400/20" />
                      </div>

                      {/* Cover Title */}
                      <div className="mt-3">
                        <span className="block text-[8px] tracking-widest uppercase font-mono text-amber-200/60 leading-none">
                          Story of {story.profile.name} ({story.profile.age}y.o)
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-amber-100 line-clamp-3 mt-1.5 leading-snug tracking-wide group-hover:text-white transition-colors">
                          {story.title}
                        </h4>
                      </div>

                      {/* Cover meta details */}
                      <div className="mt-auto pt-2 border-t border-white/10 flex items-center justify-between gap-1 text-[9px] text-amber-200/80">
                        <span className="truncate max-w-[80px]">
                          {story.profile.character}
                        </span>
                        
                        {/* Quick Trash delete */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteFromBookshelf(story.id, e)}
                          className="p-1 rounded-md text-red-200/50 hover:text-red-300 hover:bg-black/20 transition-colors cursor-pointer"
                          title="Delete story memory"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shelf footer plank representation */}
              <div className="h-2 bg-gradient-to-r from-amber-900/60 via-amber-800/80 to-amber-900/60 border-t border-amber-700/35 rounded-full mt-6 shadow-md" />
            </div>
          )}

        </section>

      </div>

      {/* Immersive Starry Fullscreen Lullaby Dream Mode Overlay */}
      <AnimatePresence>
        {isDreamMode && activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-[999] p-6 flex flex-col justify-between select-none overflow-hidden"
          >
            {/* Drifting dreamy animated clouds backdrops */}
            <div className="absolute top-[20%] right-[-10px] w-64 h-24 bg-indigo-900/10 blur-xl animate-float-slow pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-20px] w-80 h-32 bg-sky-950/15 blur-2xl animate-float-slow pointer-events-none" style={{ animationDelay: "2s" }} />

            {/* Glowing Moon graphic floating inside Dream Mode */}
            <div className="absolute top-12 left-12 flex flex-col items-start gap-1">
              <div className="flex items-center gap-3">
                <Moon className="w-12 h-12 text-amber-300 fill-amber-300/10 animate-pulse" strokeWidth={1} />
                <div>
                  <h4 className="font-serif text-base font-semibold text-amber-100">{activeStory.title}</h4>
                  <span className="text-xs text-indigo-300/80 block">Soothing tales for {activeStory.profile.name}</span>
                </div>
              </div>
            </div>

            {/* Close fullscreen button */}
            <div className="absolute top-12 right-12 z-50">
              <button
                onClick={() => setIsDreamMode(false)}
                className="p-3 rounded-full bg-slate-900 border border-indigo-950 text-indigo-200 hover:text-white shadow-xl cursor-pointer"
                title="Exit Dream Canopy"
              >
                <Minimize className="w-5 h-5" />
              </button>
            </div>

            {/* Concentrated cozy center message */}
            <div className="my-auto max-w-2xl w-full mx-auto text-center px-4 flex flex-col items-center h-[70vh]">
              
              {/* Gentle ambient reading companion indicator */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400/20 to-purple-600/10 p-0.5 shadow-xl flex items-center justify-center animate-pulse mb-4">
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: "25s" }} />
              </div>

              <h2 className="font-serif text-2xl md:text-3xl font-black text-amber-200 tracking-wide mb-2">
                Dreamer Canopy Reader
              </h2>
              <p className="text-xs text-indigo-200/80 leading-relaxed max-w-md mb-6 antialiased">
                A warm, eye-safe fullscreen night projection. Lean back and read this magical story to your little one.
              </p>

              {/* Scrollable large story frame */}
              <div className="w-full flex-grow overflow-y-auto bg-slate-900/60 border border-indigo-950/50 rounded-3xl p-6 md:p-8 text-left select-text relative scrollbar-thin">
                <article className="prose prose-invert max-w-none">
                  {renderStoryContent(activeStory.text)}
                </article>
              </div>
            </div>

            {/* Drifting sheep or sleeping constellation footnote */}
            <div className="text-center pb-6">
              <span className="text-[10px] tracking-widest uppercase font-mono text-indigo-400/40">
                ⭐ Count the stars and enjoy your sweet sweet dreams ⭐
              </span>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
