
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  role: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  is_read: boolean;
  message_type: string;
}

interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_photo?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export const EnhancedMessaging: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProfile();
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_uid', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadConversations = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_conversations', { user_id_param: profile.id });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profile.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', profile.id)
        .eq('is_read', false);

      loadConversations(); // Refresh unread counts
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !profile) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile.id,
          recipient_id: selectedConversation,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      loadMessages(selectedConversation);
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_url, role')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const startNewConversation = (userId: string) => {
    setSelectedConversation(userId);
    setShowNewChat(false);
    setSearchQuery('');
    setSearchResults([]);
    loadMessages(userId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedUser = conversations.find(c => c.other_user_id === selectedConversation);

  return (
    <div className="flex h-[600px] border rounded-lg">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <Button
              onClick={() => setShowNewChat(!showNewChat)}
              size="sm"
              variant="outline"
            >
              <Users className="w-4 h-4" />
            </Button>
          </div>
          
          {showNewChat && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
              
              {searchResults.length > 0 && (
                <ScrollArea className="h-32 border rounded">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => startNewConversation(user.id)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profile_photo_url} />
                        <AvatarFallback>
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.conversation_id}
              onClick={() => {
                setSelectedConversation(conversation.other_user_id);
                loadMessages(conversation.other_user_id);
              }}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedConversation === conversation.other_user_id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={conversation.other_user_photo} />
                  <AvatarFallback>
                    {conversation.other_user_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{conversation.other_user_name}</p>
                    {conversation.unread_count > 0 && (
                      <Badge variant="default" className="bg-blue-500">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(conversation.last_message_time).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedUser?.other_user_photo} />
                  <AvatarFallback>
                    {selectedUser?.other_user_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedUser?.other_user_name}</h3>
                  <p className="text-sm text-green-600">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === profile?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === profile?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === profile?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
