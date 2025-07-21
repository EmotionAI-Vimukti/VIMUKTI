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

// Enhanced Logo Component
const VimuktiLogo = ({ className = "w-12 h-12" }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#6366f1',stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#8b5cf6',stopOpacity:1}} />
        </linearGradient>
      </defs>
      <path
        d="M30 20 Q50 10 70 20 Q80 50 70 80 Q50 90 30 80 Q20 50 30 20 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        className="animate-pulse-soft"
      />
      <path
        d="M40 30 Q50 25 60 30 Q65 50 60 70 Q50 75 40 70 Q35 50 40 30 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle cx="50" cy="50" r="8" fill="url(#logoGradient)" opacity="0.6" className="animate-pulse" />
    </svg>
  </div>
);

// Enhanced Landing Page
const LandingPage = () => {
  const { login } = useAuth();
  
  const handleGoogleLogin = () => {
    window.location.href = `${API}/login/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-gray-100/50">
        <div className="flex items-center space-x-3">
          <VimuktiLogo className="w-10 h-10" />
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Vimukti
          </span>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
        >
          Sign In with Google
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773" 
            alt="Peaceful meditation"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/90 via-white/80 to-purple-50/90"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="mb-8">
              <VimuktiLogo className="w-24 h-24 mx-auto mb-6" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Liberate Your Mind with
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                AI-powered Emotional Wellness
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience personalized AI therapy powered by advanced psychology. Your journey to emotional intelligence and mental wellness starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGoogleLogin}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-medium transform hover:scale-105"
              >
                Start Your Journey Free
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Personalized AI Therapy</h2>
          <p className="text-xl text-gray-600">Advanced psychological approaches tailored to your unique personality</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personality-Based AI</h3>
            <p className="text-gray-600 leading-relaxed">AI adapts to your zodiac traits, age, profession, and MBTI type for truly personalized conversations using advanced psychology frameworks.</p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Evidence-Based Methods</h3>
            <p className="text-gray-600 leading-relaxed">Combines CBT, DBT, MBCT, and Solution-Focused therapy techniques for comprehensive emotional support and growth.</p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h3>
            <p className="text-gray-600 leading-relaxed">HIPAA & DPDPA compliant with end-to-end encryption. Your emotional journey stays completely private and secure.</p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white/60 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Trusted by Thousands</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                95%
              </div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                HIPAA
              </div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-600">AI Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/reserve/YEc7WB6ASDydBTw6GDlF_antalya-beach-lulu.jpg" 
            alt="Peaceful sunset"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Mental Wellness?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands who have found emotional balance through personalized AI therapy
          </p>
          <button
            onClick={handleGoogleLogin}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold transform hover:scale-105"
          >
            Start Free Today
          </button>
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
      window.location.href = '/onboarding';
    }
  }, [login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <VimuktiLogo className="w-16 h-16 mx-auto mb-4 animate-pulse" />
        <p className="text-xl text-gray-600">Completing your sign in...</p>
      </div>
    </div>
  );
};

// Enhanced Onboarding Flow
const OnboardingFlow = () => {
  const { user, sessionToken, login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    zodiacSign: '',
    profession: '',
    personalityAnswers: {}
  });

  const personalityQuestions = [
    {
      id: 'energy',
      question: 'How do you prefer to recharge your energy?',
      options: [
        { value: 'solitude', label: 'Spending time alone or in quiet environments', type: 'I' },
        { value: 'social', label: 'Being around people and engaging socially', type: 'E' }
      ]
    },
    {
      id: 'information',
      question: 'How do you prefer to take in information?',
      options: [
        { value: 'details', label: 'Focus on facts, details, and present realities', type: 'S' },
        { value: 'patterns', label: 'Look for patterns, possibilities, and future potential', type: 'N' }
      ]
    },
    {
      id: 'decisions',
      question: 'How do you prefer to make decisions?',
      options: [
        { value: 'logic', label: 'Using logic, analysis, and objective criteria', type: 'T' },
        { value: 'values', label: 'Considering values, emotions, and impact on people', type: 'F' }
      ]
    },
    {
      id: 'lifestyle',
      question: 'How do you prefer to organize your life?',
      options: [
        { value: 'structured', label: 'Having things decided, planned, and organized', type: 'J' },
        { value: 'flexible', label: 'Staying open, flexible, and adaptable', type: 'P' }
      ]
    }
  ];

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePersonalityAnswer = (questionId, answer) => {
    setFormData(prev => ({
      ...prev,
      personalityAnswers: {
        ...prev.personalityAnswers,
        [questionId]: answer
      }
    }));
  };

  const calculateMBTI = () => {
    const answers = formData.personalityAnswers;
    let mbti = '';
    
    mbti += answers.energy?.type || 'E';
    mbti += answers.information?.type || 'S';
    mbti += answers.decisions?.type || 'T';
    mbti += answers.lifestyle?.type || 'J';
    
    return mbti;
  };

  const completeOnboarding = async () => {
    try {
      const mbtiType = calculateMBTI();
      const onboardingData = {
        user_id: user.id,
        responses: {
          ...formData,
          mbtiType,
          completedAt: new Date().toISOString()
        },
        personality_archetype: `${mbtiType} - ${getArchetypeName(mbtiType)}`
      };

      await axios.post(`${API}/onboarding`, onboardingData, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });

      // Update user context
      const updatedUser = { 
        ...user, 
        onboarding_completed: true, 
        personality_archetype: onboardingData.personality_archetype 
      };
      login(sessionToken); // This will refresh the user data
      
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  const getArchetypeName = (mbti) => {
    const archetypes = {
      'ENTJ': 'The Commander',
      'ENTP': 'The Debater',
      'ENFJ': 'The Protagonist',
      'ENFP': 'The Campaigner',
      'ESTJ': 'The Executive',
      'ESTP': 'The Entrepreneur',
      'ESFJ': 'The Consul',
      'ESFP': 'The Entertainer',
      'INTJ': 'The Architect',
      'INTP': 'The Thinker',
      'INFJ': 'The Advocate',
      'INFP': 'The Mediator',
      'ISTJ': 'The Logistician',
      'ISTP': 'The Virtuoso',
      'ISFJ': 'The Protector',
      'ISFP': 'The Adventurer'
    };
    return archetypes[mbti] || 'The Explorer';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tell us about yourself</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="form-input"
                placeholder="Enter your age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zodiac Sign</label>
              <select
                value={formData.zodiacSign}
                onChange={(e) => handleInputChange('zodiacSign', e.target.value)}
                className="form-input"
              >
                <option value="">Select your zodiac sign</option>
                {zodiacSigns.map(sign => (
                  <option key={sign} value={sign}>{sign}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                className="form-input"
                placeholder="What do you do for work?"
              />
            </div>
          </div>
        );
        
      case 2:
        const currentQuestion = personalityQuestions[currentStep - 2];
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-sm text-gray-500 mb-2">Personality Assessment - Question {currentStep - 1} of {personalityQuestions.length}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / personalityQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.question}</h2>
            <div className="space-y-4">
              {currentQuestion.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => handlePersonalityAnswer(currentQuestion.id, option)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    formData.personalityAnswers[currentQuestion.id]?.value === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 6:
        const mbti = calculateMBTI();
        return (
          <div className="text-center space-y-6">
            <VimuktiLogo className="w-20 h-20 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900">Your Personality Profile</h2>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {mbti}
              </div>
              <div className="text-xl text-gray-700 mb-4">{getArchetypeName(mbti)}</div>
              <p className="text-gray-600">
                Your AI companion will adapt its responses based on your unique personality traits, 
                zodiac characteristics, age, and professional background for the most personalized therapeutic experience.
              </p>
            </div>
          </div>
        );
        
      default:
        return renderStep();
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.name && formData.age && formData.zodiacSign && formData.profession;
    }
    if (currentStep >= 2 && currentStep <= 5) {
      const questionId = personalityQuestions[currentStep - 2]?.id;
      return formData.personalityAnswers[questionId];
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors"
            >
              Previous
            </button>
          )}
          
          {currentStep < 6 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ml-auto ${
                canProceed()
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === 5 ? 'Complete Assessment' : 'Next'}
            </button>
          ) : (
            <button
              onClick={completeOnboarding}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium ml-auto"
            >
              Start My Wellness Journey
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Chat Interface
const ChatInterface = () => {
  const { user, sessionToken, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
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
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <VimuktiLogo className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Vimukti
              </h1>
              <p className="text-xs text-gray-600">
                {user?.personality_archetype || 'Personalized AI Therapy'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src={user?.picture || '/api/placeholder/32/32'} 
                alt={user?.name} 
                className="w-8 h-8 rounded-full border-2 border-indigo-200" 
              />
              <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
            </div>
            <button
              onClick={createNewSession}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors text-sm font-medium"
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
                <VimuktiLogo className="w-16 h-16 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to your personalized therapy session
                </h2>
                <p className="text-gray-600 max-w-lg mx-auto">
                  I'm your AI companion, adapted to your {user?.personality_archetype?.split('-')[0] || 'unique'} personality. 
                  I combine evidence-based therapy methods with understanding of your individual traits. How are you feeling today?
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-6 py-4 rounded-2xl shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white message-user'
                      : 'bg-white text-gray-900 border border-gray-100 message-assistant'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
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

        {/* Enhanced Message Input */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 p-6 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This AI combines CBT, DBT, and MBCT approaches. Not a substitute for professional medical advice.
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

  const AppRouter = () => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <VimuktiLogo className="w-16 h-16 animate-pulse mx-auto mb-4" />
            <div className="text-lg text-gray-600">Loading your wellness journey...</div>
          </div>
        </div>
      );
    }

    if (currentRoute === '/auth/callback') {
      return <AuthCallback />;
    }

    if (!user) {
      return <LandingPage />;
    }

    if (currentRoute === '/onboarding' || !user.onboarding_completed) {
      return <OnboardingFlow />;
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