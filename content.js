// Add CSS for userbadge-tag and aditem-details
const style = document.createElement('style');
style.innerHTML = `
  .aditem-details .userbadge-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    margin-bottom: 8px;
    height: 20px;
    border-radius: 12px;
    font-size: 12px;
    box-sizing: border-box;
    color: #fff;
  }
  .userbadge-tag.zufriedenheit-top, .userbadge-tag.freundlichkeit-besonders, .userbadge-tag.zuverlaessigkeit-besonders { background-color: #28A745; }
  .userbadge-tag.zufriedenheit-ok, .userbadge-tag.freundlichkeit-sehr, .userbadge-tag.zuverlaessigkeit-sehr { background-color: #FFC107; }
  .userbadge-tag.zufriedenheit-naja, .userbadge-tag.freundlichkeit, .userbadge-tag.zuverlaessigkeit { background-color: #DC3545; }
`;
document.head.appendChild(style);

// Function to remove unwanted elements
function removeUnwantedElements() {
  // Remove all <a> elements with target="_blank"
  document.querySelectorAll('a').forEach(link => {
    if (link.getAttribute('target') === '_blank') {
      link.remove();
    }
  });

  // Remove <span> elements that are advertising badges
  document.querySelectorAll('span.jsx-1055761795.Badge.Badge-advertisement.Badge-transparent').forEach(span => {
    if (span.textContent.includes('Anzeige')) {
      span.remove();
    }
  });

  // Remove <div> elements with id="banner-skyscraper" and class="sticky-advertisement"
  document.querySelectorAll('div#banner-skyscraper.sticky-advertisement').forEach(div => {
    div.remove();
  });

  // Remove <div> elements with id="lsrp-sky-atf-left" and class="l-container liberty-filled"
  document.querySelectorAll('div#lsrp-sky-atf-left.l-container.liberty-filled').forEach(div => {
    div.remove();
  });

  document.querySelectorAll('div#jsx-2023474509 skyscraper-header-container').forEach(div => {
    div.remove();
  });

  document.querySelectorAll('div#jsx-2023474509 skyscraper-container').forEach(div => {
    div.remove();
  });

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.getAttribute('fetchpriority') !== 'low') {
      if (img.parentElement.className !== 'itemtile-header') {
        img.remove();
      }
    }
  });

  document.querySelectorAll('div[id="vip-billboard"]').forEach(div => {
    div.remove();
  });

  document.querySelectorAll('div[data-liberty-position-name="home-billboard"]').forEach(div => {
    div.remove();
  });

  document.querySelectorAll('div[id="viewad-details"]').forEach(div => {
    div.remove();
  });
}

function AIChatting() {
  if (window.location.href.startsWith('https://www.kleinanzeigen.de/m-nachrichten.html?conversationId=')) {
    const startTime = Date.now();
    const timeout = 20000; // 20 seconds

    function findMessageList() {
      const messageList = document.querySelector('ul[class*="MessageList"]');
      if (messageList) {
      messageList.querySelectorAll('li[data-testid]').forEach(li => {
        const dataTestIddiv = li.querySelector('div > div > div')
        const dataTestId = dataTestIddiv.getAttribute('data-testid');
        const textDiv = li.querySelector('div > div > div > div');
        if (textDiv) {
          if(dataTestId === 'OUTBOUND') {
            role = 'mir';
          } else {
            role = 'Verkäufer';
          }
          console.log(`Nachricht von ${role}: \n${textDiv.textContent}`);
        }
      });
      } else if (Date.now() - startTime < timeout) {
      setTimeout(findMessageList, 100); // Retry after 100ms
      } else {
      console.log('Message list not found');
      }
    }

    findMessageList();
  }
}

