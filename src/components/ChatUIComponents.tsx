import React from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  User, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Trash, 
  UserX, 
  AlertTriangle,
  Plus,
  Mic,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  X,
  Reply,
  Forward,
  Edit2,
  Smile
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  receiver: any;
  receiverId: string | undefined;
  formatLastSeen: (timestamp: any) => string;
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  deleteChat: () => void;
  optionsRef: React.RefObject<HTMLDivElement | null>;
  isTyping?: boolean;
  receiverStatus?: 'online' | 'offline';
  receiverActiveChatId?: string | null;
  currentUserId?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  receiver,
  receiverId,
  formatLastSeen,
  showOptions,
  setShowOptions,
  isMuted,
  setIsMuted,
  deleteChat,
  optionsRef,
  isTyping,
  receiverStatus,
  receiverActiveChatId,
  currentUserId
}) => {
  const navigate = useNavigate();
  const isOnline = receiverStatus === 'online';

  const getStatusText = () => {
    if (isTyping) return 'online - typing';
    if (!isOnline) return formatLastSeen(receiver?.lastSeen);
    
    if (receiverActiveChatId === currentUserId) {
      return 'online - for you';
    } else if (receiverActiveChatId) {
      return 'online - for other';
    }
    
    return 'online';
  };
  
  return (
    <div className="shrink-0 flex items-center justify-between px-4 h-16 bg-[#00B0FF] z-50 shadow-md">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
          <ArrowLeft size={22} className="text-white" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/user/${receiverId}`)}>
          <div className="relative">
            <img 
              src={receiver?.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`} 
              className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-sm"
              referrerPolicy="no-referrer"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#00B0FF] rounded-full"></div>
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="text-[14px] font-bold text-white leading-tight">{receiver?.fullName || 'GxChat User'}</h2>
            <span className="text-[10px] text-white/80 font-medium">
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => navigate(`/call/${receiverId}?type=video`)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Video size={20} className="text-white" />
        </button>
        <button 
          onClick={() => navigate(`/call/${receiverId}?type=voice`)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Phone size={18} className="text-white" />
        </button>
        <div className="relative" ref={optionsRef}>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <MoreVertical size={22} className="text-white" />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-44 bg-[#00B0FF] rounded-xl shadow-2xl border border-white/10 py-1 z-[100] overflow-hidden">
              <button onClick={() => navigate(`/user/${receiverId}`)} className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                <User size={18} className="text-white/80" /> View Profile
              </button>
              <button className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                <EyeOff size={18} className="text-white/80" /> Hide Chat
              </button>
              <button onClick={() => setIsMuted(!isMuted)} className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                {isMuted ? <Volume2 size={18} className="text-white/80" /> : <VolumeX size={18} className="text-white/80" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button onClick={deleteChat} className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                <Trash size={18} className="text-white/80" /> Delete Chat
              </button>
              <button className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 border-t border-white/10 transition-colors">
                <UserX size={18} className="text-white/80" /> Block User
              </button>
              <button className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                <AlertTriangle size={18} className="text-white/80" /> Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatMessageReactions: React.FC<{
  onReact: (emoji: string) => void;
  onClose: () => void;
  position: 'left' | 'right';
}> = ({ onReact, onClose, position }) => {
  const emojis = ['❤️', '😂', '😮', '😢', '🔥', '👍'];
  return (
    <div 
      className={`absolute bottom-full mb-2 flex items-center gap-1 bg-[#00B0FF] rounded-full shadow-xl border border-white/20 p-1 z-[110] animate-in zoom-in-95 duration-150 ${position === 'right' ? 'right-0' : 'left-0'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => { onReact(emoji); onClose(); }}
          className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-full transition-all active:scale-125 text-xl"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export const ChatMessageMenu: React.FC<{
  activeMessageMenu: any;
  setActiveMessageMenu: (msg: any) => void;
  setReplyingTo: (msg: any) => void;
  startEdit: (msg: any) => void;
  deleteMessage: (id: string) => void;
  currentUserUid: string | undefined;
  setShowReactionPicker: (msg: any) => void;
}> = ({ activeMessageMenu, setActiveMessageMenu, setReplyingTo, startEdit, deleteMessage, currentUserUid, setShowReactionPicker }) => {
  if (!activeMessageMenu) return null;
  const isMe = activeMessageMenu.senderId === currentUserUid;

  return (
    <div className="absolute bottom-full right-4 mb-3 w-40 bg-[#00B0FF] rounded-xl shadow-2xl border border-white/10 py-1 z-[100] overflow-hidden">
      <div className="px-3 py-1.5 border-b border-white/10 mb-1">
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Message Options</p>
      </div>
      <button onClick={() => { setShowReactionPicker(activeMessageMenu); setActiveMessageMenu(null); }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
        <Smile size={16} className="text-white/80" /> React
      </button>
      <button onClick={() => { setReplyingTo(activeMessageMenu); setActiveMessageMenu(null); }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
        <Reply size={16} className="text-white/80" /> Reply
      </button>
      {isMe && (
        <button onClick={() => startEdit(activeMessageMenu)} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
          <Edit2 size={16} className="text-white/80" /> Edit
        </button>
      )}
      <button onClick={() => setActiveMessageMenu(null)} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
        <Forward size={16} className="text-white/80" /> Forward
      </button>
      {isMe && (
        <button onClick={() => deleteMessage(activeMessageMenu.id)} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
          <Trash size={16} className="text-white/80" /> Delete
        </button>
      )}
      <button onClick={() => setActiveMessageMenu(null)} className="w-full px-4 py-2 text-center text-[11px] font-bold text-white/50 hover:text-white transition-colors mt-1">
        Cancel
      </button>
    </div>
  );
};

export const ChatReplyPreview: React.FC<{
  replyingTo: any;
  setReplyingTo: (msg: any) => void;
  receiver: any;
  currentUserUid: string | undefined;
}> = ({ replyingTo, setReplyingTo, receiver, currentUserUid }) => {
  if (!replyingTo) return null;
  return (
    <div className="mb-2 mx-2 p-2 bg-white/15 backdrop-blur-lg rounded-xl border-l-[6px] border-emerald-400 flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3 flex-1 min-w-0 px-2">
        <div className="p-1.5 bg-white/20 rounded-full">
          <Reply size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-white uppercase tracking-widest opacity-80">
            Replying to {replyingTo.senderId === currentUserUid ? 'yourself' : receiver?.fullName}
          </p>
          <p className="text-[13px] text-white font-medium truncate italic">"{replyingTo.text}"</p>
        </div>
      </div>
      <button 
        onClick={() => setReplyingTo(null)} 
        className="p-1.5 hover:bg-white/20 rounded-full transition-all active:scale-90"
      >
        <X size={18} className="text-white" />
      </button>
    </div>
  );
};

export const ChatEditPreview: React.FC<{
  editingMessage: any;
  setEditingMessage: (msg: any) => void;
  setNewMessage: (text: string) => void;
}> = ({ editingMessage, setEditingMessage, setNewMessage }) => {
  if (!editingMessage) return null;
  return (
    <div className="mb-2 mx-2 p-2 bg-white/15 backdrop-blur-lg rounded-xl border-l-[6px] border-white flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3 flex-1 min-w-0 px-2">
        <div className="p-1.5 bg-white/20 rounded-full">
          <Edit2 size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-white uppercase tracking-widest opacity-80">Editing Message</p>
          <p className="text-[13px] text-white font-medium truncate italic">"{editingMessage.text}"</p>
        </div>
      </div>
      <button 
        onClick={() => { setEditingMessage(null); setNewMessage(''); }} 
        className="p-1.5 hover:bg-white/20 rounded-full transition-all active:scale-90"
      >
        <X size={18} className="text-white" />
      </button>
    </div>
  );
};

export const ChatPlusMenu: React.FC<{
  showPlusMenu: boolean;
  setShowPlusMenu: (show: boolean) => void;
  plusMenuRef: React.RefObject<HTMLDivElement | null>;
}> = ({ showPlusMenu, setShowPlusMenu, plusMenuRef }) => {
  return (
    <div className="relative" ref={plusMenuRef}>
      <button type="button" onClick={() => setShowPlusMenu(!showPlusMenu)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors shrink-0">
        <Plus size={24} />
      </button>
      {showPlusMenu && (
        <div className="absolute bottom-full left-0 mb-3 w-40 bg-[#00B0FF] rounded-xl shadow-2xl border border-white/10 py-1 z-[100] overflow-hidden">
          <button className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"><Mic size={16} /></div> Microphone
          </button>
          <button className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"><ImageIcon size={16} /></div> Media
          </button>
          <button className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"><FileText size={16} /></div> Files
          </button>
          <button className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"><LinkIcon size={16} /></div> Links
          </button>
        </div>
      )}
    </div>
  );
};

