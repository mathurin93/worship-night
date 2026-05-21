import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  HelpCircle, 
  BookOpen, 
  Send, 
  Heart,
  Flame
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

// Your exact Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJjkL-5lqVYYrCeW700VQJQ2YwmOOlSKQ",
  authDomain: "praise-night.firebaseapp.com",
  projectId: "praise-night",
  storageBucket: "praise-night.firebasestorage.app",
  messagingSenderId: "71657438948",
  appId: "1:71657438948:web:56593b66c65a11843d36f1",
  measurementId: "G-R910LX6RZM"
};

// Initialize Firebase
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
        setAuthError("Action Required: Please enable 'Anonymous' sign-in in your Firebase Console (Authentication tab).");
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
    if (!newComment.trim()) return;
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
    if (!newQuestion.trim()) return;
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

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-950 border-b border-yellow-500/30 p-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Flame className="text-yellow-400 w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-yellow-400">
              PRAISE NIGHT
            </h1>
          </div>
        </div>
        
        {}
        {authError && (
          <div className="max-w-3xl mx-auto mt-4 mx-4 p-4 bg-red-950 border border-red-500 rounded-lg text-red-200 text-center text-sm md:text-base shadow-lg">
            ⚠️ <strong>{authError}</strong>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="max-w-3xl mx-auto mt-6 flex space-x-2 md:space-x-4">
          <button 
            onClick={() => setActiveTab('praise')}
            className={`flex-1 py-3 px-2 rounded-t-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'praise' ? 'bg-yellow-400 text-black' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Praise</span>
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-3 px-2 rounded-t-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'questions' ? 'bg-yellow-400 text-black' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            <span>Q & A</span>
          </button>
          <button 
            onClick={() => setActiveTab('devotion')}
            className={`flex-1 py-3 px-2 rounded-t-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'devotion' ? 'bg-yellow-400 text-black' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Devotion</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col">
        
        {/* PRAISE / COMMENTS TAB */}
        {activeTab === 'praise' && (
          <div className="flex flex-col h-full">
            <div className="mb-4 text-center">
              <h2 className="text-xl text-yellow-400 font-semibold">Share your praises and testimonies</h2>
              <p className="text-slate-400 text-sm">Posts appear live on the projector!</p>
            </div>
            
            <div className="flex-1 space-y-4 pb-24">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                  <Heart className="text-yellow-500 w-5 h-5 mb-2 inline-block mr-2" />
                  <span className="text-lg md:text-xl leading-relaxed">{comment.text}</span>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center text-slate-500 mt-10 italic">Be the first to share a praise!</div>
              )}
            </div>

            {/* Sticky Input Field */}
            <form onSubmit={handleCommentSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-800 flex justify-center">
              <div className="max-w-3xl w-full flex space-x-2">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a praise or testimony..." 
                  className="flex-1 bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 text-lg"
                />
                <button type="submit" className="bg-yellow-400 text-black px-6 rounded-lg font-bold hover:bg-yellow-300 transition-colors flex items-center justify-center">
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="flex flex-col h-full">
            <div className="mb-4 text-center">
              <h2 className="text-xl text-yellow-400 font-semibold">Ask an anonymous question</h2>
              <p className="text-slate-400 text-sm">Questions will be answered during the session.</p>
            </div>
            
            <div className="flex-1 space-y-4 pb-24">
              {questions.map((question) => (
                <div key={question.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg flex items-start">
                  <HelpCircle className="text-yellow-500 w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-lg md:text-xl leading-relaxed">{question.text}</span>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center text-slate-500 mt-10 italic">No questions yet. Ask away!</div>
              )}
            </div>

            {/* Sticky Input Field */}
            <form onSubmit={handleQuestionSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-800 flex justify-center">
              <div className="max-w-3xl w-full flex space-x-2">
                <input 
                  type="text" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask a question..." 
                  className="flex-1 bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 text-lg"
                />
                <button type="submit" className="bg-yellow-400 text-black px-6 rounded-lg font-bold hover:bg-yellow-300 transition-colors flex items-center justify-center">
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DEVOTION TAB */}
        {activeTab === 'devotion' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-8 mt-4">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center border-b border-slate-800 pb-4">What is True Praise?</h2>
            
            <div className="space-y-6 text-lg text-slate-200">
              <p>
                In the Bible, one of the primary Hebrew words for praise is <strong>Halal</strong> (הָלַל). It's where we get the word "Hallelujah." 
              </p>
              
              <div className="bg-black p-5 rounded-lg border border-yellow-500/30">
                <p className="italic text-yellow-100">
                  "Halal means to be clear, to shine, to boast, to show, to rave, to celebrate, and to be clamorously foolish."
                </p>
              </div>

              <p>
                Praise isn't just about singing quiet songs; it is a visible, audible, and sometimes radical declaration of how good God is. It's boasting about God's track record!
              </p>

              <h3 className="text-2xl font-bold text-yellow-400 pt-4">Psalm 100 (A Psalm for Giving Thanks)</h3>
              
              <blockquote className="border-l-4 border-yellow-400 pl-4 py-2 my-4 bg-slate-950/50 italic space-y-3">
                <p>1 Make a joyful noise to the LORD, all the earth!</p>
                <p>2 Serve the LORD with gladness! Come into his presence with singing!</p>
                <p>3 Know that the LORD, he is God! It is he who made us, and we are his; we are his people, and the sheep of his pasture.</p>
                <p>4 Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name!</p>
                <p>5 For the LORD is good; his steadfast love endures forever, and his faithfulness to all generations.</p>
              </blockquote>

              <h3 className="text-2xl font-bold text-yellow-400 pt-4">Personal Reflection</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>What has God done in your life recently that makes you want to boast about Him?</li>
                <li>How can you incorporate "Halal" (celebratory, outward praise) into your daily life this week?</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}