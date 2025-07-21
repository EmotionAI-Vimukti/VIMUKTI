import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('session_token'));

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setSessionToken(token);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('session_token');
      setSessionToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    localStorage.setItem('session_token', token);
    setSessionToken(token);
    fetchUserProfile(token);
  };

  const logout = () => {
    localStorage.removeItem('session_token');
    setSessionToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, sessionToken }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Logo Component
const VimuktiLogo = ({ className = "w-12 h-12" }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M30 20 Q50 10 70 20 Q80 50 70 80 Q50 90 30 80 Q20 50 30 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="animate-pulse"
      />
      <path
        d="M40 30 Q50 25 60 30 Q65 50 60 70 Q50 75 40 70 Q35 50 40 30 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
      />
    </svg>
  </div>
);

// Landing Page Component
const LandingPage = () => {
  const { login } = useAuth();
  
  const handleGoogleLogin = () => {
    window.location.href = `${API}/login/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <VimuktiLogo className="w-10 h-10 text-indigo-600" />
          <span className="text-2xl font-semibold text-gray-900">Vimukti</span>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="mb-8">
            <VimuktiLogo className="w-24 h-24 text-indigo-600 mx-auto mb-6" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Liberate Your Mind with
            <span className="block text-indigo-600 mt-2">AI-powered Emotional Wellness</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover emotional intelligence through compassionate AI guidance. Your journey to mental wellness starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGoogleLogin}
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-medium"
            >
              Start Your Journey
            </button>
            <button className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 text-lg font-medium">
              How It Works
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Your AI Emotional Companion</h2>
          <p className="text-xl text-gray-600">Intelligent features designed for your mental wellness journey</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Emotion-Aware Chat</h3>
            <p className="text-gray-600">Engage with an AI companion that understands your emotional state and provides personalized guidance.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mood Analytics</h3>
            <p className="text-gray-600">Track your emotional patterns over time with beautiful visualizations and insights.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personality Mapping</h3>
            <p className="text-gray-600">Discover your emotional archetype and receive personalized recommendations for growth.</p>
          </div>
        </div>
      </div>

      {/* Privacy & Compliance */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Privacy-First & Compliant</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-indigo-600 mb-2">HIPAA</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-2">DPDPA</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-2">GDPR</div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2">Ethical AI</div>
              <div className="text-sm text-gray-600">Guaranteed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Auth Callback Component
const AuthCallback = () => {
  const { login } = useAuth();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('session_token');
    
    if (sessionToken) {
      login(sessionToken);
      window.location.href = '/dashboard';
    }
  }, [login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <VimuktiLogo className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
        <p className="text-xl text-gray-600">Completing your sign in...</p>
      </div>
    </div>
  );
};

// Chat Interface Component
const ChatInterface = () => {
  const { user, sessionToken, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Create a new chat session when component mounts
    createNewSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewSession = async () => {
    try {
      const response = await axios.post(`${API}/chat/sessions`, {}, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      setCurrentSessionId(response.data.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSessionId) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        session_id: currentSessionId,
        message: inputMessage
      }, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <VimuktiLogo className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Vimukti</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src={user?.picture || '/api/placeholder/32/32'} alt={user?.name} className="w-8 h-8 rounded-full" />
              <span className="text-sm text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={createNewSession}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              New Chat
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <VimuktiLogo className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to your emotional wellness journey</h2>
                <p className="text-gray-600">I'm here to listen, understand, and support you. How are you feeling today?</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-6 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-2xl px-6 py-4 rounded-2xl bg-white text-gray-900 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="animate-bounce w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <div className="animate-bounce w-2 h-2 bg-indigo-600 rounded-full" style={{animationDelay: '0.1s'}}></div>
                    <div className="animate-bounce w-2 h-2 bg-indigo-600 rounded-full" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This AI is not a substitute for professional medical advice. Always consult healthcare providers for serious concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
  };

  const AppRouter = () => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
          <VimuktiLogo className="w-16 h-16 text-indigo-600 animate-pulse" />
        </div>
      );
    }

    if (currentRoute === '/auth/callback') {
      return <AuthCallback />;
    }

    if (!user) {
      return <LandingPage />;
    }

    if (currentRoute === '/dashboard' || currentRoute === '/') {
      return <ChatInterface />;
    }

    return <ChatInterface />;
  };

  return (
    <AuthProvider>
      <div className="App">
        <AppRouter />
      </div>
    </AuthProvider>
  );
};

export default App;