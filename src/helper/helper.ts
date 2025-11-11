export const casteOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

// Function to format the reason text E.x 'puja_cancellation' to 'Puja Cancellation'
export const formatReasonText = (text?: string) => {
  if (!text) return '';
  return text.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};
