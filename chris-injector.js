// cookie-injector.js (Core logic hosted on CDN)

// Function to detect user's country using an IP geolocation service
async function getUserCountry() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data.country_name; // This returns the country name
  } catch (error) {
    console.error("Failed to detect user country:", error);
    return null;
  }
}

// Function to randomly select 10% of the cookies from an array
function selectRandomCookies(cookies, percentage = 10) {
  const numOfCookiesToSelect = Math.ceil((cookies.length * percentage) / 100);
  const selectedCookies = [];

  // Randomly pick cookies
  while (selectedCookies.length < numOfCookiesToSelect) {
    const randomIndex = Math.floor(Math.random() * cookies.length);
    if (!selectedCookies.includes(cookies[randomIndex])) {
      selectedCookies.push(cookies[randomIndex]);
    }
  }

  return selectedCookies;
}

// Function to inject cookies into the user's browser, with a 2-day expiration
function injectCookies(cookies) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 2); // Set expiration to 2 days from now

  // Get the current domain dynamically
  const domain = window.location.hostname;

  cookies.forEach((cookie) => {
    const { name, value, path, secure, sameSite, httpOnly } = cookie;

    // Create the cookie string
    let cookieString = `${name}=${value}; path=${
      path || "/"
    }; domain=${domain};`;

    if (secure) {
      cookieString += " Secure;";
    }
    if (sameSite) {
      cookieString += ` SameSite=${sameSite};`;
    }
    if (httpOnly) {
      cookieString += " HttpOnly;";
    }

    // Set the expiration date to 2 days from now
    cookieString += ` Expires=${expirationDate.toUTCString()};`;

    // Inject the cookie
    document.cookie = cookieString;
  });
}

// Main function to detect country and inject cookies
async function applyCountrySpecificCookies(cookieConfig) {
  const country = await getUserCountry();

  if (!country) {
    console.log("Unable to detect country.");
    return;
  }

  console.log("Detected country:", country);

  const selectedCookies = cookieConfig[country.toLowerCase()] || [];

  if (selectedCookies.length === 0) {
    console.log(`No cookies defined for ${country}.`);
    return;
  }

  // Randomly select 10% of the cookies
  const randomCookies = selectRandomCookies(selectedCookies, 10);

  // Inject the randomly selected cookies with a 2-day expiration
  injectCookies(randomCookies);

  console.log("Injected cookies:", randomCookies);
}

// Allow user to call this with their cookie config
window.injectCountrySpecificCookiesByChris = function (cookieConfig) {
  const authorizedDomains = ["gistmat.com"];
  const currentDomain = window.location.hostname;
  const isAuthorized = authorizedDomains.some((domain) =>
    currentDomain.includes(domain)
  );
  console.log("Authorized:", isAuthorized);
  console.log;
  if (isAuthorized) {
    applyCountrySpecificCookies(cookieConfig);
  }
};
