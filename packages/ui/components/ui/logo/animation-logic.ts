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

export const permutation = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142,
  8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203,
  117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165,
  71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92,
  41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208,
  89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
  226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58,
  17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155,
  167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
  246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
  239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150,
  254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
];

// This is a port of Ken Perlin's Java code.
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number) => a + t * (b - a);
const grad = (hash: number, x: number, y: number, z: number) => {
  const h = hash & 15; // CONVERT LO 4 BITS OF HASH CODE
  const u = h < 8 ? x : y, // INTO 12 GRADIENT DIRECTIONS.
    v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
};
const scale = (n: number) => Math.pow((1 + n) / 1.75, 3.5);

const PerlinNoise = (p: number[], x: number, y: number, z: number) => {
  const X = Math.floor(x) & 255, // FIND UNIT CUBE THAT
    Y = Math.floor(y) & 255, // CONTAINS POINT.
    Z = Math.floor(z) & 255;
  x -= Math.floor(x); // FIND RELATIVE X,Y,Z
  y -= Math.floor(y); // OF POINT IN CUBE.
  z -= Math.floor(z);
  const u = fade(x), // COMPUTE FADE CURVES
    v = fade(y), // FOR EACH OF X,Y,Z.
    w = fade(z);
  const A = p[X]! + Y,
    AA = p[A]! + Z,
    AB = p[A + 1]! + Z, // HASH COORDINATES OF
    B = p[X + 1]! + Y,
    BA = p[B]! + Z,
    BB = p[B + 1]! + Z; // THE 8 CUBE CORNERS,
  return scale(
    lerp(
      w,
      lerp(
        v,
        lerp(
          u,
          grad(p[AA]!, x, y, z), // AND ADD
          grad(p[BA]!, x - 1, y, z),
        ), // BLENDED
        lerp(
          u,
          grad(p[AB]!, x, y - 1, z), // RESULTS
          grad(p[BB]!, x - 1, y - 1, z),
        ),
      ), // FROM  8
      lerp(
        v,
        lerp(
          u,
          grad(p[AA + 1]!, x, y, z - 1), // CORNERS
          grad(p[BA + 1]!, x - 1, y, z - 1),
        ), // OF CUBE
        lerp(u, grad(p[AB + 1]!, x, y - 1, z - 1), grad(p[BB + 1]!, x - 1, y - 1, z - 1)),
      ),
    ),
  );
};

// function to calculate outer radius using perlin noise
const calculateR = (
  ccp: number,
  theta: number,
  initialValue: number,
  noiseIntensity: number,
  p: number[],
  octaves: number,
) => {
  const baseRad = ccp * baseRadFactor; //the radius of the smallest ring.
  const r =
    initialValue +
    baseRad +
    noiseIntensity *
      PerlinNoise(p, wobblyConstant * Math.cos(theta), wobblyConstant * Math.sin(theta), octaves);
  return r * 300 + Math.pow(2, initialValue * amplitudeFactor); // Scale factor for visualization, the value that multiplies the
  // r variable can be used to adjust the radius of the plot
  // The exponential function is necessary for achieving the steepness generated, take care while adjusting this value
};

// Function to render a plot
const renderPlot = (
  { path, initialValue, noiseIntensity }: Plot,
  ccp: number,
  p: number[],
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
    const outerR = calculateR(ccp, thetaWithRotation, initialValue, noiseIntensity, p, octaves);
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
export const animateTheta = (plots: Plot[], ccp: number, p: number[]) => {
  let lastFrameTime = 0;
  let octaves = 0.1; // this is the first z-value among the arguments fed into the noise function and translating this value produces the shape shifting.
  let rotationAngle = 0; // Initialize rotation angle

  const updateTheta = (currentTime: number) => {
    // Calculate time since the last frame
    const deltaTime = currentTime - lastFrameTime;
    // If the time since the last frame is greater than or equal to 16.67 milliseconds (approx. 60 fps or 33.33ms for 30fps), proceed to update
    if (deltaTime >= 16.67) {
      plots.forEach(plot => {
        renderPlot(plot, ccp, p, octaves, rotationAngle);
      });
      octaves += octaveSpeed;
      // Increment rotation angle for clockwise rotation
      rotationAngle += plotRotationSpeed;
      lastFrameTime = currentTime;
    }
    // Request the next animation frame
    requestAnimationFrame(updateTheta);
  };

  // Start the animation
  requestAnimationFrame(updateTheta);
};
