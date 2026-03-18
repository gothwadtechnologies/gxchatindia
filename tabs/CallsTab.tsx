import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { Phone, Video, Plus, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { auth, db } from '../server/firebase.ts';
import { toDate } from '../src/utils/dateUtils.ts';
import { collection, query, where, onSnapshot, getDoc, doc, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function CallsTab() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "calls")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allCalls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter and sort in memory to avoid index requirements
      const relevantCalls = allCalls.filter((data: any) => {
        const isCaller = data.callerId === auth.currentUser?.uid;
        const isReceiver = data.receiverId === auth.currentUser?.uid;
        return (isCaller || isReceiver) && data.status === 'ended';
      }).sort((a: any, b: any) => {
        const timeA = toDate(a.timestamp)?.getTime() || 0;
        const timeB = toDate(b.timestamp)?.getTime() || 0;
        return timeB - timeA;
      });

      const callList = await Promise.all(relevantCalls.map(async (data: any) => {
        const isCaller = data.callerId === auth.currentUser?.uid;
        const otherUserId = isCaller ? data.receiverId : data.callerId;
        const userDoc = await getDoc(doc(db, "users", otherUserId));
        const userData = userDoc.data();

        return {
          id: data.id,
          otherUserId,
          user: userData?.fullName || userData?.username || 'Unknown User',
          avatar: userData?.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`,
          type: data.type,
          isIncoming: !isCaller,
          time: toDate(data.timestamp) ? new Date(toDate(data.timestamp)!).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'
        };
      }));

      setCalls(callList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCalls = calls.filter(c => 
    c.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-zinc-50 overflow-hidden">
      <TopNav />
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Search Bar */}
        <div className="px-4 my-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Recent Calls */}
        <div className="px-4 mb-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Recent</h4>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCalls.length > 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden divide-y divide-zinc-50">
              {filteredCalls.map(call => (
                <div key={call.id} className="flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors">
                  <img 
                    src={call.avatar} 
                    className="w-12 h-12 rounded-full object-cover border border-zinc-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-900 truncate">{call.user}</h3>
                    <div className="flex items-center gap-1 text-zinc-500 text-[11px]">
                      {call.isIncoming ? (
                        <ArrowDownLeft size={12} className="text-emerald-500" />
                      ) : (
                        <ArrowUpRight size={12} className="text-sky-500" />
                      )}
                      <span>{call.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sky-500">
                    <Link to={`/call/${call.otherUserId}?type=${call.type}`}>
                      {call.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 bg-white rounded-2xl border border-zinc-100 p-10 items-center justify-center text-center">
              <div className="p-4 bg-zinc-50 rounded-full mb-4">
                <Phone size={32} className="text-zinc-300" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-1">No call history</h3>
              <p className="text-sm text-zinc-500">Calls you make or receive will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action */}
      <div className="absolute bottom-24 right-6 z-40">
        <Link to="/explore" className="p-4 bg-sky-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-sky-600 transition-colors">
          <Plus size={24} />
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
