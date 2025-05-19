
import { useState } from "react";
import { MessageSquare, Search, Plus, Users, BookOpen, Share2, Settings, Paperclip, Mic, Smile, ArrowUp, Image, CircleUser, Clock, Bell, FileText, User, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const contacts = [
  {
    id: 1,
    name: "Sarah Scott",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Okay, thank you!",
    lastMessageTime: "14:30",
    unread: 4,
  },
  {
    id: 2,
    name: "Adam Bridges",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Voice message",
    lastMessageTime: "14:15",
    unread: 0,
    active: true,
  },
  {
    id: 3,
    name: "Judith Stewart",
    avatar: "https://randomuser.me/api/portraits/women/35.jpg",
    lastMessage: "How to regain the desire to act",
    lastMessageTime: "14:13",
    unread: 0,
  },
  {
    id: 4,
    name: "Rose Wilson",
    avatar: "https://randomuser.me/api/portraits/women/52.jpg",
    lastMessage: "I notice a positive change in your...",
    lastMessageTime: "14:02",
    unread: 1,
  },
  {
    id: 5,
    name: "Michael Thompson",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    lastMessage: "Waiting for the test results, than...",
    lastMessageTime: "12:47",
    unread: 0,
  },
];

const chatMessages = [
  {
    type: "incoming",
    name: "Adam Bridges",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "I've been feeling overwhelmed lately, especially at work. It's like I can't keep up",
    time: "13:10",
  },
  {
    type: "incoming",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=500&q=80",
    caption: "This is what my desk looks like every day",
    time: "13:10",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    type: "outgoing",
    content: "I understand. Can you share a bit more about what's been making you feel this way? Maybe we can identify the key stressors",
    time: "13:12",
  },
  {
    type: "incoming",
    name: "Michael Thompson",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    audio: {
      duration: "03:24",
      playing: false,
    },
    quoted: {
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=500&q=80",
      caption: "This is what my desk looks like every day",
    },
    time: "13:13",
  },
];

const attachments = [
  { id: 1, src: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80" },
  { id: 2, src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" },
  { id: 3, src: "/placeholder.svg", more: true },
];

export default function Chat() {
  const [message, setMessage] = useState("");
  return (
    <div
      className={cn(
        "min-h-screen w-full px-0 md:px-7 py-0 flex flex-col md:justify-center md:items-center",
        "bg-gradient-to-br from-[#f4f7ff] via-[#e3eafe] to-[#ffffff]"
      )}
      style={{
        background:
          "radial-gradient(120% 90% at 50% 50%, #E9EFFF 0%, #F6F6FF 60%, #fff 100%)",
        minHeight: "100dvh",
      }}
    >
      <div className="flex w-full max-w-[1440px] mx-auto h-screen md:h-[90vh] rounded-3xl bg-white/50 shadow-2xl overflow-hidden backdrop-blur-[9px] border border-white/60">
        {/* Left sidebar */}
        <aside className="w-20 md:w-24 h-full flex flex-col space-y-3 items-center bg-transparent pt-8">
          <div className="w-14 h-14 bg-primary/80 flex items-center justify-center rounded-2xl shadow mb-6">
            <img
              src="/lovable-uploads/b2301cde-7b47-44db-9383-36476ebb83c9.png"
              alt="Mindlyfe"
              className="w-9 h-9"
              draggable={false}
            />
          </div>
          <SidebarIcon icon={MessageSquare} active />
          <SidebarIcon icon={Users} />
          <SidebarIcon icon={BookOpen} />
          <SidebarIcon icon={Share2} />
          <SidebarIcon icon={Settings} />
        </aside>

        {/* Inbox contacts */}
        <section className="hidden md:flex flex-col bg-white/[.92] border-r border-zinc-200/70 min-w-[320px] max-w-[340px] h-full pt-7 pb-3">
          <div className="flex items-center px-5">
            <h2 className="text-xl font-semibold tracking-tight pl-0 pb-2 text-zinc-800">
              Inbox
            </h2>
            <Button size="icon" variant="ghost" className="ml-auto rounded-full">
              <Plus size={20} />
            </Button>
          </div>

          {/* Search bar */}
          <div className="px-4">
            <div className="relative mt-[-2px] mb-2">
              <input
                className="w-full bg-white/80 border border-zinc-200 rounded-xl py-2 pl-10 pr-3 text-zinc-700 focus:outline-none focus:border-primary shadow"
                placeholder="Search"
                type="text"
              />
              <Search className="absolute left-3 top-2.5 text-zinc-400" size={17} />
            </div>
          </div>

          <div className="flex-1 overflow-auto px-2 pt-0">
            {/* Patients/doctors tabs */}
            <div className="flex items-center mb-2 space-x-2 px-2">
              <Button
                size="sm"
                variant="secondary"
                className="px-4 py-1 text-[13px] rounded-2xl font-semibold"
              >
                Patients
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="px-4 py-1 text-[13px] rounded-2xl"
              >
                Doctors
              </Button>
            </div>
            <ul>
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-2xl cursor-pointer transition-colors mb-1",
                    contact.active
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-zinc-50"
                  )}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 truncate text-sm">
                      {contact.name}
                    </div>
                    <div className="text-xs text-zinc-500 truncate -mt-[1px]">
                      {contact.lastMessage}
                    </div>
                  </div>
                  <div className="flex flex-col items-end pl-2 gap-1">
                    <span className="text-[11px] text-zinc-400 min-w-[34px] text-right">
                      {contact.lastMessageTime}
                    </span>
                    {contact.unread > 0 ? (
                      <span className="inline-block w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                        {contact.unread}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Chat main area */}
        <main className="flex-1 flex flex-col h-full bg-transparent justify-between">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-zinc-200/60 bg-white/70 min-h-[70px]">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Adam Bridges"
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <div className="flex-1">
              <div className="font-semibold text-zinc-800 text-base">
                Adam Bridges
              </div>
              <div className="text-xs text-zinc-400">how you&apos;re doing?</div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              aria-label="Call"
            >
              <MessageSquare className="text-primary" />
            </Button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-auto px-5 md:px-10 py-5 bg-transparent">
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              {chatMessages.map((msg, i) =>
                msg.type === "incoming" ? (
                  <div className="flex items-start gap-4" key={i}>
                    <img
                      src={msg.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
                      alt={msg.name || ""}
                      className="w-9 h-9 rounded-full object-cover mt-1 border-2 border-white"
                    />
                    <div>
                      {/* Name on first message only if present */}
                      {msg.name && (
                        <div className="text-xs text-zinc-500 font-medium mb-1">
                          {msg.name}
                        </div>
                      )}
                      {/* Message bubble */}
                      {msg.content && (
                        <div className="rounded-2xl rounded-tl-sm px-5 py-3 bg-white shadow-md text-zinc-900 text-[15px] max-w-[330px] md:max-w-[420px] break-words">
                          {msg.content}
                        </div>
                      )}
                      {/* Image message */}
                      {msg.image && (
                        <div className="mt-1 mb-1">
                          <img
                            src={msg.image}
                            alt="chat"
                            className="max-w-[210px] md:max-w-[260px] rounded-2xl shadow"
                          />
                          {msg.caption && (
                            <div className="text-xs text-zinc-500 mt-1 ml-1">
                              {msg.caption}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Audio/voice message with quote */}
                      {msg.audio && (
                        <div className="rounded-2xl px-4 py-3 bg-blue-50/90 shadow border border-blue-100 mt-1 max-w-[320px]">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquareQuote size={18} className="text-zinc-400" />
                            <span className="text-xs text-zinc-500">
                              {msg.quoted?.caption}
                            </span>
                          </div>
                          <audio className="w-full rounded" controls>
                            <source src="/audio-placeholder.mp3" type="audio/mp3" />
                            Your browser does not support the audio element.
                          </audio>
                          <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                            <Clock size={13} />
                            <span>{msg.audio.duration}</span>
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-zinc-400 mt-1">
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end justify-end gap-3" key={i}>
                    <div>
                      <div className="rounded-2xl rounded-tr-sm px-5 py-3 bg-primary text-white shadow-md text-[15px] max-w-[330px] md:max-w-[420px] break-words">
                        {msg.content}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 text-right">
                        {msg.time}
                      </div>
                    </div>
                    <img
                      src="https://randomuser.me/api/portraits/women/36.jpg"
                      alt="You"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Chat input */}
          <div className="px-5 md:px-10 py-5 bg-white/85 border-t border-zinc-200/70 flex items-center gap-4">
            <Button size="icon" variant="ghost" className="rounded-full">
              <Smile />
            </Button>
            <Button size="icon" variant="ghost" className="rounded-full">
              <Paperclip />
            </Button>
            <input
              className="flex-1 bg-zinc-100 rounded-xl py-2 px-4 text-zinc-700 focus:outline-none shadow"
              placeholder="Message to Adam Bridges"
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled
            />
            <Button size="icon" variant="default" className="rounded-full">
              <ArrowUp />
            </Button>
          </div>
        </main>

        {/* Info right panel */}
        <aside className="hidden md:flex flex-col w-[320px] max-w-[350px] h-full bg-white/80 border-l border-zinc-200/70 px-6 pt-7 pb-3">
          {/* User details */}
          <div className="mb-3 flex flex-col items-center text-center">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Adam Bridges"
              className="w-16 h-16 rounded-full object-cover border-2 border-white mb-1 shadow"
            />
            <div className="font-bold text-zinc-800 text-lg mt-2">Adam Bridges</div>
            <div className="text-xs text-zinc-400">
              Last activity - 20 minutes ago
            </div>
          </div>
          {/* Info list */}
          <div className="space-y-2 text-sm text-zinc-700 mb-5">
            <div className="flex items-center gap-2">
              <User size={17} className="text-zinc-400" />
              (704) 555-0127
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-zinc-400" />
              May 22, 1997
            </div>
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-zinc-400" />
              <span>Notification</span>
              <span className="ml-auto">
                <label className="relative inline-flex items-center cursor-pointer scale-90">
                  <input type="checkbox" value="" className="sr-only peer" checked readOnly />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary"></div>
                  <span className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-white shadow"></span>
                </label>
              </span>
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <div className="font-semibold text-zinc-700 mb-2">Attachments</div>
            <div className="flex gap-2 overflow-x-auto">
              {attachments.map((file) =>
                file.more ? (
                  <div
                    key={file.id}
                    className="w-16 h-12 bg-blue-50 flex items-center justify-center text-primary rounded-lg font-bold text-lg"
                  >
                    274+
                  </div>
                ) : (
                  <img
                    key={file.id}
                    src={file.src}
                    alt="Attachment"
                    className="w-16 h-12 object-cover rounded-lg shadow"
                  />
                )
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
              <div className="flex items-center gap-1"><Image size={13}/> 243 photos</div>
              <div className="flex items-center gap-1"><Mic size={13}/> 9 sessions recorded</div>
              <div className="flex items-center gap-1"><FileText size={13}/> 14 tests</div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="font-semibold text-zinc-700 mb-2">Notes</div>
            <div className="space-y-2">
              <div className="bg-blue-50 text-blue-900/80 rounded-lg px-3 py-2 text-xs shadow">
                <div className="font-medium mb-1">Jun 8, 2024</div>
                Taking medication, improving the condition
              </div>
              <div className="bg-blue-50 text-blue-900/75 rounded-lg px-3 py-2 text-xs shadow">
                <div className="font-medium mb-1">Apr 27, 2024</div>
                Obsessive thoughts, recurring violent dreams
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SidebarIcon({ icon: Icon, active = false }: { icon: React.ElementType; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-12 h-12 rounded-2xl transition-all cursor-pointer mb-0.5",
        active
          ? "bg-primary text-white shadow-md scale-105"
          : "bg-white/80 text-zinc-400 hover:text-primary hover:bg-blue-50"
      )}
    >
      <Icon size={26} className="" />
    </div>
  );
}
