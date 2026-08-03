import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, CheckCircle, AlertCircle } from 'lucide-react';

export const COUNTRIES = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', placeholder: '9876543210', digits: 10 },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', placeholder: '5550192834', digits: 10 },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', placeholder: '7911123456', digits: 10 },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', placeholder: '5550192834', digits: 10 },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', placeholder: '412345678', digits: 9 },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', placeholder: '1512345678', digits: 10 },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', placeholder: '612345678', digits: 9 },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬', placeholder: '81234567', digits: 8 },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', placeholder: '501234567', digits: 9 },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', placeholder: '501234567', digits: 9 },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', placeholder: '9012345678', digits: 10 },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷', placeholder: '1012345678', digits: 10 },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷', placeholder: '11912345678', digits: 11 },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽', placeholder: '5512345678', digits: 10 },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹', placeholder: '3123456789', digits: 10 },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸', placeholder: '612345678', digits: 9 },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱', placeholder: '612345678', digits: 9 },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭', placeholder: '781234567', digits: 9 },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪', placeholder: '701234567', digits: 9 },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿', placeholder: '211234567', digits: 9 },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾', placeholder: '123456789', digits: 9 },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩', placeholder: '8123456789', digits: 10 },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭', placeholder: '9123456789', digits: 10 },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', placeholder: '821234567', digits: 9 },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', placeholder: '8021234567', digits: 10 },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', placeholder: '712345678', digits: 9 },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', placeholder: '1001234567', digits: 10 },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱', placeholder: '501234567', digits: 9 },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳', placeholder: '13812345678', digits: 11 }
];

const CountryPhoneInput = ({
  value = '',
  onChange,
  name = 'phone',
  required = false,
  label = 'Mobile Phone Number',
  placeholder = ''
}) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default India +91
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [touched, setTouched] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Parse initial or prop value
  useEffect(() => {
    if (value && typeof value === 'string') {
      const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (matched) {
        setSelectedCountry(matched);
        const rawDigits = value.slice(matched.dialCode.length).replace(/\D/g, '').slice(0, matched.digits);
        setPhoneNumber(rawDigits);
      } else {
        const rawDigits = value.replace(/\D/g, '');
        setPhoneNumber(rawDigits.slice(0, selectedCountry.digits));
      }
    } else {
      setPhoneNumber('');
    }
  }, [value]);

  // Update input custom validity for HTML5 form submission guards
  useEffect(() => {
    if (inputRef.current) {
      if (phoneNumber.length === 0 && required) {
        inputRef.current.setCustomValidity(`Mobile number is required.`);
      } else if (phoneNumber.length > 0 && phoneNumber.length < selectedCountry.digits) {
        inputRef.current.setCustomValidity(`Please enter a valid ${selectedCountry.digits}-digit mobile number for ${selectedCountry.name}.`);
      } else {
        inputRef.current.setCustomValidity('');
      }
    }
  }, [phoneNumber, selectedCountry, required]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm('');
    // Truncate existing phone number to new country's digit limit
    const truncated = phoneNumber.slice(0, country.digits);
    setPhoneNumber(truncated);
    emitChange(country.dialCode, truncated, country.digits);
  };

  const handleNumberChange = (e) => {
    setTouched(true);
    // Restrict input to digits only (integers 0-9)
    const digitsOnly = e.target.value.replace(/\D/g, '');
    const truncated = digitsOnly.slice(0, selectedCountry.digits);
    setPhoneNumber(truncated);
    emitChange(selectedCountry.dialCode, truncated, selectedCountry.digits);
  };

  const emitChange = (dialCode, num, expectedDigits) => {
    const isValid = num.length === expectedDigits;
    const fullValue = num ? `${dialCode} ${num}` : '';
    if (onChange) {
      onChange({
        target: {
          name,
          value: fullValue,
          dialCode,
          phoneNumber: num,
          countryCode: selectedCountry.code,
          isValid,
          expectedDigits
        }
      });
    }
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dialCode.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isValidLength = phoneNumber.length === selectedCountry.digits;
  const isTooShort = phoneNumber.length > 0 && phoneNumber.length < selectedCountry.digits;
  const showError = (touched || phoneNumber.length > 0) && isTooShort;

  return (
    <div className="country-phone-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && <label className="input-label" style={{ marginBottom: 0 }}>{label} {required && '*'}</label>}
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: '600',
            color: isValidLength ? 'var(--success)' : showError ? 'var(--danger)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {isValidLength && <CheckCircle size={13} color="var(--success)" />}
          {showError && <AlertCircle size={13} color="var(--danger)" />}
          {phoneNumber.length} / {selectedCountry.digits} digits ({selectedCountry.name})
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }} ref={dropdownRef}>
        {/* Country Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.75rem 0.85rem',
            background: 'var(--bg-surface)',
            border: `1px solid ${isValidLength ? 'var(--success)' : showError ? 'var(--danger)' : 'var(--border-glass)'}`,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease'
          }}
          title="Select Country"
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{selectedCountry.flag}</span>
          <span>{selectedCountry.dialCode}</span>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '290px',
              maxHeight: '300px',
              zIndex: 9999,
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.18)'
            }}
          >
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.6rem', border: '1px solid var(--border-glass)', borderRadius: '8px', background: 'var(--bg-card-hover)' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search country or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  width: '100%',
                  fontSize: '0.85rem'
                }}
                autoFocus
              />
            </div>

            {/* Country List */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '4px' }}>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      padding: '0.5rem 0.6rem',
                      borderRadius: '8px',
                      background: selectedCountry.code === c.code ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      textAlign: 'left',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
                      <span style={{ fontWeight: selectedCountry.code === c.code ? '700' : '500' }}>{c.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.digits} digits</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>{c.dialCode}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ padding: '0.8rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Phone Number Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            name={name}
            className="input-field"
            placeholder={placeholder || `e.g. ${selectedCountry.placeholder}`}
            value={phoneNumber}
            onChange={handleNumberChange}
            onBlur={() => setTouched(true)}
            maxLength={selectedCountry.digits}
            minLength={selectedCountry.digits}
            pattern={`\\d{${selectedCountry.digits}}`}
            required={required}
            style={{
              width: '100%',
              borderColor: isValidLength ? 'var(--success)' : showError ? 'var(--danger)' : undefined,
              background: showError ? 'rgba(220, 38, 38, 0.03)' : undefined
            }}
          />
        </div>
      </div>

      {/* Explicit Inline Error Message when digits are less than required */}
      {showError && (
        <div
          className="animate-fade-in"
          style={{
            fontSize: '0.8rem',
            color: 'var(--danger)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginTop: '2px'
          }}
        >
          <AlertCircle size={14} color="var(--danger)" />
          <span>Invalid number length! Enter a valid {selectedCountry.digits}-digit mobile number for {selectedCountry.name}.</span>
        </div>
      )}
    </div>
  );
};

export default CountryPhoneInput;
