import { perlinNoise } from './perlin-noise';

interface Plot {
  path: HTMLElement;
  noiseIntensity: number;
  initialValue: number;
}

// Adjustable variables. Take care while adjusting these as small changes in the values can result in massive changes in the result.
const baseRadFactor = 0.0022; //the radius of the smallest ring. Adjust carefully as small changes result it large results. Generally keep wthin the range of 0.0015 and 0.0022.
const octaveSpeed = 0.007; // controls the speed for animating octaves
const plotRotationSpeed = -0.009; //adjust value to control speed of plot rotation and sign to control direction.
const plotThickness = 0.3; //adjust the thickness of each plot
const wobblyConstant = 1.1; //This adjusts the frequency of the perlin noise allowing for more peaks.
const numPoints = 250; // Resolution of the plot for each ring. This can be adjusted to get a better balance betwen performance and visual fidelity
const plotGap = 0.00017; //Distance between each plot. small changes produce large results.

//These variables are best left untouched as they either produce little to no visual changes or massive negative results when adjusted as the
const numPlots = 22; //this number corresponds to the number of plots in the svg section
const maxTheta = 2 * Math.PI; //Used in the polar coordinates calculation which gives the circular appearance, this variable limits the circle to just one turn.
const amplitudeFactor = 1; //this can also be used to control the distance between each plot

const scale = (n: number) => Math.pow((1 + n) / 1.75, 3.5);

// function to calculate outer radius using perlin noise
const calculateR = (
  ccp: number,
  theta: number,
  initialValue: number,
  noiseIntensity: number,
  octaves: number,
) => {
  const baseRad = ccp * baseRadFactor; //the radius of the smallest ring.
  const r =
    initialValue +
    baseRad +
    noiseIntensity *
      scale(
        perlinNoise(wobblyConstant * Math.cos(theta), wobblyConstant * Math.sin(theta), octaves),
      );
  return r * 300 + Math.pow(2, initialValue * amplitudeFactor); // Scale factor for visualization, the value that multiplies the
  // r variable can be used to adjust the radius of the plot
  // The exponential function is necessary for achieving the steepness generated, take care while adjusting this value
};

// Function to render a plot
const renderPlot = (
  { path, initialValue, noiseIntensity }: Plot,
  ccp: number,
  octaves: number,
  rotationAngle: number,
) => {
  let d = 'M';
  let innerD = '';
  // Iterate through points to create the plot
  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * maxTheta;
    const thetaWithRotation = theta + rotationAngle; // Update theta with rotation angle
    // Calculate outer and inner radii
    const outerR = calculateR(ccp, thetaWithRotation, initialValue, noiseIntensity, octaves);
    const innerR = outerR - plotThickness;
    // Calculate outer coordinates
    const xOuter = ccp + outerR * Math.cos(theta);
    const yOuter = ccp + outerR * Math.sin(theta);
    d += `${xOuter},${yOuter} `;
    // Check if last point to close the outer ring
    if (i === numPoints) {
      d += ' ';
    }
    // Calculate inner coordinates
    const xInner = ccp + innerR * Math.cos(theta);
    const yInner = ccp + innerR * Math.sin(theta);
    innerD += `${xInner},${yInner} `;
  }
  // Combine outer and inner paths and close the path for the inner ring
  d += innerD + 'Z';
  path.setAttribute('d', d);
};

export const initializePlotsArr = (noiseIntensityFactor: number): Plot[] => {
  const plots: Plot[] = [];
  for (let i = 0; i < numPlots; i++) {
    const path = document.getElementById(`plot${i + 1}`)!;
    const noiseIntensity = noiseIntensityFactor * (i / (numPlots - 1)); // noise intensity control for each ring as they move towards the edge
    const initialValue = i * plotGap; // As the loop works itself towards the outer plots, the initialValue is increased to create a larger distance from the centre for each plot. This basically denotes the base radius of each plot.
    plots.push({
      path,
      noiseIntensity,
      initialValue,
    });
  }
  return plots;
};

// Function to extract viewBox dimensions from SVG elements
export const extractViewBoxDimensions = (): number => {
  const svgElements = document.getElementById('ringPlots') as unknown as SVGSVGElement;
  const viewBoxWidth = svgElements.viewBox.baseVal.width;
  const viewBoxHeight: number = svgElements.viewBox.baseVal.height;
  return Math.min(viewBoxWidth, viewBoxHeight) / 2;
};

// Start the theta animation
export const animateTheta = (plots: Plot[], ccp: number) => {
  let lastFrameTime = 0;
  let octaves = 0.1; // this is the first z-value among the arguments fed into the noise function and translating this value produces the shape shifting.
  let rotationAngle = 0; // Initialize rotation angle
  let animationFrameId: number; // Stores the request ID for cancellation

  const updateTheta = (currentTime: number) => {
    // Calculate time since the last frame
    const deltaTime = currentTime - lastFrameTime;
    // If the time since the last frame is greater than or equal to 16.67 milliseconds (approx. 60 fps or 33.33ms for 30fps), proceed to update
    if (deltaTime >= 16.67) {
      plots.forEach(plot => {
        renderPlot(plot, ccp, octaves, rotationAngle);
      });
      octaves += octaveSpeed;
      // Increment rotation angle for clockwise rotation
      rotationAngle += plotRotationSpeed;
      lastFrameTime = currentTime;
    }
    // Request the next animation frame
    animationFrameId = requestAnimationFrame(updateTheta);
  };

  // Start the animation
  animationFrameId = requestAnimationFrame(updateTheta);

  // Returns cancellation function
  return () => cancelAnimationFrame(animationFrameId);
};