// Function to fetch links and create a new card with text from specified span elements
function fetchAndCreateAditemDetails() {
  if (window.location.href.startsWith('https://www.kleinanzeigen.de/s-')) {
    const fetchedLinks = new Set();
    document.querySelectorAll('article.aditem').forEach(article => {
      const link = article.querySelector('a');
      if (link && !fetchedLinks.has(link.href)) {
        fetchedLinks.add(link.href);

        // Fetch the link and create a new card with the text of the specified span elements
        fetch(link.href)
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const spanSelectors = [
              'span.text-body-regular-strong.text-force-linebreak.userprofile-vip',
              'span.userbadges-vip.userbadges-profile-rating',
              'span.userbadges-vip.userbadges-profile-friendliness',
              'span.userbadges-vip.userbadges-profile-reliability'
            ];
            const result = {};
            spanSelectors.forEach(selector => {
              const span = doc.querySelector(selector);
              if (span) {
                result[selector] = span.textContent;
              }
            });

            // Get both spans with class "userprofile-vip-details-text"
            const userProfileDetails = [];
            doc.querySelectorAll('span.userprofile-vip-details-text').forEach(span => {
              userProfileDetails.push(span.textContent);
            });

            // Determine badge classes based on text content
            const getBadgeClass = (text, type) => {
              if (type === 'zufriedenheit') {
                if (text.includes('TOP')) return 'zufriedenheit-top';
                if (text.includes('OK')) return 'zufriedenheit-ok';
                if (text.includes('NA JA')) return 'zufriedenheit-naja';
              } else if (type === 'freundlichkeit') {
                if (text.includes('Besonders')) return 'freundlichkeit-besonders';
                if (text.includes('Sehr')) return 'freundlichkeit-sehr';
                return 'freundlichkeit';
              } else if (type === 'zuverlaessigkeit') {
                if (text.includes('Besonders')) return 'zuverlaessigkeit-besonders';
                if (text.includes('Sehr')) return 'zuverlaessigkeit-sehr';
                return 'zuverlaessigkeit';
              }
              return '';
            };

            // Evaluate seller safety
            const badges = [
              result['span.userbadges-vip.userbadges-profile-rating'],
              result['span.userbadges-vip.userbadges-profile-friendliness'],
              result['span.userbadges-vip.userbadges-profile-reliability']
            ].filter(Boolean);
            const accountCreationDate = userProfileDetails[0] || '';

            // Check for secure payment badge
            const securePaymentBadge = doc.querySelector('div.viewad-secure-payment-badge');
            if (securePaymentBadge !== null) { console.log("Secure Payment Badge found"); }

            // Hide the article if zufriedenheid is None or empty
            if (!result['span.userbadges-vip.userbadges-profile-rating'] || !result['span.userbadges-vip.userbadges-profile-rating'].includes('TOP')) {
              //article.style.display = 'none';
              return;
            }

            // Create a new card with the fetched information
            const newCard = document.createElement('div');
            newCard.className = 'aditem-details';
            newCard.innerHTML = `
              <div class="aditem-main">
                <div class="aditem-main--top">
                  <div class="aditem-main--top--left">
                    <strong>${result['span.text-body-regular-strong.text-force-linebreak.userprofile-vip'] || 'No Name'} | ${userProfileDetails[1] || ''} | ${userProfileDetails[0] || ''}</strong>
                  </div>
                </div>
                <div class="aditem-main--middle">
                  <p class="aditem-main--middle--description">
                  ${result['span.userbadges-vip.userbadges-profile-rating'] ? `<span class="userbadge-tag ${getBadgeClass(result['span.userbadges-vip.userbadges-profile-rating'], 'zufriedenheit')}">${result['span.userbadges-vip.userbadges-profile-rating']}</span>` : ''}
                  ${result['span.userbadges-vip.userbadges-profile-friendliness'] ? `<span class="userbadge-tag ${getBadgeClass(result['span.userbadges-vip.userbadges-profile-friendliness'], 'freundlichkeit')}">${result['span.userbadges-vip.userbadges-profile-friendliness']}</span>` : ''}
                  ${result['span.userbadges-vip.userbadges-profile-reliability'] ? `<span class="userbadge-tag ${getBadgeClass(result['span.userbadges-vip.userbadges-profile-reliability'], 'zuverlaessigkeit')}">${result['span.userbadges-vip.userbadges-profile-reliability']}</span>` : ''}
                  ${securePaymentBadge ? `<div class="secure-payment-badge">${securePaymentBadge.firstElementChild.outerHTML}</div>` : ''}
                  </p>
                </div>
              </div>
            `;
            //<p class="safety-score">Safety Score: ${safetyScore}</p>
            article.parentElement.insertBefore(newCard, article.nextSibling);
          })
          .catch(error => console.error('Error fetching link:', error));
      }
    });
  }
}

// Function to set a cookie
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get a cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Set up a Mutation Observer to monitor changes to the DOM
const observer = new MutationObserver(() => {
  removeUnwantedElements();
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true, // Watch for added/removed child nodes
  subtree: true    // Watch the entire subtree of the body
});

window.addEventListener('load', () => {
  removeUnwantedElements();
  fetchAndCreateAditemDetails();
  AIChatting();

  // Add new text with checkbox to toggle the zufriedenheit option
  const sortingDiv = document.querySelector('div.srchresult-sorting');
  if (sortingDiv) {
    const toggleContainer = document.createElement('div');
    toggleContainer.style.marginTop = '10px';
    toggleContainer.style.display = 'flex';
    toggleContainer.style.alignItems = 'center';
    toggleContainer.style.cursor = 'pointer';

    const toggleCheckbox = document.createElement('input');
    toggleCheckbox.type = 'checkbox';
    toggleCheckbox.id = 'zufriedenheit-toggle-checkbox';
    toggleCheckbox.style.marginRight = '5px';

    const toggleLabel = document.createElement('label');
    toggleLabel.htmlFor = 'zufriedenheit-toggle-checkbox';
    toggleLabel.textContent = 'Zufriedenheit anzeigen';

    toggleContainer.appendChild(toggleCheckbox);
    toggleContainer.appendChild(toggleLabel);
    sortingDiv.parentElement.insertBefore(toggleContainer, sortingDiv.nextSibling);

    // Set checkbox state from cookie
    const checkboxState = getCookie('zufriedenheitToggle');
    if (checkboxState === 'true') {
      toggleCheckbox.checked = true;
      toggleLabel.textContent = 'Zufriedenheit ausblenden';
    }

    toggleCheckbox.addEventListener('change', () => {
      const adItems = document.querySelectorAll('article.aditem');
      adItems.forEach(article => {
        const ratingSpan = article.querySelector('span.userbadges-vip.userbadges-profile-rating');
        if (ratingSpan) {
          if (toggleCheckbox.checked) {
            ratingSpan.style.display = 'inline';
            toggleLabel.textContent = 'Zufriedenheit ausblenden';
            setCookie('zufriedenheitToggle', 'true', 7);
          } else {
            ratingSpan.style.display = 'none';
            toggleLabel.textContent = 'Zufriedenheit anzeigen';
            setCookie('zufriedenheitToggle', 'false', 7);
          }
        }
      });
    });
  }
});