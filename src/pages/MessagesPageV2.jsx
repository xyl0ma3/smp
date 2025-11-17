import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Paperclip, Smile } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { supabase } from '../supabase'
import Card from '../components/base/Card'
import AvatarBase from '../components/base/AvatarBase'
import Input from '../components/base/Input'
import Button from '../components/base/Button'

export default function MessagesPageV2() {
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const { user } = useAuth()
  
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    }
  }, [conversationId])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*, participants(*), last_message:messages(content, created_at)')
        .or(`participants.any(user_id.eq.${user.id})`)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      setConversations(data || [])
      
      if (data?.length > 0 && !conversationId) {
        setActiveConversation(data[0])
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users(*)')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setMessages(data || [])
      
      // Mark as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', convId)
        .eq('recipient_id', user.id)
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!messageText.trim() || !activeConversation) return
    
    try {
      setSending(true)
      
      // Get the other participant
      const otherParticipant = activeConversation.participants.find(
        p => p.user_id !== user.id
      )
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation.id,
          sender_id: user.id,
          recipient_id: otherParticipant.user_id,
          content: messageText
        })
        .select()
      
      if (error) throw error
      
      setMessages(prev => [...prev, { ...data[0], sender: user }])
      setMessageText('')
      
      // Update conversation
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversation.id)
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.user_id !== user.id)
  }

  return (
    <div className="h-screen bg-neutral-950 text-white flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-full md:w-80 border-r border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Mensajes</span>
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-neutral-400">
              <p>Sin conversaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {conversations.map((conversation) => {
                const other = getOtherParticipant(conversation)
                const isActive = activeConversation?.id === conversation.id
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setActiveConversation(conversation)
                      fetchMessages(conversation.id)
                    }}
                    className={`w-full p-4 transition text-left ${
                      isActive
                        ? 'bg-primary/10 border-l-2 border-primary'
                        : 'hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex gap-3">
                      <AvatarBase
                        src={other?.avatar_url}
                        name={other?.username}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{other?.username}</p>
                        <p className="text-neutral-400 text-sm truncate">
                          {conversation.last_message?.[0]?.content || 'Sin mensajes'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <AvatarBase
                  src={getOtherParticipant(activeConversation)?.avatar_url}
                  name={getOtherParticipant(activeConversation)?.username}
                  size="md"
                />
                <div>
                  <p className="font-semibold">
                    {getOtherParticipant(activeConversation)?.username}
                  </p>
                  <p className="text-neutral-400 text-sm">@{getOtherParticipant(activeConversation)?.username}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  <p>Comienza la conversación</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender_id === user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-primary text-white'
                          : 'bg-neutral-800 text-neutral-100'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user.id
                          ? 'text-primary/70'
                          : 'text-neutral-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="bg-neutral-900 border-t border-neutral-800 p-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-neutral-800 transition text-neutral-400 hover:text-white"
                >
                  <Paperclip size={20} />
                </button>
                
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-neutral-800 text-white rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
                
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-neutral-800 transition text-neutral-400 hover:text-white"
                >
                  <Smile size={20} />
                </button>
                
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="p-2 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-400">
            <p>Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  )
}
