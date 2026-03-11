/**
 * Synapsis AI - Contact Form JavaScript
 * Handles form validation and submission
 * Ready for N8N integration
 */

(function() {
    'use strict';

    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;

    // Form fields
    const fields = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        company: document.getElementById('company'),
        service: document.getElementById('service'),
        message: document.getElementById('message')
    };

    // Error message elements
    const errors = {
        name: document.getElementById('name-error'),
        email: document.getElementById('email-error'),
        message: document.getElementById('message-error')
    };

    const formStatus = contactForm.querySelector('.form-status');

    // Validation rules
    const validators = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 100,
            message: 'Vul alstublieft uw naam in (minimaal 2 tekens)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Vul alstublieft een geldig emailadres in'
        },
        message: {
            required: true,
            minLength: 10,
            maxLength: 2000,
            message: 'Vul alstublieft een bericht in (minimaal 10 tekens)'
        }
    };

    /**
     * Validate a single field
     */
    function validateField(fieldName) {
        const field = fields[fieldName];
        const error = errors[fieldName];
        const rules = validators[fieldName];
        
        if (!field || !rules) return true;

        let isValid = true;
        let errorMessage = '';

        // Required check
        if (rules.required && !field.value.trim()) {
            isValid = false;
            errorMessage = rules.message;
        }

        // Min length check
        if (isValid && rules.minLength && field.value.trim().length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message;
        }

        // Max length check
        if (isValid && rules.maxLength && field.value.trim().length > rules.maxLength) {
            isValid = false;
            errorMessage = `Maximaal ${rules.maxLength} tekens toegestaan`;
        }

        // Pattern check
        if (isValid && rules.pattern && !rules.pattern.test(field.value.trim())) {
            isValid = false;
            errorMessage = rules.message;
        }

        // Update UI
        if (error) {
            error.textContent = errorMessage;
        }
        
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('valid');
        } else {
            field.classList.add('error');
            field.classList.remove('valid');
        }

        return isValid;
    }

    /**
     * Validate entire form
     */
    function validateForm() {
        let isValid = true;
        
        Object.keys(validators).forEach(fieldName => {
            if (!validateField(fieldName)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Clear all errors
     */
    function clearErrors() {
        Object.keys(errors).forEach(key => {
            if (errors[key]) {
                errors[key].textContent = '';
            }
        });

        Object.values(fields).forEach(field => {
            if (field) {
                field.classList.remove('error', 'valid');
            }
        });
    }

    /**
     * Generate personalized success message based on form data
     */
    function generatePersonalizedMessage(formData) {
        const firstName = formData.name.split(' ')[0];
        const serviceMessages = {
            'ai-advies': `Bedankt voor je interesse in AI advies, ${firstName}! We analyseren graag samen met jou hoe AI jouw werkprocessen kan optimaliseren. Je hoort binnen 24 uur van ons.`,
            'iot-automatisering': `Wat leuk dat je geïnteresseerd bent in IoT automatisering, ${firstName}! We kijken ernaar uit om jouw huis of kantoor slimmer te maken. We nemen snel contact met je op.`,
            'workflow-implementatie': `Super dat je klaar bent voor een complete workflow implementatie, ${firstName}! We gaan graag met je aan de slag om alles te realiseren. Tot snel!`,
            'overig': `Bedankt voor je bericht, ${firstName}! We hebben je vraag ontvangen en nemen binnen 24 uur contact met je op.`
        };
        
        return serviceMessages[formData.service] || serviceMessages['overig'];
    }

    /**
     * Show form status message
     */
    function showStatus(message, type) {
        if (!formStatus) return;
        
        formStatus.innerHTML = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';

        // Hide after 8 seconds for better readability
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 8000);
    }

    /**
     * Handle form submission
     */
    async function handleSubmit(e) {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        // Validate form
        if (!validateForm()) {
            // Focus first error field
            const firstError = contactForm.querySelector('.error');
            if (firstError) {
                firstError.focus();
            }
            return;
        }

        // Get form data
        const formData = {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            company: fields.company.value.trim(),
            service: fields.service.value,
            message: fields.message.value.trim(),
            timestamp: new Date().toISOString(),
            source: 'synapsisai.nl'
        };

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verzenden...';

        try {
            const N8N_WEBHOOK_URL = 'https://n8n.synapsisai.nl/webhook/ce351eca-b8a3-4f16-ab5f-e28fc949b105';
            
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Success - show personalized message
            const personalizedMessage = generatePersonalizedMessage(formData);
            showStatus(personalizedMessage, 'success');
            contactForm.reset();
            clearErrors();

        } catch (error) {
            console.error('Form submission error:', error);
            showStatus('Er is iets misgegaan. Probeer het later opnieuw of stuur een email naar info@synapsisai.nl', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // Event listeners
    contactForm.addEventListener('submit', handleSubmit);

    // Real-time validation on blur
    Object.keys(validators).forEach(fieldName => {
        const field = fields[fieldName];
        if (field) {
            field.addEventListener('blur', () => validateField(fieldName));
            field.addEventListener('input', () => {
                // Clear error on input
                if (field.classList.contains('error')) {
                    validateField(fieldName);
                }
            });
        }
    });

    // Sanitize input to prevent XSS
    Object.values(fields).forEach(field => {
        if (field) {
            field.addEventListener('input', (e) => {
                // Remove potentially dangerous characters
                e.target.value = e.target.value
                    .replace(/[<>]/g, '') // Remove < and >
                    .trimStart(); // Remove leading whitespace
            });
        }
    });

})();