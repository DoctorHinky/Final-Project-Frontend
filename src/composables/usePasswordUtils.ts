import { ref } from "vue";

// calculate password strength
export function usePasswordStrength(passwordRef: { value: string }) {
  const passwordStrength = ref(0);

  const calculateStrength = () => {
    const password = passwordRef.value;
    let strength = 0;

    if (!password) {
      passwordStrength.value = 0;
      return;
    }

    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (hasLowerCase) strength += 10;
    if (hasUpperCase) strength += 15;
    if (hasNumbers) strength += 15;
    if (hasSpecialChars) strength += 25;

    passwordStrength.value = Math.min(strength, 100);
  };

  return {
    passwordStrength,
    calculateStrength,
  };
}

// check confirm password
export function usePasswordMatch(passwordRef: { value: string }, confirmRef: { value: string }) {
  const match = ref<boolean | null>(null);

  const checkMatch = () => {
    if (!confirmRef.value) {
      match.value = null;
      return;
    }

    match.value = passwordRef.value === confirmRef.value;
  };

  return {
    passwordMatch: match,
    checkPasswordMatch: checkMatch,
  };
}
