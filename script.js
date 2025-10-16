(function formValidation() {
  const q = sel => document.querySelector(sel);
  const qa = sel => Array.from(document.querySelectorAll(sel));

  function digitsOnly(str) {
    return str.replace(/\D+/g, '');
  }

  const cardNumberInput = q('#card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', () => {
      const digits = digitsOnly(cardNumberInput.value).slice(0, 16);
      const grouped = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
      cardNumberInput.value = grouped;
      cardNumberInput.closest('.field')?.classList.remove('error');
      cardNumberInput.closest('.field')?.removeAttribute('data-error');
    });
  }

  const expInput = q('#exp-date');
  if (expInput) {
    expInput.addEventListener('input', () => {
      let digits = digitsOnly(expInput.value).slice(0, 4);
      if (digits.length === 1) {
        const d = parseInt(digits, 10);
        if (d > 1) digits = '0' + digits;
      }

      let mm = digits.slice(0, 2);
      let yy = digits.slice(2);

      if (mm.length === 2) {
        let mVal = parseInt(mm, 10);
        if (mVal < 1) mVal = 1;
        if (mVal > 12) mVal = 12;
        mm = String(mVal).padStart(2, '0');
      }

      expInput.value = yy.length ? `${mm} / ${yy}` : (mm ? `${mm} / ` : '');
      expInput.closest('.field')?.classList.remove('error');
      expInput.closest('.field')?.removeAttribute('data-error');
    });
  }

  const cvvInput = q('#sec-code');
  if (cvvInput) {
    cvvInput.addEventListener('input', () => {
      cvvInput.value = digitsOnly(cvvInput.value).slice(0, 4);
      cvvInput.closest('.field')?.classList.remove('error');
      cvvInput.closest('.field')?.removeAttribute('data-error');
    });
  }

  const paypalEmail = q('#paypal-email');
  if (paypalEmail) {
    paypalEmail.addEventListener('input', () => {
      paypalEmail.closest('.field')?.classList.remove('error');
      paypalEmail.closest('.field')?.removeAttribute('data-error');
    });
  }

  function clearErrors(fields) {
    fields.forEach(f => {
      f.classList.remove('error');
      f.removeAttribute('data-error');
    });
  }

  function markErrors(inputs, message) {
    inputs.forEach(input => {
      const wrapper = input.closest('.field') || input;
      wrapper.classList.add('error');
      wrapper.setAttribute('data-error', message || 'Required');
    });
  }

  function requiredEmpty(inputs) {
    return inputs.filter(input => !input.value.trim());
  }

  function validateCard() {
    const numberEl = q('#card-number');
    const expEl = q('#exp-date');
    const cvvEl = q('#sec-code');

    clearErrors(qa('.card-grid .field'));

    const empties = requiredEmpty([numberEl, expEl, cvvEl]);
    if (empties.length) {
      markErrors(empties);
      return false;
    }

    const digits = (numberEl.value || '').replace(/\s+/g, '');
    if (!/^\d{16}$/.test(digits)) {
      markErrors([numberEl], 'Invalid card number');
      return false;
    }

    const m = (expEl.value || '').match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m) {
      markErrors([expEl], 'Use MM / YY');
      return false;
    }
    const mm = parseInt(m[1], 10);
    if (mm < 1 || mm > 12) {
      markErrors([expEl], 'Month 01–12');
      return false;
    }

    if (!/^\d{3,4}$/.test(cvvEl.value || '')) {
      markErrors([cvvEl], '3–4 digits');
      return false;
    }
    return true;
  }

  function validatePaypal() {
    const email = q('#paypal-email');
    clearErrors(qa('.paypal-grid .field'));
    if (!email || !email.value.trim()) {
      markErrors([email]);
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.value.trim())) {
      markErrors([email], 'Wrong email format');
      return false;
    }
    return true;
  }

  const methods = qa('.method-type');
  const cardInfo = q('.card-info');
  const paypalInfo = q('.paypal-info');

  methods.forEach(m => {
    m.addEventListener('click', () => {
      methods.forEach(x => {
        x.classList.remove('is-active');
        x.setAttribute('aria-checked', 'false');
      });
      m.classList.add('is-active');
      m.setAttribute('aria-checked', 'true');

      if (m.dataset.method === 'card') {
        cardInfo.style.display = '';
        paypalInfo.style.display = 'none';
        paypalInfo.setAttribute('aria-hidden', 'true');
      } else {
        cardInfo.style.display = 'none';
        paypalInfo.style.display = '';
        paypalInfo.setAttribute('aria-hidden', 'false');
      }
    });

    m.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        m.click();
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = methods.indexOf(m);
        const next = methods[(idx + 1) % methods.length];
        next.focus();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = methods.indexOf(m);
        const prev = methods[(idx - 1 + methods.length) % methods.length];
        prev.focus();
      }
    });
  });

  const buyNow = q('#buy-now');
  const needHelp = document.querySelector('.need-help p');
  if (needHelp) {
    needHelp.addEventListener('click', () => {
      alert('The page is not yet ready.');
    });
  }

  buyNow.addEventListener('mousedown', () => {
    buyNow.style.transform = 'scale(0.97)';
    buyNow.style.filter = 'brightness(0.95)';
  });
  buyNow.addEventListener('mouseup', () => {
    buyNow.style.transform = 'scale(1)';
    buyNow.style.filter = 'none';
  });
  buyNow.addEventListener('click', (e) => {
    e.preventDefault();

    const activeMethod = q('.method-type.is-active');
    if (!activeMethod) return;

    if (activeMethod.dataset.method === 'card') {
      if (!validateCard()) return;
    } else {
      if (!validatePaypal()) return;
    }

    alert('Oops! Something went wrong.');
  });

})();
