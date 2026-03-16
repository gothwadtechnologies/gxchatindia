import React from 'react';

export default function StoryBar() {
  const stories = [
    { id: 1, user: 'Your Story', img: 'https://picsum.photos/seed/me/100/100', isMe: true },
    { id: 2, user: 'jordan', img: 'https://picsum.photos/seed/jordan/100/100' },
    { id: 3, user: 'casey', img: 'https://picsum.photos/seed/casey/100/100' },
    { id: 4, user: 'sam', img: 'https://picsum.photos/seed/sam/100/100' },
    { id: 5, user: 'taylor', img: 'https://picsum.photos/seed/taylor/100/100' },
    { id: 6, user: 'morgan', img: 'https://picsum.photos/seed/morgan/100/100' },
  ];

  return (
    <div className="flex overflow-x-auto py-4 px-2 gap-4 no-scrollbar border-b border-zinc-100">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1 min-w-[75px]">
          <div className={`p-[2px] rounded-full ${story.isMe ? '' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'}`}>
            <div className="p-[2px] bg-white rounded-full">
              <img 
                src={story.img} 
                alt={story.user} 
                className="w-16 h-16 rounded-full object-cover border border-zinc-200"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <span className="text-xs truncate w-full text-center">{story.user}</span>
        </div>
      ))}
    </div>
  );
}
