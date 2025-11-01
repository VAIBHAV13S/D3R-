// Validation utilities

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function isValidEthAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount, min = 0, max = Infinity) {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= min && num <= max;
}

export function isValidFileSize(file, maxSizeMB = 10) {
  if (!file) return true;
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

export function isValidFileType(file, allowedTypes = []) {
  if (!file) return true;
  if (allowedTypes.length === 0) return true;
  return allowedTypes.includes(file.type);
}

export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

export function validateCampaignForm(data) {
  const errors = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (data.title.length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }

  if (!data.targetAmount || !isValidAmount(data.targetAmount, 1)) {
    errors.targetAmount = 'Target amount must be greater than 0';
  }

  if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = 'Invalid date';
    } else if (deadlineDate <= new Date()) {
      errors.deadline = 'Deadline must be in the future';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateDonationAmount(amount, min = 0.001, max = 1000000) {
  if (!amount || !isValidAmount(amount, min, max)) {
    return {
      isValid: false,
      error: `Amount must be between ${min} and ${max}`,
    };
  }
  return { isValid: true };
}
