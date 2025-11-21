class AccountLoginActions extends HTMLElement {
    shopLoginButton = null;
  
    connectedCallback() {
      this.shopLoginButton = this.querySelector('shop-login-button');
  
      if (this.shopLoginButton) {
        // ---- YOUR CUSTOM LOGIN VALIDATION HERE ----
        this.shopLoginButton.addEventListener('click', async (e) => {
          const emailInput = document.querySelector('input[type="email"]');
          if (!emailInput) return; // no email input found
  
          const email = emailInput.value.trim();
  
          if (!email) return; // Shopify will handle empty fields
  
          // Call your backend to check if customer exists + tag status
          const response = await fetch("https://verification-production-0749.up.railway.app/api/check-customer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
  
          const data = await response.json();
  
          if (!data.allowed) {
            // stop Shopify from sending magic link
            e.stopImmediatePropagation();
            e.preventDefault();
  
            alert(data.message || "This email is not approved for login.");
            return;
          }
  
          // else let Shopify proceed normally
        });
        // ---- END CUSTOM CODE ----
  
        // Shopify button setup
        this.shopLoginButton.setAttribute('full-width', 'true');
        this.shopLoginButton.setAttribute('persist-after-sign-in', 'true');
        this.shopLoginButton.setAttribute('analytics-context', 'loginWithShopSelfServe');
        this.shopLoginButton.setAttribute('flow-version', 'account-actions-popover');
        this.shopLoginButton.setAttribute('return-uri', window.location.href);
  
        this.shopLoginButton.addEventListener('completed', () => {
          window.location.reload();
        });
      }
    }
  }
  
  if (!customElements.get('account-login-actions')) {
    customElements.define('account-login-actions', AccountLoginActions);
  }
  