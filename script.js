(function () {
  const googleForm = {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSc_yKzpq2oN2TrkVbabqHt-sLp7JoFVogA44P_cICwnPDYHgg/formResponse',
    emailEntry: 'entry.1427647174',
    featureEntry: 'entry.1237448058',
  };

  const form = document.getElementById('waitlistForm');
  const email = document.getElementById('email');
  const otherFeature = document.getElementById('otherFeature');
  const emailError = document.getElementById('emailError');
  const featureError = document.getElementById('featureError');
  const status = document.getElementById('formStatus');
  const submitButton = form?.querySelector('.submit-button');

  if (!form || !email || !otherFeature || !emailError || !featureError || !status || !submitButton) {
    return;
  }

  function selectedFeature() {
    return form.querySelector('input[name="feature"]:checked');
  }

  function toggleOtherField() {
    const selected = selectedFeature();
    const isOther = selected && selected.value === 'Other';
    otherFeature.classList.toggle('visible', Boolean(isOther));
    otherFeature.required = Boolean(isOther);
    if (!isOther) {
      otherFeature.value = '';
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener('change', function (event) {
    if (event.target && event.target.name === 'feature') {
      toggleOtherField();
      featureError.textContent = '';
    }
  });

  async function sendToGoogleForms(emailValue, featureValue, otherValue) {
    const formData = new FormData();
    const featureAnswer = featureValue === 'Other' ? otherValue : featureValue;

    formData.append(googleForm.emailEntry, emailValue);
    formData.append(googleForm.featureEntry, '__other_option__');
    formData.append(`${googleForm.featureEntry}.other_option_response`, featureAnswer);

    formData.append(`${googleForm.featureEntry}_sentinel`, '');
    formData.append('fvv', '1');
    formData.append('pageHistory', '0');
    formData.append('submissionTimestamp', String(Date.now()));

    await fetch(googleForm.action, {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
    });
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const emailValue = email.value.trim();
    const feature = selectedFeature();
    const otherValue = otherFeature.value.trim();
    let valid = true;

    emailError.textContent = '';
    featureError.textContent = '';
    status.textContent = '';
    status.className = 'form-status';

    if (!isValidEmail(emailValue)) {
      emailError.textContent = 'Enter a valid email address.';
      valid = false;
    }

    if (!feature) {
      featureError.textContent = 'Choose one feature.';
      valid = false;
    }

    if (feature && feature.value === 'Other' && !otherValue) {
      featureError.textContent = 'Tell us what you want to see.';
      valid = false;
    }

    if (!valid) {
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
      await sendToGoogleForms(emailValue, feature.value, otherValue);
      form.reset();
      toggleOtherField();
      status.textContent = 'Thanks. Your vote was saved.';
      status.className = 'form-status success';
    } catch (error) {
      status.textContent = 'Something went wrong. Please try again.';
      status.className = 'form-status';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Join Waitlist';
    }
  });

  toggleOtherField();
})();
