import React from 'react';
import { Image as ImageIcon, Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';

export default function PostsView() {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-4 pt-4">
      <div className="flex flex-col gap-6">
        {/* Sample Post */}
        {[1, 2, 3].map((post) => (
          <div key={post} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${post}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">User {post}</h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">2 hours ago</p>
                </div>
              </div>
              <button className="text-zinc-400">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div className="aspect-square bg-zinc-100">
              <img src={`https://picsum.photos/seed/post${post}/600/600`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            <div className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <button className="text-zinc-600"><Heart size={22} /></button>
                <button className="text-zinc-600"><MessageCircle size={22} /></button>
                <button className="text-zinc-600"><Share2 size={22} /></button>
              </div>
              <p className="text-sm text-zinc-800 leading-relaxed">
                <span className="font-bold mr-2">User {post}</span>
                Exploring the beauty of nature today! #nature #adventure
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
