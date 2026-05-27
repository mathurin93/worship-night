import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  HelpCircle, 
  BookOpen, 
  Send, 
  Heart,
  Zap,
  Mic,
  Sparkles
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
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

// Initialize Firebase using the provided external configuration
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

  // Utility to determine the accent color based on active tab
  const getAccentColor = () => {
    if (activeTab === 'praise') return 'cyan-400';
    if (activeTab === 'questions') return 'magenta-400';
    return 'yellow-400';
  };

  const accent = getAccentColor();

  return (
    // Futuristic Deep Blue/Purple space background
    <div className="min-h-screen bg-[#030014] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Subtle Background Glow/Nebula effect */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-950/30 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-950/20 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header - Holographic Glassmorphism */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 p-5 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="w-[95%] max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Pulsing Luminous Icon */}
            <Zap className={`text-${accent} w-9 h-9 md:w-12 md:h-12 animate-pulse`} />
            <h1 className={`text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-widest text-${accent}`}>
              PRAISE NIGHT
            </h1>
          </div>
          <div className={`w-3 h-3 md:w-5 md:h-5 rounded-full bg-${accent} shadow-[0_0_10px_3px_rgba(250,204,21,0.6)] animate-pulse`} />
        </div>
        
        {/* Error Notification Bar - Red Alert Glass */}
        {authError && (
          <div className="w-[95%] max-w-[1800px] mx-auto mt-4 p-4 bg-red-950/70 backdrop-blur-lg border border-red-500 rounded-xl text-red-100 text-center text-sm md:text-xl shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            ⚠️ <strong>CRITICAL CONFIG ERROR:</strong> {authError}
          </div>
        )}

        {/* Navigation Tabs - WIDE FOR LANDSCAPE / PROJECTOR */}
        <div className="w-[95%] max-w-[1800px] mx-auto mt-8 flex space-x-2 md:space-x-6 p-1 md:p-2 bg-black/40 rounded-3xl border border-white/5">
          <button 
            onClick={() => setActiveTab('praise')}
            className={`flex-1 py-4 px-2 md:py-6 rounded-2xl font-bold flex items-center justify-center space-x-2 md:space-x-4 transition-all duration-300 group active:scale-95 ${
              activeTab === 'praise' 
              ? 'bg-cyan-950/60 border border-cyan-500 text-cyan-200 shadow-[0_0_15px_-3px_rgba(34,211,238,0.5)]' 
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10 border border-transparent'
            }`}
          >
            <Mic className={`w-6 h-6 md:w-10 md:h-10 ${activeTab === 'praise' ? 'text-cyan-400 animate-dance' : 'group-hover:text-cyan-400'}`} />
            <span className="text-sm md:text-2xl lg:text-3xl">PRAISES</span>
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-4 px-2 md:py-6 rounded-2xl font-bold flex items-center justify-center space-x-2 md:space-x-4 transition-all duration-300 group active:scale-95 ${
              activeTab === 'questions' 
              ? 'bg-magenta-950/60 border border-magenta-500 text-magenta-200 shadow-[0_0_15px_-3px_rgba(236,72,153,0.5)]' 
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10 border border-transparent'
            }`}
          >
            <HelpCircle className={`w-6 h-6 md:w-10 md:h-10 ${activeTab === 'questions' ? 'text-magenta-400 animate-pulse-soft' : 'group-hover:text-magenta-400'}`} />
            <span className="text-sm md:text-2xl lg:text-3xl">QUESTIONS</span>
          </button>
          <button 
            onClick={() => setActiveTab('devotion')}
            className={`flex-1 py-4 px-2 md:py-6 rounded-2xl font-bold flex items-center justify-center space-x-2 md:space-x-4 transition-all duration-300 group active:scale-95 ${
              activeTab === 'devotion' 
              ? 'bg-yellow-950/60 border border-yellow-500 text-yellow-200 shadow-[0_0_15px_-3px_rgba(250,204,21,0.5)]' 
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10 border border-transparent'
            }`}
          >
            <BookOpen className={`w-6 h-6 md:w-10 md:h-10 ${activeTab === 'devotion' ? 'text-yellow-400 animate-float' : 'group-hover:text-yellow-400'}`} />
            <span className="text-sm md:text-2xl lg:text-3xl">LEARN MORE</span>
          </button>
        </div>
      </header>

      {/* Main Content Area - WIDE WIDTH FOR PROJECTOR */}
      <main className="flex-1 w-[95%] max-w-[1800px] mx-auto p-5 md:p-8 flex flex-col z-10 relative">
        
        {/* PRAISE / COMMENTS TAB - Glowing Cyan Glass */}
        {activeTab === 'praise' && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-6 md:mb-12 text-center animate-slide-down">
              <h2 className="text-2xl md:text-5xl text-cyan-400 font-extrabold tracking-wide">SHARE YOUR TESTIMONIES</h2>
              <p className="text-slate-400 text-base md:text-2xl mt-2">Posts reflect live on the holographic main screen.</p>
            </div>
            
            {}
            <div className="flex-1 space-y-6 md:space-y-10 pb-36 md:pb-48">
              {comments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className="bg-white/5 backdrop-blur-sm p-6 md:p-10 rounded-2xl md:rounded-3xl border border-cyan-500/20 hover:border-cyan-400/60 shadow-[0_0_30px_-5px_rgba(34,211,238,0.2)] transition-all duration-300 flex items-center group hover:-translate-y-1 opacity-0 animate-slide-up-fade"
                  style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
                >
                  <div className="mr-5 md:mr-8 p-3 md:p-5 rounded-full bg-cyan-950/50 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                    <Heart className="text-cyan-400 w-7 h-7 md:w-12 md:h-12" />
                  </div>
                  {/* PROJECTOR ENHANCED ENORMOUS GOLD TEXT */}
                  <span className="text-xl md:text-4xl lg:text-5xl leading-relaxed font-bold text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {comment.text}
                  </span>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center bg-white/5 backdrop-blur-sm p-10 md:p-16 rounded-3xl border border-cyan-500/20 text-slate-500 md:text-3xl mt-10 italic opacity-0 animate-slide-up-fade" style={{ animationFillMode: 'forwards' }}>
                  Be the catalyst. Share the first praise report.
                </div>
              )}
            </div>

            {/* Sticky Input Field - Cyan Floating Glass */}
            <form onSubmit={handleCommentSubmit} className="fixed bottom-0 left-0 right-0 p-5 md:p-8 z-40 animate-slide-up">
              <div className="w-[95%] max-w-[1800px] mx-auto p-4 md:p-6 bg-[#030014]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_0px_rgba(0,0,0,0.8)] flex space-x-3 md:space-x-6">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a celebratory praise report..." 
                  className="flex-1 bg-white/5 text-yellow-100 border border-white/10 rounded-2xl md:rounded-3xl px-4 md:px-8 py-4 md:py-8 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_2px_rgba(34,211,238,0.3)] text-lg md:text-3xl transition-all placeholder:text-slate-500"
                />
                <button type="submit" className="bg-cyan-500 text-black px-6 md:px-12 rounded-2xl md:rounded-3xl font-bold hover:bg-cyan-400 hover:shadow-[0_0_20px_5px_rgba(34,211,238,0.5)] transition-all flex items-center justify-center group active:scale-90">
                  <Send className="w-6 h-6 md:w-10 md:h-10 group-hover:rotate-12 transition-transform group-active:translate-x-1 group-active:-translate-y-1" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QUESTIONS TAB - Glowing Magenta Glass */}
        {activeTab === 'questions' && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-6 md:mb-12 text-center animate-slide-down">
              <h2 className="text-2xl md:text-5xl text-magenta-400 font-extrabold tracking-wide">ASK ANONYMOUSLY</h2>
              <p className="text-slate-400 text-base md:text-2xl mt-2">Queries will be highlighted during the interactive session.</p>
            </div>
            
            {}
            <div className="flex-1 space-y-6 md:space-y-10 pb-36 md:pb-48">
              {questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="bg-white/5 backdrop-blur-sm p-6 md:p-10 rounded-2xl md:rounded-3xl border border-magenta-500/20 hover:border-magenta-400/60 shadow-[0_0_30px_-5px_rgba(236,72,153,0.2)] transition-all duration-300 flex items-start hover:-translate-y-1 group opacity-0 animate-slide-up-fade"
                  style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
                >
                  <div className="mr-5 md:mr-8 p-3 md:p-5 rounded-xl bg-magenta-950/50 border border-magenta-500/30 flex-shrink-0 mt-1 md:mt-2 group-hover:scale-110 transition-transform">
                    <HelpCircle className="text-magenta-400 w-7 h-7 md:w-12 md:h-12" />
                  </div>
                  {/* PROJECTOR ENHANCED ENORMOUS GOLD TEXT */}
                  <span className="text-xl md:text-4xl lg:text-5xl leading-relaxed font-bold text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {question.text}
                  </span>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center bg-white/5 backdrop-blur-sm p-10 md:p-16 rounded-3xl border border-magenta-500/20 text-slate-500 md:text-3xl mt-10 italic opacity-0 animate-slide-up-fade" style={{ animationFillMode: 'forwards' }}>
                  System Idle. Awaiting user interaction. Ask away!
                </div>
              )}
            </div>

            {/* Sticky Input Field - Magenta Floating Glass */}
            <form onSubmit={handleQuestionSubmit} className="fixed bottom-0 left-0 right-0 p-5 md:p-8 z-40 animate-slide-up">
              <div className="w-[95%] max-w-[1800px] mx-auto p-4 md:p-6 bg-[#030014]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_0px_rgba(0,0,0,0.8)] flex space-x-3 md:space-x-6">
                <input 
                  type="text" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Pose a digital inquiry..." 
                  className="flex-1 bg-white/5 text-yellow-100 border border-white/10 rounded-2xl md:rounded-3xl px-4 md:px-8 py-4 md:py-8 focus:outline-none focus:border-magenta-400 focus:shadow-[0_0_20px_2px_rgba(236,72,153,0.3)] text-lg md:text-3xl transition-all placeholder:text-slate-500"
                />
                <button type="submit" className="bg-magenta-500 text-white px-6 md:px-12 rounded-2xl md:rounded-3xl font-bold hover:bg-magenta-400 hover:shadow-[0_0_20px_5px_rgba(236,72,153,0.5)] transition-all flex items-center justify-center group active:scale-90">
                  <Send className="w-6 h-6 md:w-10 md:h-10 group-hover:rotate-12 transition-transform group-active:translate-x-1 group-active:-translate-y-1" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DEVOTION TAB - Scaled up for Projector */}
        {activeTab === 'devotion' && (
          <div className="bg-white/5 backdrop-blur-md p-8 md:p-16 rounded-3xl border border-yellow-500/30 mb-8 mt-6 opacity-0 animate-slide-up-fade relative shadow-[0_0_40px_0px_rgba(250,204,21,0.15)]" style={{ animationFillMode: 'forwards' }}>
            {/* Aesthetic digital details */}
            <div className="absolute top-6 right-6 text-sm md:text-xl font-mono text-yellow-500/50 tracking-widest">WISDOM // LOG [0100]</div>
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-yellow-400 mb-10 text-center tracking-widest border-b border-yellow-500/20 pb-8 uppercase">What is True Praise?</h2>
            
            {}
            <div className="space-y-10 md:space-y-16 text-xl md:text-3xl lg:text-4xl text-slate-100 leading-relaxed font-light">
              <div className="flex items-start md:items-center space-x-6">
                <span className="text-5xl md:text-7xl font-extrabold text-yellow-500/60 mt-1 md:mt-0">//</span>
                <p>
                  In the Bible, one of the primary Hebrew words for praise is <strong className="text-yellow-200">Halal</strong> (הָלַל). It's where we get the word "Hallelujah."
                </p>
              </div>
              
              <div className="bg-black/40 p-8 md:p-12 rounded-3xl border border-yellow-500/30 relative overflow-hidden group">
                <div className="absolute -inset-1 bg-yellow-500/5 blur-lg group-hover:bg-yellow-500/10 transition-all" />
                <p className="italic text-yellow-100 text-2xl md:text-4xl lg:text-5xl relative z-10 leading-snug">
                  "Halal means to be clear, to shine, to boast, to show, to rave, to celebrate, and to be clamorously foolish."
                </p>
              </div>

              <p className="text-yellow-50">
                Praise isn't just about singing quiet songs; it is a visible, audible, and sometimes radical declaration of how good God is. It's boasting about God's track record!
              </p>

              <h3 className="text-3xl md:text-5xl font-extrabold text-yellow-400 pt-10 tracking-wide flex items-center space-x-4">
                <Zap className="text-yellow-400 w-10 h-10 md:w-14 md:h-14 animate-pulse-soft flex-shrink-0" />
                <span>PSALM 100 (A Psalm for Giving Thanks)</span>
              </h3>
              
              <blockquote className="border-l-8 border-yellow-400 pl-8 md:pl-12 py-8 my-10 bg-yellow-950/20 rounded-r-3xl italic space-y-6 font-normal text-yellow-50 text-2xl md:text-4xl shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                <p><strong className="text-yellow-400 mr-4">1</strong> Make a joyful noise to the LORD, all the earth!</p>
                <p><strong className="text-yellow-400 mr-4">2</strong> Serve the LORD with gladness! Come into his presence with singing!</p>
                <p><strong className="text-yellow-400 mr-4">3</strong> Know that the LORD, he is God! It is he who made us, and we are his; we are his people, and the sheep of his pasture.</p>
                <p><strong className="text-yellow-400 mr-4">4</strong> Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name!</p>
                <p><strong className="text-yellow-400 mr-4">5</strong> For the LORD is good; his steadfast love endures forever, and his faithfulness to all generations.</p>
              </blockquote>

              <h3 className="text-3xl md:text-5xl font-extrabold text-yellow-400 pt-10 tracking-wide flex items-center space-x-4">
                <Sparkles className="text-yellow-400 w-10 h-10 md:w-14 md:h-14 animate-pulse-soft flex-shrink-0" />
                <span>PERSONAL REFLECTION</span>
              </h3>
              <ul className="list-disc pl-10 md:pl-14 space-y-6 text-slate-300">
                <li>What has God done in your life recently that makes you want to boast about Him?</li>
                <li>How can you incorporate "Halal" (celebratory, outward praise) into your daily life this week?</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {}
      {/* Global CSS for subtle animation fixes */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up-fade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dance {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-12deg) scale(1.15); }
          50% { transform: rotate(12deg) scale(1.15); }
          75% { transform: rotate(-12deg) scale(1.15); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up-fade { animation: slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-dance { animation: dance 1.2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }

        ::placeholder { color: #64748b !important; font-weight: 300; }
        /* Add Magenta to tailwind's palette on the fly */
        .text-magenta-400 { color: #ec4899; }
        .bg-magenta-500 { background-color: #ec4899; }
        .bg-magenta-950\\/60 { background-color: rgba(131, 24, 67, 0.6); }
        .border-magenta-500 { border-color: #ec4899; }
        .border-magenta-500\\/20 { border-color: rgba(236, 72, 153, 0.2); }
        .border-magenta-400\\/60 { border-color: rgba(236, 72, 153, 0.6); }
        .text-magenta-200 { color: #fbcfe8; }
        .shadow-\\[0_0_15px_-3px_rgba\\(236\\,72\\,153\\,0\\.5\\)\\] { --tw-shadow: 0 0 15px -3px rgba(236,72,153,0.5); box-shadow: var(--tw-shadow); }
        .shadow-\\[0_0_30px_-5px_rgba\\(236\\,72\\,153\\,0\\.2\\)\\] { --tw-shadow: 0 0 30px -5px rgba(236,72,153,0.2); box-shadow: var(--tw-shadow); }
        .focus\\:border-magenta-400:focus { border-color: #ec4899; }
        .focus\\:shadow-\\[0_0_20px_2px_rgba\\(236\\,72\\,153\\,0\\.3\\)\\]:focus { --tw-shadow: 0 0 20px 2px rgba(236,72,153,0.3); box-shadow: var(--tw-shadow); }
        .hover\\:shadow-\\[0_0_20px_5px_rgba\\(236\\,72\\,153\\,0\\.5\\)\\]:hover { --tw-shadow: 0 0 20px 5px rgba(236,72,153,0.5); box-shadow: var(--tw-shadow); }
        .hover\\:border-magenta-400\\/60:hover { border-color: rgba(236, 72, 153, 0.6); }
        .group-hover\\:text-magenta-400 { color: #ec4899; }
      `}</style>
    </div>
  );
}