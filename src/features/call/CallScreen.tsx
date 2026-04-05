import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Phone, 
  Video, 
  PhoneOff, 
  Mic, 
  MicOff, 
  VideoOff, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  User
} from 'lucide-react';
import { auth, db } from '../../services/firebase.ts';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  addDoc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function CallScreen() {
  const { id: otherUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'voice'; // 'voice' or 'video'
  const isReceiver = queryParams.get('role') === 'receiver';

  const [receiver, setReceiver] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'voice');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'ringing', 'connected', 'ended'
  
  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection(servers));
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const callId = [auth.currentUser?.uid, otherUserId].sort().join('_call_');

  useEffect(() => {
    const initCall = async () => {
      // Fetch receiver info
      if (otherUserId) {
        const userDoc = await getDoc(doc(db, "users", otherUserId));
        if (userDoc.exists()) setReceiver(userDoc.data());
      }

      // Get local media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === 'video',
          audio: true,
        });
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        stream.getTracks().forEach((track) => {
          pc.current.addTrack(track, stream);
        });
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }

      // Set up remote stream
      remoteStream.current = new MediaStream();
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream.current;

      pc.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.current?.addTrack(track);
        });
        setCallStatus('connected');
      };

      if (isReceiver) {
        handleIncomingCall();
      } else {
        startCall();
      }
    };

    initCall();

    // Listen for call status changes
    const unsubscribe = onSnapshot(doc(db, "calls", callId), (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      if (data.status === 'ended') {
        endCallLocally();
      }
      if (data.status === 'accepted' && !isReceiver) {
        setCallStatus('connected');
      }
    });

    return () => {
      unsubscribe();
      endCallLocally();
    };
  }, [otherUserId, isReceiver, type]);

  const startCall = async () => {
    setCallStatus('ringing');
    const callDoc = doc(db, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    pc.current.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    const offerDescription = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { 
      offer, 
      status: 'ringing', 
      type, 
      callerId: auth.currentUser?.uid,
      receiverId: otherUserId,
      timestamp: serverTimestamp()
    });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.current.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.current.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current.addIceCandidate(candidate);
        }
      });
    });
  };

  const handleIncomingCall = async () => {
    const callDoc = doc(db, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    pc.current.onicecandidate = (event) => {
      event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = (await getDoc(callDoc)).data();
    const offerDescription = callData?.offer;
    await pc.current.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callDoc, { answer, status: 'accepted' });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          pc.current.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  const endCall = async () => {
    await updateDoc(doc(db, "calls", callId), { status: 'ended' });
    endCallLocally();
  };

  const endCallLocally = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    pc.current.close();
    navigate(-1);
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream.current && type === 'video') {
      const videoTrack = localStream.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-900 flex flex-col items-center justify-between text-white font-sans overflow-hidden">
      {/* Background for Voice Call */}
      {type === 'voice' && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={receiver?.photoURL || "https://picsum.photos/seed/user/800/1200"} 
            className="w-full h-full object-cover blur-2xl opacity-30 scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/40 via-transparent to-zinc-900/80"></div>
        </div>
      )}

      {/* Video Streams */}
      {type === 'video' && (
        <div className="absolute inset-0 z-0 bg-black">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {/* Local Video Overlay */}
          <motion.div 
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className="absolute top-6 right-6 w-32 h-44 bg-zinc-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10"
          >
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
            />
            {isVideoOff && (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <VideoOff size={24} className="text-zinc-500" />
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Header Info */}
      <div className="relative z-10 pt-20 flex flex-col items-center text-center px-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-6"
        >
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
            <img 
              src={receiver?.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {callStatus === 'ringing' && (
            <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20"></div>
          )}
        </motion.div>
        
        <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">{receiver?.fullName || 'GxChat User'}</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${callStatus === 'connected' ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`}></div>
          <span className="text-sm font-bold text-zinc-300 uppercase tracking-[0.2em]">
            {callStatus === 'ringing' ? 'Ringing...' : 
             callStatus === 'connecting' ? 'Connecting...' : 
             callStatus === 'connected' ? '00:00' : 'Ending...'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 w-full px-8 pb-16">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 flex items-center justify-between border border-white/10 shadow-2xl">
          <button 
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full transition-all ${isSpeakerOn ? 'bg-white/10 text-white' : 'bg-white text-zinc-900'}`}
          >
            {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>

          {type === 'video' && (
            <button 
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${!isVideoOff ? 'bg-white/10 text-white' : 'bg-white text-zinc-900'}`}
            >
              {!isVideoOff ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
          )}

          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${!isMuted ? 'bg-white/10 text-white' : 'bg-white text-zinc-900'}`}
          >
            {!isMuted ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <button 
            onClick={endCall}
            className="p-6 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40 hover:bg-red-600 transition-all active:scale-90"
          >
            <PhoneOff size={28} />
          </button>
        </div>
      </div>

      {/* Bottom Label */}
      <div className="relative z-10 pb-6">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">End-to-End Encrypted</p>
      </div>
    </div>
  );
}
