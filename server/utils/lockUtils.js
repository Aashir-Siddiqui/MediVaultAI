// utils/lockUtils.js
export const isAccountLocked = (user) => {
  if (!user) return false;
  return user.lockUntil && user.lockUntil > Date.now();
};

// reset counters on successful login
export const resetLoginFailures = async (user) => {
  user.failedLoginAttempts = 0;
  user.lockUntil = 0;
  await user.save();
};
