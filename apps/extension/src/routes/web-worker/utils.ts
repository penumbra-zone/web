export const loadLocalBinary = async (filename: string) => {
    console.log("Entered loadLocalBinary!")
    const response = await fetch(`bin/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
  
    return await response.arrayBuffer();
};