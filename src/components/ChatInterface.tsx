import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your PNW hiking assistant. I can help you with trail recommendations, gear advice, weather conditions, and safety tips for hiking in Washington and Oregon. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // In development, use mock response
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: getMockResponse(inputText),
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setIsLoading(false);
        }, 1000);
      } else {
        // Production: call actual API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputText }),
        });

        const data = await response.json();
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const getMockResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('trail') || lowerInput.includes('hike')) {
      return "For PNW hiking, I'd recommend checking out Mount Rainier National Park for stunning alpine meadows, or the Olympic Peninsula for diverse ecosystems. Popular trails include Mount Pilchuck for great views, or Rattlesnake Ledge for a moderate day hike. What type of difficulty level are you looking for?";
    }
    
    if (lowerInput.includes('gear') || lowerInput.includes('equipment')) {
      return "Essential PNW hiking gear includes: waterproof rain jacket (it rains a lot!), sturdy hiking boots with good traction, layers for changing weather, headlamp, first aid kit, and plenty of water. Don't forget the 10 essentials! What specific gear questions do you have?";
    }
    
    if (lowerInput.includes('weather') || lowerInput.includes('season')) {
      return "PNW weather can be unpredictable! Summer (July-September) offers the best hiking conditions with less rain. Spring and fall can be beautiful but expect mud and possible snow at higher elevations. Always check current conditions and avalanche reports for alpine areas. What time of year are you planning to hike?";
    }
    
    if (lowerInput.includes('safety') || lowerInput.includes('bear') || lowerInput.includes('wildlife')) {
      return "PNW safety tips: Tell someone your plans, carry the 10 essentials, be bear aware (black bears are common), watch for cougars in some areas, and be prepared for sudden weather changes. Creek crossings can be dangerous during snowmelt. Always check trail conditions before heading out!";
    }
    
    return "That's a great question about PNW hiking! I can help with trail recommendations, gear advice, weather conditions, safety tips, and more. Could you be more specific about what you'd like to know?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about PNW hiking trails, gear, weather, or safety..."
          className="message-input"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || isLoading}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;