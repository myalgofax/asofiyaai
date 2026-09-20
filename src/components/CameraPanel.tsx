import React, { useEffect, useRef } from 'react';

interface Props {
  stream: MediaStream | null;
}

export function CameraPanel({ stream }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={styles.panel}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={styles.video}
      />
      {!stream && (
        <div style={styles.placeholder}>
          <span style={styles.icon}>📷</span>
          <span style={styles.label}>Camera off</span>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 280,
    minWidth: 220,
    maxWidth: 320,
    background: '#1a2e28',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRight: '1px solid #2e4a40',
    flexShrink: 0,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transform: 'scaleX(-1)', // mirror like a selfie cam
  },
  placeholder: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  icon: { fontSize: 36 },
  label: { color: '#5a7a6e', fontSize: 13 },
};
