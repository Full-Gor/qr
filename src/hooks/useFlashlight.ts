import { useState, useCallback } from 'react';

export function useFlashlight() {
  const [isOn, setIsOn] = useState(false);

  const toggle = useCallback(() => {
    setIsOn(prev => !prev);
  }, []);

  const turnOff = useCallback(() => {
    setIsOn(false);
  }, []);

  return {
    isOn,
    toggle,
    turnOff,
  };
}
