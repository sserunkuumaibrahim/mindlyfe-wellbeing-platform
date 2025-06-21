
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Search, Phone, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

interface Conversation {
  thread_id: string;
  other_user: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
    role: string;
  };
  last_message: Message;
  unread_count: number;
}

export const MessagingSystem: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToMessages();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.thread_id);
      markMessagesAsRead(selectedConversation.thread_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // This would typically be handled by an edge function for complex queries
      const { data, error } = await supabase.functions.invoke('get-conversations', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const markMessagesAsRead = async (threadId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      const messageData = {
        thread_id: selectedConversation.thread_id,
        sender_id: user.id,
        recipient_id: selectedConversation.other_user.id,
        content: newMessage.trim(),
        message_type: 'text',
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      // Message will be added via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          // Add new message to current conversation if it matches
          if (selectedConversation && payload.new.thread_id === selectedConversation.thread_id) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
          // Refresh conversations to update last message and unread count
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    `${conv.other_user.first_name} ${conv.other_user.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading messages...</div>;
  }

  return (
    <div className="h-[calc(100vh-200px)] flex">
      {/* Conversations List */}
      <Card className="w-1/3 mr-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Messages</span>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.thread_id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                  selectedConversation?.thread_id === conversation.thread_id 
                    ? 'bg-muted' 
                    : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.other_user.profile_photo_url} />
                    <AvatarFallback>
                      {conversation.other_user.first_name[0]}
                      {conversation.other_user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {conversation.other_user.first_name} {conversation.other_user.last_name}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge variant="default" className="ml-2">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {conversation.other_user.role}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.other_user.profile_photo_url} />
                    <AvatarFallback>
                      {selectedConversation.other_user.first_name[0]}
                      {selectedConversation.other_user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.other_user.first_name} {selectedConversation.other_user.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedConversation.other_user.role}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[500px]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
