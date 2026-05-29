import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Send, 
  Heart,
  Zap,
  Mic,
  Sparkles,
  Trash2,
  Lock,
  X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// --- YOUR EXACT FIREBASE CONFIGURATION (RETAINED) ---
const firebaseConfig = {
  apiKey: "AIzaSyDJjkL-5lqVYYrCeW700VQJQ2YwmOOlSKQ",
  authDomain: "praise-night.firebaseapp.com",
  projectId: "praise-night",
  storageBucket: "praise-night.firebasestorage.app",
  messagingSenderId: "71657438948",
  appId: "1:71657438948:web:56593b66c65a11843d36f1",
  measurementId: "G-R910LX6RZM"
};
// -----------------------------------------------------

// Initialize Firebase using the provided configuration
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function App() {
  const [activeTab, setActiveTab] = useState('praise');
  const [comments, setComments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [userId, setUserId] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Security Gate & Reset States
  const [showResetModal, setShowResetModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Sign in anonymously so users can post without an account
    signInAnonymously(auth).then((userCredential) => {
      setUserId(userCredential.user.uid);
      setAuthError(null);
    }).catch((error) => {
      console.error("Auth Error:", error);
      if (error.code === 'auth/configuration-not-found') {
        setAuthError("Configuration Error: Ensure 'Anonymous' auth is enabled in your Firebase Console (Authentication > Sign-in method).");
      } else {
        setAuthError(error.message);
      }
    });

    // Listen for live Updates to Praises/Comments
    const qComments = query(collection(db, 'praises'), orderBy('createdAt', 'desc'));
    const unsubscribeComments = onSnapshot(qComments, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
    });

    // Listen for live Updates to Questions
    const qQuestions = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const unsubscribeQuestions = onSnapshot(qQuestions, (snapshot) => {
      const questionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(questionsData);
    });

    return () => {
      unsubscribeComments();
      unsubscribeQuestions();
    };
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;
    try {
      await addDoc(collection(db, 'praises'), {
        text: newComment,
        createdAt: serverTimestamp(),
        uid: userId
      });
      setNewComment('');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !userId) return;
    try {
      await addDoc(collection(db, 'questions'), {
        text: newQuestion,
        createdAt: serverTimestamp(),
        uid: userId
      });
      setNewQuestion('');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Secure Purging of both collection sets
  const handleAuthAndReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);

    if (passwordInput !== 'mathurin') {
      setResetError('INVALID SECURITY PASSPHRASE - ACCESS DENIED');
      return;
    }

    setIsResetting(true);
    try {
      const deletePromises = [];
      
      // Queue comments/praises deletions
      comments.forEach(comment => {
        deletePromises.push(deleteDoc(doc(db, 'praises', comment.id)));
      });

      // Queue questions deletions
      questions.forEach(question => {
        deletePromises.push(deleteDoc(doc(db, 'questions', question.id)));
      });

      await Promise.all(deletePromises);
      
      setResetSuccess(true);
      setPasswordInput('');
      
      // Auto-dismiss modal on complete
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess(false);
      }, 1500);

    } catch (error) {
      console.error("Database purge failed: ", error);
      setResetError('SYSTEM EXCEPTION - UNABLE TO OVERWRITE DATABASE');
    } finally {
      setIsResetting(false);
    }
  };

  // High contrast palette tailored specifically for projector settings
  const getAccentColor = () => {
    if (activeTab === 'praise') return 'neon-orange';
    if (activeTab === 'questions') return 'neon-pink';
    return 'neon-lime';
  };

  const accent = getAccentColor();

  return (
    // True pitch black screen backdrop to maximize readability and contrast
    <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col relative overflow-hidden">
      
      {/* Header - Transparent High-Contrast Glassmorphism */}
      <header className="bg-black/80 border-b border-white/20 p-4 md:p-5 sticky top-0 z-50 shadow-[0_10px_40px_rgba(0,0,0,1)]">
        <div className="w-[95%] max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Pulsing Luminous Icon */}
            <Zap className={`${accent === 'neon-orange' ? 'text-[#ff6a00] filter-orange-glow' : accent === 'neon-pink' ? 'text-[#ff007f] filter-pink-glow' : 'text-[#a3e635] filter-lime-glow'} w-8 h-8 md:w-14 md:h-14 animate-pulse`} />
            <h1 className={`text-xl md:text-5xl lg:text-7xl font-extrabold tracking-widest ${accent}-text uppercase`}>
              PRAISE NIGHT
            </h1>
          </div>
          
          {/* Action Tools & Pulse Indicator */}
          <div className="flex items-center space-x-3 md:space-x-6">
            <button
              onClick={() => {
                setShowResetModal(true);
                setResetError('');
                setResetSuccess(false);
                setPasswordInput('');
              }}
              className="p-2 md:p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center group active:scale-95"
              title="Database Reset Console"
            >
              <Trash2 className="w-5 h-5 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
            </button>
            <div className={`w-3 h-3 md:w-6 md:h-6 rounded-full ${accent === 'neon-orange' ? 'bg-[#ff6a00] md:shadow-[0_0_15px_4px_rgba(255,106,0,0.8)]' : accent === 'neon-pink' ? 'bg-[#ff007f] md:shadow-[0_0_15px_4px_rgba(255,0,127,0.8)]' : 'bg-[#a3e635] md:shadow-[0_0_15px_4px_rgba(163,230,53,0.8)]'} animate-pulse`} />
          </div>
        </div>
        
        {/* Navigation Tabs - Refined to wrap beautifully on ultra-narrow portrait devices */}
        <div className="w-[95%] max-w-[1800px] mx-auto mt-4 md:mt-8 flex space-x-1.5 md:space-x-6 p-1 md:p-2 bg-zinc-950 rounded-2xl md:rounded-3xl border md:border-2 border-white/10">
          <button 
            onClick={() => setActiveTab('praise')}
            className={`flex-1 py-3 px-1 md:py-7 rounded-xl md:rounded-2xl font-extrabold flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 md:space-x-4 transition-all duration-300 active:scale-95 border md:border-2 ${
              activeTab === 'praise' 
              ? 'bg-[#ff6a00]/20 border-[#ff6a00] text-[#ff6a00] neon-orange-text' 
              : 'bg-zinc-900 text-zinc-400 border-transparent hover:border-zinc-700'
            }`}
          >
            <Mic className={`w-5 h-5 md:w-12 md:h-12 ${activeTab === 'praise' ? 'text-[#ff6a00] animate-dance' : 'text-zinc-400'}`} />
            <span className="text-[10px] sm:text-base md:text-3xl lg:text-4xl tracking-wider">PRAISES</span>
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-3 px-1 md:py-7 rounded-xl md:rounded-2xl font-extrabold flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 md:space-x-4 transition-all duration-300 active:scale-95 border md:border-2 ${
              activeTab === 'questions' 
              ? 'bg-[#ff007f]/20 border-[#ff007f] text-[#ff007f] neon-pink-text' 
              : 'bg-zinc-900 text-zinc-400 border-transparent hover:border-zinc-700'
            }`}
          >
            <HelpCircle className={`w-5 h-5 md:w-12 md:h-12 ${activeTab === 'questions' ? 'text-[#ff007f] animate-pulse-soft' : 'text-zinc-400'}`} />
            <span className="text-[10px] sm:text-base md:text-3xl lg:text-4xl tracking-wider">QUESTIONS</span>
          </button>
          <button 
            onClick={() => setActiveTab('devotion')}
            className={`flex-1 py-3 px-1 md:py-7 rounded-xl md:rounded-2xl font-extrabold flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 md:space-x-4 transition-all duration-300 active:scale-95 border md:border-2 ${
              activeTab === 'devotion' 
              ? 'bg-[#a3e635]/20 border-[#a3e635] text-[#a3e635] neon-lime-text' 
              : 'bg-zinc-900 text-zinc-400 border-transparent hover:border-zinc-700'
            }`}
          >
            <BookOpen className={`w-5 h-5 md:w-12 md:h-12 ${activeTab === 'devotion' ? 'text-[#a3e635] animate-float' : 'text-zinc-400'}`} />
            <span className="text-[10px] sm:text-base md:text-3xl lg:text-4xl tracking-wider">LEARN MORE</span>
          </button>
        </div>
      </header>

      {/* Main Content Area - WIDE SCREEN FOR LANDSCAPE PROJECTORS */}
      <main className="flex-1 w-[95%] max-w-[1800px] mx-auto p-4 md:p-8 flex flex-col z-10 relative">
        
        {/* PRAISES TAB */}
        {activeTab === 'praise' && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-6 md:mb-12 text-center animate-slide-down">
              <h2 className="text-2xl md:text-6xl text-[#ff6a00] font-black tracking-widest neon-orange-text uppercase">SHARE YOUR TESTIMONIES</h2>
              <p className="text-[#ffd0b0] font-extrabold text-sm md:text-3xl mt-2 tracking-wide">POSTS SYNC INSTANTLY ON THE PRIMARY DISPLAY</p>
            </div>
            
            <div className="flex-1 space-y-4 md:space-y-10 pb-32 md:pb-48">
              {comments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className="bg-zinc-950 p-4 md:p-12 rounded-2xl md:rounded-3xl border md:border-3 border-[#ff6a00]/40 hover:border-[#ff6a00] md:shadow-[0_0_35px_rgba(255,106,0,0.25)] shadow-none transition-all duration-300 flex items-center group opacity-0 animate-slide-up-fade"
                  style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
                >
                  <div className="mr-4 md:mr-10 p-3 md:p-6 rounded-full bg-orange-950/60 border border-[#ff6a00]/50 group-hover:scale-110 transition-transform">
                    <Heart className="text-[#ff6a00] w-6 h-6 md:w-14 md:h-14 md:filter-orange-glow" />
                  </div>
                  <span className="text-lg md:text-5xl lg:text-6xl leading-relaxed font-black text-[#facc15] neon-gold-text">
                    {comment.text}
                  </span>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center bg-zinc-950 p-10 md:p-24 rounded-2xl md:rounded-3xl border md:border-3 border-[#ff6a00]/20 text-orange-200/60 text-base md:text-4xl italic font-bold opacity-0 animate-slide-up-fade" style={{ animationFillMode: 'forwards' }}>
                  Awaiting testimonies. Be the first to share!
                </div>
              )}
            </div>

            {/* Input Form at Bottom */}
            <form onSubmit={handleCommentSubmit} className="fixed bottom-0 left-0 right-0 p-4 md:p-8 z-40 bg-black/95 border-t border-white/10">
              <div className="w-[95%] max-w-[1800px] mx-auto p-2.5 md:p-6 bg-zinc-950 border border-white/20 rounded-2xl md:rounded-3xl flex space-x-2 md:space-x-6">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a praise report..." 
                  className="flex-1 bg-black text-[#ffea80] border border-zinc-700 rounded-xl md:rounded-3xl px-4 md:px-10 py-3 md:py-8 focus:outline-none focus:border-[#ff6a00] text-sm md:text-3xl font-extrabold placeholder:text-zinc-600 focus:ring-2 focus:ring-[#ff6a00]/30"
                />
                <button type="submit" className="bg-[#ff6a00] text-black px-4 md:px-16 rounded-xl md:rounded-3xl font-black hover:bg-orange-400 text-sm md:text-3xl flex items-center justify-center group active:scale-95 transition-all">
                  <Send className="w-5 h-5 md:w-12 md:h-12 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-6 md:mb-12 text-center animate-slide-down">
              <h2 className="text-2xl md:text-6xl text-[#ff007f] font-black tracking-widest neon-pink-text uppercase">ASK ANONYMOUSLY</h2>
              <p className="text-[#ffd6e8] font-extrabold text-sm md:text-3xl mt-2 tracking-wide">QUERIES ARE DISPLAYED DIRECTLY TO THE HOST</p>
            </div>
            
            <div className="flex-1 space-y-4 md:space-y-10 pb-32 md:pb-48">
              {questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="bg-zinc-950 p-4 md:p-12 rounded-2xl md:rounded-3xl border md:border-3 border-[#ff007f]/40 hover:border-[#ff007f] md:shadow-[0_0_35px_rgba(255,0,127,0.25)] shadow-none transition-all duration-300 flex items-start group opacity-0 animate-slide-up-fade"
                  style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
                >
                  <div className="mr-4 md:mr-10 p-3 md:p-6 rounded-xl bg-pink-950/60 border border-[#ff007f]/50 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                    <HelpCircle className="text-[#ff007f] w-6 h-6 md:w-14 md:h-14 md:filter-pink-glow" />
                  </div>
                  <span className="text-lg md:text-5xl lg:text-6xl leading-relaxed font-black text-[#facc15] neon-gold-text">
                    {question.text}
                  </span>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center bg-zinc-950 p-10 md:p-24 rounded-2xl md:rounded-3xl border md:border-3 border-[#ff007f]/20 text-pink-200/60 text-base md:text-4xl italic font-bold opacity-0 animate-slide-up-fade" style={{ animationFillMode: 'forwards' }}>
                  Awaiting incoming questions. Ask away!
                </div>
              )}
            </div>

            {/* Input Form at Bottom */}
            <form onSubmit={handleQuestionSubmit} className="fixed bottom-0 left-0 right-0 p-4 md:p-8 z-40 bg-black/95 border-t border-white/10">
              <div className="w-[95%] max-w-[1800px] mx-auto p-2.5 md:p-6 bg-zinc-950 border border-white/20 rounded-2xl md:rounded-3xl flex space-x-2 md:space-x-6">
                <input 
                  type="text" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Pose an anonymous question..." 
                  className="flex-1 bg-black text-[#ffea80] border border-zinc-700 rounded-xl md:rounded-3xl px-4 md:px-10 py-3 md:py-8 focus:outline-none focus:border-[#ff007f] text-sm md:text-3xl font-extrabold placeholder:text-zinc-600 focus:ring-2 focus:ring-[#ff007f]/30"
                />
                <button type="submit" className="bg-[#ff007f] text-white px-4 md:px-16 rounded-xl md:rounded-3xl font-black hover:bg-pink-400 text-sm md:text-3xl flex items-center justify-center group active:scale-95 transition-all">
                  <Send className="w-5 h-5 md:w-12 md:h-12 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DEVOTION TAB */}
        {activeTab === 'devotion' && (
          <div className="bg-zinc-950 pt-12 pb-6 px-4 md:p-20 rounded-2xl md:rounded-3xl border md:border-4 border-[#a3e635] mb-8 mt-4 opacity-0 animate-slide-up-fade relative md:shadow-[0_0_50px_rgba(163,230,53,0.3)] shadow-none" style={{ animationFillMode: 'forwards' }}>
            {/* Projector System Details Header */}
            <div className="absolute top-3 right-4 text-[9px] md:text-2xl font-mono text-[#a3e635] tracking-widest font-extrabold neon-lime-text">WISDOM // LOG [0100]</div>
            
            <h2 className="text-xl md:text-7xl lg:text-8xl font-black text-[#a3e635] mt-2 mb-6 md:mb-12 text-center tracking-widest border-b-2 md:border-b-4 border-[#a3e635]/30 pb-4 md:pb-10 uppercase neon-lime-text">What is True Praise?</h2>
            
            <div className="space-y-6 md:space-y-16 text-sm md:text-4xl lg:text-5xl text-white leading-relaxed font-bold">
              <div className="flex items-start space-x-3 md:space-x-6">
                <span className="text-3xl md:text-8xl font-black text-[#a3e635] neon-lime-text leading-none">//</span>
                <p className="pt-1 md:pt-4">
                  In the Bible, one of the primary Hebrew words for praise is <strong className="text-[#a3e635] neon-lime-text">Halal</strong> (הָלַל). It's where we get the word "Hallelujah."
                </p>
              </div>
              
              <div className="bg-[#a3e635]/10 p-5 md:p-16 rounded-xl md:rounded-3xl border md:border-3 border-[#a3e635] relative overflow-hidden">
                <p className="italic text-[#facc15] text-base md:text-5xl lg:text-6xl relative z-10 leading-snug font-extrabold neon-gold-text">
                  "Halal means to be clear, to shine, to boast, to show, to rave, to celebrate, and to be clamorously foolish."
                </p>
              </div>

              <p className="text-zinc-200 font-semibold">
                Praise isn't just about singing quiet songs; it is a visible, audible, and sometimes radical declaration of how good God is. It's boasting about God's track record!
              </p>

              <h3 className="text-lg md:text-6xl font-black text-[#a3e635] pt-6 md:pt-12 tracking-wide flex items-center space-x-3 md:space-x-5 border-t border-zinc-800">
                <Zap className="text-[#a3e635] w-6 h-6 md:w-20 md:h-20 animate-pulse flex-shrink-0 md:filter-lime-glow" />
                <span className="neon-lime-text">PSALM 100 (A Psalm for Giving Thanks)</span>
              </h3>
              
              <blockquote className="border-l-4 md:border-l-12 border-[#a3e635] pl-4 md:pl-16 py-4 md:py-10 my-4 md:my-12 bg-zinc-900 rounded-r-xl md:rounded-r-3xl italic space-y-4 md:space-y-8 font-extrabold text-zinc-100 text-sm md:text-4xl lg:text-5xl md:shadow-[0_0_30px_rgba(163,230,53,0.15)] shadow-none">
                <p><strong className="text-[#a3e635] mr-2 md:mr-6 neon-lime-text">1</strong> Make a joyful noise to the LORD, all the earth!</p>
                <p><strong className="text-[#a3e635] mr-2 md:mr-6 neon-lime-text">2</strong> Serve the LORD with gladness! Come into his presence with singing!</p>
                <p><strong className="text-[#a3e635] mr-2 md:mr-6 neon-lime-text">3</strong> Know that the LORD, he is God! It is he who made us, and we are his; we are his people, and the sheep of his pasture.</p>
                <p><strong className="text-[#a3e635] mr-2 md:mr-6 neon-lime-text">4</strong> Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name!</p>
                <p><strong className="text-[#a3e635] mr-2 md:mr-6 neon-lime-text">5</strong> For the LORD is good; his steadfast love endures forever, and his faithfulness to all generations.</p>
              </blockquote>

              <h3 className="text-lg md:text-6xl font-black text-[#a3e635] pt-6 md:pt-12 tracking-wide flex items-center space-x-3 md:space-x-5 border-t border-zinc-800">
                <Sparkles className="text-[#a3e635] w-6 h-6 md:w-20 md:h-20 animate-pulse flex-shrink-0 md:filter-lime-glow" />
                <span className="neon-lime-text">PERSONAL REFLECTION</span>
              </h3>
              <ul className="list-disc pl-6 md:pl-20 space-y-4 md:space-y-8 text-zinc-200 text-base md:text-3xl">
                <li>What has God done in your life recently that makes you want to boast about Him?</li>
                <li>How can you incorporate "Halal" (celebratory, outward praise) into your daily life this week?</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* SECURITY OVERLAY MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border-4 border-[#ef4444] rounded-3xl p-6 md:p-12 md:shadow-[0_0_50px_rgba(239,68,68,0.4)] relative">
            
            <button 
              onClick={() => {
                setShowResetModal(false);
                setResetError('');
                setResetSuccess(false);
              }}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-red-950/60 border-2 border-red-500 mb-6 animate-pulse">
                <Lock className="w-10 h-10 md:w-16 md:h-16 text-[#ef4444]" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-[#ef4444] tracking-widest uppercase mb-4">
                SECURITY OVERRIDE
              </h2>
              <p className="text-zinc-400 text-lg md:text-2xl font-bold mb-8">
                AUTHORIZATION REQUIRED TO PURGE LIVE DATABASE
              </p>

              <form onSubmit={handleAuthAndReset} className="w-full space-y-6">
                <input 
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="ENTER SECURITY PASSPHRASE..."
                  disabled={isResetting || resetSuccess}
                  className="w-full bg-black text-center text-red-500 border-2 border-red-500/40 rounded-2xl px-6 py-5 focus:outline-none focus:border-[#ef4444] text-xl md:text-3xl font-extrabold tracking-widest placeholder:text-red-950 focus:ring-4 focus:ring-red-500/20"
                />

                {resetError && (
                  <div className="p-4 bg-red-950/80 border border-red-500 rounded-xl text-red-400 font-extrabold text-sm md:text-lg tracking-wide uppercase">
                    ❌ {resetError}
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-4 bg-green-950/80 border border-green-500 rounded-xl text-green-400 font-extrabold text-sm md:text-lg tracking-wide uppercase animate-pulse">
                    ✅ DATABASE PURGED SUCCESSFULLY
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetError('');
                      setResetSuccess(false);
                    }}
                    className="flex-1 py-4 md:py-6 rounded-2xl border-2 border-zinc-700 hover:border-white text-zinc-400 hover:text-white text-lg md:text-2xl font-black transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting || resetSuccess}
                    className="flex-1 py-4 md:py-6 rounded-2xl bg-[#ef4444] hover:bg-red-500 text-black text-lg md:text-2xl font-black tracking-wider transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isResetting ? 'PURGING...' : 'PURGE ALL'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Absolute maximum contrast projector text glow utility declarations */}
      <style>{`
        /* Default high-contrast colors (no text-shadow for ultra-crisp mobile displays) */
        .neon-orange-text {
          color: #ff6a00 !important;
        }
        .neon-pink-text {
          color: #ff007f !important;
        }
        .neon-lime-text {
          color: #a3e635 !important;
        }
        .neon-gold-text {
          color: #facc15 !important;
        }

        /* Ambient text glows optimized strictly for desktop screens (Projectors >= 768px) */
        @media (min-width: 768px) {
          .neon-orange-text {
            text-shadow: 0 0 10px rgba(255, 106, 0, 0.8), 0 0 20px rgba(255, 106, 0, 0.4);
          }
          .neon-pink-text {
            text-shadow: 0 0 10px rgba(255, 0, 127, 0.8), 0 0 20px rgba(255, 0, 127, 0.4);
          }
          .neon-lime-text {
            text-shadow: 0 0 10px rgba(163, 230, 53, 0.8), 0 0 20px rgba(163, 230, 53, 0.4);
          }
          .neon-gold-text {
            text-shadow: 0 0 10px rgba(250, 204, 21, 0.9), 0 0 20px rgba(250, 204, 21, 0.5);
          }
          
          /* Glow filter rendering for SVG icons */
          .filter-orange-glow {
            filter: drop-shadow(0px 0px 8px rgba(255,106,0,0.8));
          }
          .filter-pink-glow {
            filter: drop-shadow(0px 0px 8px rgba(255,0,127,0.8));
          }
          .filter-lime-glow {
            filter: drop-shadow(0px 0px 8px rgba(163,230,53,0.8));
          }
        }

        /* Border definition adjustment */
        .border-3 {
          border-width: 3px;
        }
        .border-l-12 {
          border-left-width: 12px;
        }

        /* Animations declarations */
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up-fade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dance {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-15deg) scale(1.15); }
          50% { transform: rotate(15deg) scale(1.15); }
          75% { transform: rotate(-15deg) scale(1.15); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up-fade { animation: slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-dance { animation: dance 1.2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }

        ::placeholder { color: #52525b !important; font-weight: 800; }
      `}</style>
    </div>
  );
}