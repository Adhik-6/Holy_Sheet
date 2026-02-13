import { useState, useEffect } from 'react';

// This custom hook ensures that the store data is only read 
// AFTER the component has mounted on the client.
// It solves the "Text content does not match server-rendered HTML" error.

export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};