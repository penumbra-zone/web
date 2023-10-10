//  This function takes a number and formats it for display with exactly two decimal places.
// If the number is an integer or has fewer than two decimal places, it will be displayed with exactly two decimal places. For example, if number is 2000, it will be formatted as "2,000.00".
// If the number is a floating-point number with more than two decimal places, it will be rounded to exactly two decimal places. For example, if number is 2001.1, it will be formatted as "2,001.10" because it is rounded to two decimal places.
export const formatNumber = (number: number): string => {
  // The toLocaleString method is used to format the number based on the 'en-US' locale.

  const fraction = {
    // minimumFractionDigits specifies the minimum number of decimal places to display.
    minimumFractionDigits: 2,
    // maximumFractionDigits specifies the maximum number of decimal places to display.
    maximumFractionDigits: 2,
  };

  if (number > 0 && number < 1) {
    // number less than 1 and zero decimals biggest than 2
    const zeroDecimalsLength = -Math.floor(Math.log(number) / Math.log(10) + 1);
    fraction.maximumFractionDigits = zeroDecimalsLength + 2;
    fraction.minimumFractionDigits = zeroDecimalsLength + 2;
  } else if (number - Math.floor(number) === 0) {
    fraction.maximumFractionDigits = 0;
    fraction.minimumFractionDigits = 0;
  }

  return number.toLocaleString('en-US', fraction);
};
