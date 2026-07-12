import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  withName: string;
}

// Frontend-only WebRTC mock: uses getUserMedia for local preview.
// No signaling server — remote side is simulated for demo purposes.
export const VideoCallModal: React.FC<Props> = ({ open, onClose, withName }) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (cancelled) return;
        streamRef.current = stream;
        if (localRef.current) localRef.current.srcObject = stream;
        setTimeout(() => setConnected(true), 1200); // simulate peer connecting
      })
      .catch(() => toast.error('Camera/mic permission denied'));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      setConnected(false);
    };
  }, [open]);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach(t => (t.enabled = !micOn));
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => (t.enabled = !camOn));
    setCamOn(!camOn);
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (localRef.current) localRef.current.srcObject = screenStream;
      toast.success('Screen sharing started');
      screenStream.getVideoTracks()[0].onended = () => {
        if (localRef.current) localRef.current.srcObject = streamRef.current;
      };
    } catch {
      toast.error('Screen share cancelled');
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onClose();
  };

  return (
    <Modal open={open} onClose={endCall} title={`Call with ${withName}`} size="lg">
      <div className="space-y-4">
        <div className="relative bg-gray-900 rounded-lg aspect-video overflow-hidden flex items-center justify-center">
          <video ref={localRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3">
            <span className={`text-xs px-2 py-1 rounded-full ${connected ? 'bg-success-500' : 'bg-warning-500'} text-white`}>
              {connected ? 'Connected' : 'Connecting…'}
            </span>
          </div>
          <div className="absolute bottom-3 right-3 w-24 h-16 bg-gray-800 rounded-md flex items-center justify-center text-xs text-gray-400 border border-gray-700">
            {withName}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant={micOn ? 'outline' : 'error'} size="md" className="rounded-full p-3" onClick={toggleMic}>
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </Button>
          <Button variant={camOn ? 'outline' : 'error'} size="md" className="rounded-full p-3" onClick={toggleCam}>
            {camOn ? <Video size={18} /> : <VideoOff size={18} />}
          </Button>
          <Button variant="outline" size="md" className="rounded-full p-3" onClick={shareScreen}>
            <ScreenShare size={18} />
          </Button>
          <Button variant="error" size="md" className="rounded-full p-3" onClick={endCall}>
            <PhoneOff size={18} />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
