export const timeUntilNextEvent = (lambda: number): number => {
  const sampleNextEventTime = () => {
    // This is modeling a
    return Math.abs(Math.log(Math.random()) / lambda);
  };

 return sampleNextEventTime()
};
