/**
 * Simple sound utility for playing notification sounds
 * @param {string} type - The type of sound to play: 'success', 'error', or 'warning'
 */
export function playSound(type) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log(`🔊 Sound playback skipped - not in browser environment`);
    return;
  }
  
  console.log(`🔊 Attempting to play ${type} sound`);
  
  try {
    // Check if Audio is supported in the browser
    if (typeof Audio === 'undefined' && typeof AudioContext === 'undefined') {
      console.warn('❌ Audio not supported in this browser');
      return;
    }

    // First try to play from files
    const soundPaths = {
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      warning: '/sounds/warning.mp3'
    };

    const soundPath = soundPaths[type];
    
    if (soundPath) {
      console.log(`🎵 Trying to load sound file: ${soundPath}`);
      const audio = new Audio(soundPath);
      audio.volume = 0.5;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`✅ ${type} sound played successfully from file`);
          })
          .catch(error => {
            console.log(`❌ Sound file failed, generating programmatic sound:`, error.message);
            // Fallback to programmatic sound generation
            generateNotificationSound(type);
          });
      }
    } else {
      console.log(`⚠️ No sound path defined, using programmatic sound`);
      // Fallback to programmatic sound generation
      generateNotificationSound(type);
    }

  } catch (error) {
    console.warn(`❌ Error playing ${type} sound:`, error.message);
    // Final fallback
    generateNotificationSound(type);
  }
}

/**
 * Generate notification sounds programmatically using Web Audio API
 * @param {string} type - The type of sound: 'success', 'error', or 'warning'
 */
function generateNotificationSound(type) {
  console.log(`🎼 Generating programmatic ${type} sound`);
  
  try {
    // Check for Web Audio API support
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      console.warn('❌ Web Audio API not supported');
      return;
    }

    const audioContext = new AudioContext();
    
    // Resume context if it's suspended (required for user interaction)
    if (audioContext.state === 'suspended') {
      console.log('🔄 Resuming suspended audio context');
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound based on type
    switch (type) {
      case 'success':
        // Happy ascending tone
        console.log('🎵 Playing success tone (C5→E5→G5)');
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        break;
        
      case 'error':
        // Descending warning tone
        console.log('🔔 Playing error tone (A4→F4)');
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.15); // F4
        break;
        
      case 'warning':
        // Double beep
        console.log('⚠️ Playing warning tone (C5→C5)');
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.15); // C5
        break;
        
      default:
        console.log('🔊 Playing default tone (A4)');
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    }
    
    // Set gain envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    // Set oscillator type
    oscillator.type = 'sine';
    
    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    console.log(`✅ Generated ${type} notification sound successfully`);
    
  } catch (error) {
    console.warn(`❌ Error generating ${type} sound:`, error.message);
  }
}

export default playSound;
