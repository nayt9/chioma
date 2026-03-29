'use client';

import { useState } from 'react';
import { Menu, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { ChatSidebar } from '@/components/messaging/ChatSidebar';
import { MessageInput } from '@/components/messaging/MessageInput';
import { MessageList } from '@/components/messaging/MessageList';
import { UserAvatar } from '@/components/messaging/UserAvatar';
import type { ChatRoom, Message } from '@/components/messaging/types';
import { useAuthStore } from '@/store/authStore';

interface ChatInterfaceProps {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: Message[];
  typingUsers: Set<string>;
  isConnected: boolean;
  isLoadingRooms?: boolean;
  isLoadingMessages?: boolean;
  onSelectRoom: (room: ChatRoom) => void;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

function getOtherParticipant(room: ChatRoom, currentUserId: string) {
  return room.participants.find((p) => p.userId !== currentUserId)?.user;
}

export function ChatInterface({
  rooms,
  activeRoom,
  messages,
  typingUsers,
  isConnected,
  isLoadingRooms = false,
  isLoadingMessages = false,
  onSelectRoom,
  onSendMessage,
  onTyping,
}: ChatInterfaceProps) {
  const { user } = useAuthStore();
  const [showSidebar, setShowSidebar] = useState(true);

  const otherUser = activeRoom
    ? getOtherParticipant(activeRoom, user?.id ?? '')
    : null;

  const handleSelectRoom = (room: ChatRoom) => {
    onSelectRoom(room);
    setShowSidebar(false);
  };

  return (
    <div className="flex h-[min(82vh,760px)] overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-xl">
      <div
        className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col shrink-0`}
      >
        <ChatSidebar
          rooms={rooms}
          activeRoom={activeRoom}
          isLoading={isLoadingRooms}
          onSelectRoom={handleSelectRoom}
        />
      </div>

      <div
        className={`${!showSidebar ? 'flex' : 'hidden'} md:flex min-w-0 flex-1 flex-col`}
      >
        {activeRoom ? (
          <>
            <header className="flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-5 shrink-0">
              <button
                onClick={() => setShowSidebar(true)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 md:hidden"
                aria-label="Back to conversations"
              >
                <Menu size={20} />
              </button>

              {otherUser ? (
                <UserAvatar
                  firstName={otherUser.firstName}
                  lastName={otherUser.lastName}
                  role={otherUser.role}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-neutral-200" />
              )}

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-neutral-900">
                  {otherUser
                    ? `${otherUser.firstName} ${otherUser.lastName}`
                    : (activeRoom.name ?? 'Chat')}
                </h2>
                <div className="flex items-center gap-1.5">
                  {typingUsers.size > 0 ? (
                    <span className="animate-pulse text-xs font-medium text-blue-500">
                      typing...
                    </span>
                  ) : (
                    <span
                      className={`flex items-center gap-1 text-xs ${
                        isConnected ? 'text-emerald-500' : 'text-neutral-400'
                      }`}
                    >
                      {isConnected ? (
                        <>
                          <Wifi size={11} />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <WifiOff size={11} />
                          <span>Reconnecting...</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </header>

            <MessageList
              messages={messages}
              typingUsers={typingUsers}
              isLoading={isLoadingMessages}
            />

            <MessageInput
              onSend={onSendMessage}
              onTyping={onTyping}
              disabled={!isConnected}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-neutral-50 p-8">
            <button
              onClick={() => setShowSidebar(true)}
              className="mb-6 text-sm font-medium text-blue-600 hover:underline md:hidden"
            >
              Back to conversations
            </button>
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
              <MessageSquare size={36} className="text-blue-400" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-neutral-800">
              Your messages
            </h3>
            <p className="max-w-xs text-center text-sm text-neutral-500">
              Select a conversation from the sidebar, or start a new chat from a
              property or profile page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
