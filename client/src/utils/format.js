export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatCompactNumber = (num = 0) => {
  if (num < 1000) return String(num);
  if (num < 1_000_000) return `${(num / 1000).toFixed(num % 1000 >= 100 ? 1 : 0)}k`;
  return `${(num / 1_000_000).toFixed(1)}m`;
};

export const truncate = (text = '', max = 140) => {
  const plain = text.replace(/<[^>]*>/g, '');
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
};
