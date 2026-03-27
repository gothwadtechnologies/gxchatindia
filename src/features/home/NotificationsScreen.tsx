import React from 'react';
import { ArrowLeft, Bell, MessageSquare, Heart, UserPlus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsScreen() {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: 'like',
      user: 'sarah_design',
      content: 'liked your photo.',
      time: '2m ago',
      avatar: 'https://picsum.photos/seed/user1/100/100',
      icon: Heart,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      id: 2,
      type: 'follow',
      user: 'jordan_dev',
      content: 'started following you.',
      time: '15m ago',
      avatar: 'https://picsum.photos/seed/user2/100/100',
      icon: UserPlus,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/5'
    },
    {
      id: 3,
      type: 'message',
      user: 'alex_gx',
      content: 'sent you a new message.',
      time: '1h ago',
      avatar: 'https://picsum.photos/seed/user3/100/100',
      icon: MessageSquare,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 4,
      type: 'mention',
      user: 'priya_art',
      content: 'mentioned you in a comment.',
      time: '3h ago',
      avatar: 'https://picsum.photos/seed/user4/100/100',
      icon: Star,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50'
    },
    {
      id: 5,
      type: 'like',
      user: 'rahul_vlogs',
      content: 'liked your reel.',
      time: '5h ago',
      avatar: 'https://picsum.photos/seed/user5/100/100',
      icon: Heart,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-4 px-4 h-16 border-b border-zinc-100 bg-white z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Section Title */}
        <div className="px-4 py-4">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Recent</h2>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col">
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div 
                key={notif.id} 
                className="flex items-center gap-4 px-4 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-50"
              >
                <div className="relative shrink-0">
                  <img 
                    src={notif.avatar} 
                    alt={notif.user}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white ${notif.bgColor}`}>
                    <Icon size={10} className={notif.iconColor} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-900 leading-tight">
                    <span className="font-bold">{notif.user}</span> {notif.content}
                  </p>
                  <span className="text-[11px] text-zinc-400 font-medium">{notif.time}</span>
                </div>
                {notif.type === 'follow' && (
                  <button className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-colors">
                    Follow
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State Mock */}
        <div className="py-12 flex flex-col items-center justify-center opacity-20">
          <Bell size={48} className="text-zinc-400 mb-2" />
          <p className="text-sm font-medium">No more notifications</p>
        </div>
      </div>
    </div>
  );
}
