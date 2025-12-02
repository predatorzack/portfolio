const AudioWaveform = () => {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-accent rounded-full animate-waveform"
          style={{
            animationDelay: `${i * 0.1}s`,
            height: '100%',
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
