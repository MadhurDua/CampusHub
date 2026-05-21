export const getCollegeName = (email) => {
  if (!email) return null;
  
  // Match emails with .edu, .ac.in, .edu.in, .ac.uk, .edu.au, etc.
  // Pattern: @domain.edu, @domain.ac.in, @domain.edu.in, etc.
  const match = email.match(/@([^.]+)\.(?:edu|ac|co)(?:\.in|\.uk|\.au)?/i);
  if (match && match[1]) {
    return match[1]
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  return null;
};
