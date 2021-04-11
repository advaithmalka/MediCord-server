const handleSignup = (input) => {
  const errors = {};

  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  if (input.password === "") {
    errors.password = "Password is required";
  }

  if (input.username.trim() === "") {
    errors.username = "Username is required";
  }
  if (input.email.trim() === "") {
    errors.email = "Email is required";
  } else if (!input.email.match(emailRegex)) {
    errors.email = "Please provide a valid email address";
  }

  return errors;
};

const handleLogin = (input) => {
  const errors = {};

  if (input.username.trim() === "") {
    errors.username = "Username is required";
  }
  if (input.password === "") {
    errors.password = "Password is required";
  }
  return errors;
};

module.exports.handleSignup = handleSignup;
module.exports.handleLogin = handleLogin;
