import i18n from "@/i18n";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: i18n.t('auth.validation.passwordMinLength', { minLength }) };
  }
  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return { isValid: false, message: i18n.t('auth.validation.passwordComplexity') };
  }
  return { isValid: true, message: "" };
};  